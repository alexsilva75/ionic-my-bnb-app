import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Plugins } from '@capacitor/core'
import { User } from './user.model';


export interface AuthResponseData {
  kind: string
  idToken: string
  email: string
  refreshToken: string
  localId: string
  expiresIn: string
  registered?: boolean
}

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy{
  private _user = new BehaviorSubject<User>(null)
  // private _userIsAuthenticated = false
  private _userId = null
  //private _token = new BehaviorSubject<string>(null)
  private activeLogoutTimer: any

  get userIsAuthenticated() {
    return this._user.asObservable().pipe(map(user => {
      if (user) {
        return !!user.token
      }
      return false

    }))
  }

  get userId() {
    return this._user.asObservable().pipe(map(user => {
      if (user) {
        return user.id

      }
      return null

    }
    ))
  }

  constructor(private http: HttpClient) { }

  get token(){
    return this._user.asObservable().pipe(map(user => {
      if (user) {
        return user.token

      }
      return null

    }
    ))
  }

  ngOnDestroy(): void {
    if(this.activeLogoutTimer){
      clearTimeout(this.activeLogoutTimer)
    }
  }

  autoLogin() {
    return from(Plugins.Storage.get({ key: 'authData' })).pipe(map(storedData => {
      if (!storedData || !storedData.value) {
        return null
      }
      const parseData = JSON.parse(storedData.value) as {
        token: string,
        tokenExpirationDate: string,
        userId: string,
        email: string
      }
      const expirationTime = new Date(parseData.tokenExpirationDate)

      if(expirationTime <= new Date()){
        return null
      }

      const user = new User(
        parseData.userId,
        parseData.email,
        parseData.token,
        expirationTime

      )

      return user

    }),
    tap(user =>{
      if(user){
        this._user.next(user)
        this.autoLogout(user.tokenDuration)
      }
    }),
    map(user =>{
      return !!user
    })
    )
  }

  singup(email: string, password: string) {
    return this.http.post<AuthResponseData>(environment.signupUrl, {
      email,
      password,
      returnSecureToken: true
    }
    ).pipe(tap(response => {
      return this.setUserData(response)
    }))


  }

  login(email: string, password: string) {
    return this.http.post<AuthResponseData>(environment.loginUrl,
      { email, 
        password,
        returnSecureToken: true
      }).pipe(tap(
        this.setUserData
      ))

  }



  logout() {
    //this._userIsAuthenticated = false
    if(this.activeLogoutTimer){
      clearTimeout(this.activeLogoutTimer)
    }

    this._user.next(null)
    Plugins.Storage.remove({key: 'authData'})
  }

  private autoLogout(duration: number){
    if(this.activeLogoutTimer){
      clearTimeout(this.activeLogoutTimer)
    }

    this.activeLogoutTimer = setTimeout(() => this.logout(), duration)
  }


  private setUserData = (response: AuthResponseData) => {
    const expirationTime = new Date().getTime() + +response.expiresIn * 1000
    const user = new User(
      response.localId,
      response.email,
      response.idToken,
      new Date(expirationTime)
    )
    this._user.next(user)
    this.autoLogout(user.tokenDuration)

    this.storeAuthData(
      response.localId,
      response.email,
      response.idToken,
      expirationTime.toString())
  }

  private storeAuthData(userId: string, email: string, token: string, tokenExpirationDate: string) {

    const data = JSON.stringify({
      userId,
      email,
      token,
      tokenExpirationDate
    })

    Plugins.Storage.set({
      key: 'authData',
      value: data
    })
  }
}
