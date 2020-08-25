import { GOOGLE_API_KEY, GOOGLE_FIREBASE_URL } from './../../secret';
import { AuthService } from './../auth/auth.service';
import { Place } from './place.model';
import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { PlaceLocation } from './location.model';

interface PlaceData {
  availableFrom: string
  availableTo: string
  description: string
  imageUrl: string
  price: number
  title: string
  userId: string
  location: PlaceLocation
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([])


  get places() {
    return this._places.asObservable()
  }

  // fetchPlaces(){
  //   return this.http
  //   .get(`${GOOGLE_FIREBASE_URL}/offered-places.json`)
  //   .pipe(tap(response => {
  //     this.places.pipe(take(1)).subscribe(places=>{
  //       const fetchedPlaces = []
  //       for(let key in response){
  //         fetchedPlaces.push(response[key])
  //       }

  //       this._places.next(places.concat(fetchedPlaces))
  //     })
  //   }))
  // }

  fetchPlaces() {

    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http
      .get<{ [key: string]: PlaceData }>(`${GOOGLE_FIREBASE_URL}/offered-places.json?auth=${token}`)
      }),
      map(response => {
        const fetchedPlaces = []
        for (let key in response) {
          if (response.hasOwnProperty(key)) {
            fetchedPlaces.push(
              new Place(
                key,
                response[key].title,
                response[key].description,
                response[key].imageUrl,
                response[key].price,
                new Date(response[key].availableFrom),
                new Date(response[key].availableTo),
                response[key].userId,
                response[key].location
              )
            )
          }
        }
        return fetchedPlaces
      }),
      tap(fetchedPlaces => {

        return this._places.next(fetchedPlaces)

      })

    )
    // return this.http
    //   .get<{ [key: string]: PlaceData }>(`${GOOGLE_FIREBASE_URL}/offered-places.json?auth`)
    //   .pipe(map(response => {
    //     const fetchedPlaces = []
    //     for (let key in response) {
    //       if (response.hasOwnProperty(key)) {
    //         fetchedPlaces.push(
    //           new Place(
    //             key,
    //             response[key].title,
    //             response[key].description,
    //             response[key].imageUrl,
    //             response[key].price,
    //             new Date(response[key].availableFrom),
    //             new Date(response[key].availableTo),
    //             response[key].userId,
    //             response[key].location
    //           )
    //         )
    //       }
    //     }
    //     return fetchedPlaces
    //   }), tap(fetchedPlaces => {

    //     return this._places.next(fetchedPlaces)

    //   }))
  }

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) { }

  getPlace(id: string) {

    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.get<PlaceData>(`${GOOGLE_FIREBASE_URL}/offered-places/${id}.json?auth=${token}`)
      }),
      map(response => {

        console.log('Response: ', response)

        const key = Object.keys(response)[0]

        const fetchedPlace = new Place(
          id,
          response.title,
          response.description,
          response.imageUrl,
          response.price,
          new Date(response.availableFrom),
          new Date(response.availableTo),
          response.userId,
          response.location
        )

        return fetchedPlace
      })
    )
    // return this.http.get<PlaceData>(`${GOOGLE_FIREBASE_URL}/offered-places/${id}.json`)
    //   .pipe(map(response => {

    //     console.log('Response: ', response)

    //     const key = Object.keys(response)[0]

    //     const fetchedPlace = new Place(
    //       id,
    //       response.title,
    //       response.description,
    //       response.imageUrl,
    //       response.price,
    //       new Date(response.availableFrom),
    //       new Date(response.availableTo),
    //       response.userId,
    //       response.location
    //     )

    //     return fetchedPlace
    //   }))
    // return this.places.pipe(take(1), map(places => {
    //   return { ...places.find(p => p.id === id) }
    // })

    // )

  }

  uploadImage(image: File){
    const uploadData = new FormData()
    uploadData.append('image' , image)

    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.post<{imageUrl: string, imagePath: string}>('', 
        uploadData,
         {headers: {Authorization: `Bearer ${token}`}})
      })
    )

    
      
  }

  addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date,
    location: PlaceLocation
  ) {


    let newPlace: Place
    let token : string

    return this.authService.token.pipe(take(1),
      switchMap(stateToken => {
        token = stateToken
        return this.authService.userId
      }),
      take(1),
      switchMap(userId => {
        if(!userId){
          throw new Error('No user id found.')
        }
  
        newPlace = new Place(
          Math.random().toString(),
          title,
          description,
          'https://i.pinimg.com/originals/18/30/b1/1830b1e06b0d68f0cab6809609ddc4cf.jpg',
          price,
          dateFrom,
          dateTo,
          userId,
          location
        )
  
        return this.http
        .post<{ name: string }>(`${GOOGLE_FIREBASE_URL}/offered-places.json?auth=${token}`,
          { ...newPlace, id: null })
      }),
      switchMap(response => {
        newPlace.id = response.name
        return this.places
      }), take(1),
        tap((places) => {
          this._places.next(places.concat(newPlace))
        })

    )

    // return this.authService.userId.pipe(take(1),switchMap(userId => {
    //   if(!userId){
    //     throw new Error('No user id found.')
    //   }

    //   newPlace = new Place(
    //     Math.random().toString(),
    //     title,
    //     description,
    //     'https://i.pinimg.com/originals/18/30/b1/1830b1e06b0d68f0cab6809609ddc4cf.jpg',
    //     price,
    //     dateFrom,
    //     dateTo,
    //     userId,
    //     location
    //   )

    //   return this.http
    //   .post<{ name: string }>(`${GOOGLE_FIREBASE_URL}/offered-places.json`,
    //     { ...newPlace, id: null })
    // }),switchMap(response => {
    //   newPlace.id = response.name
    //   return this.places
    // }), take(1),
    //   tap((places) => {
    //     this._places.next(places.concat(newPlace))
    //   })
   
//)

    

    

    //console.log('Adding a new Place:', newPlace)
    // return this.places.pipe(take(1), delay(1000),tap((places) => {  
    //     this._places.next(places.concat(newPlace))

    // }))

  }

  updateOffer(
    placeId: string,
    title: string,
    description: string
  ) {

    let updatedPlaces: Place[] = []
    let token 
    return this.authService.token.pipe(
      take(1),
      switchMap(fetchedToken => {
        token = fetchedToken

        return this.places
      }),
      take(1),
      switchMap(places => {
        if (!places || places.length <= 0) {
          return this.fetchPlaces()
        } else {
          return of(places)
        }
        // return this._places.next(updatedPlaces)
      }),
      switchMap(places => {
        const updatedPlaceIndex = places.findIndex(place => place.id === placeId)
        updatedPlaces = [...places]
        const oldPlace = updatedPlaces[updatedPlaceIndex]

        const updatedPlace = new Place(oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId,
          oldPlace.location
        )

        updatedPlaces[updatedPlaceIndex] = updatedPlace

        return this.http.put(`${GOOGLE_FIREBASE_URL}/offered-places/${placeId}.json?auth=${token}`,
          { ...updatedPlace, id: null })
      }),
      tap(() => {
        this._places.next(updatedPlaces)
      })
      ) 

    // return this.places.pipe(
    //   take(1), switchMap(places => {
    //     if (!places || places.length <= 0) {
    //       return this.fetchPlaces()
    //     } else {
    //       return of(places)
    //     }
    //     // return this._places.next(updatedPlaces)
    //   }), switchMap(places => {
    //     const updatedPlaceIndex = places.findIndex(place => place.id === placeId)
    //     updatedPlaces = [...places]
    //     const oldPlace = updatedPlaces[updatedPlaceIndex]

    //     const updatedPlace = new Place(oldPlace.id,
    //       title,
    //       description,
    //       oldPlace.imageUrl,
    //       oldPlace.price,
    //       oldPlace.availableFrom,
    //       oldPlace.availableTo,
    //       oldPlace.userId,
    //       oldPlace.location
    //     )

    //     updatedPlaces[updatedPlaceIndex] = updatedPlace

    //     return this.http.put(`${GOOGLE_FIREBASE_URL}/offered-places/${placeId}.json`,
    //       { ...updatedPlace, id: null })
    //   }), tap(() => {
    //     this._places.next(updatedPlaces)
    //   }))

  }
}
