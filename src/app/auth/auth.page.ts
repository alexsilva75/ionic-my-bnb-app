import { Observable } from 'rxjs';
import { AuthService, AuthResponseData } from './auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  isLoading = false
  isLogin = true

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
  }

  onSubmit(authForm: NgForm) {
    if (!authForm.valid) {
      return
    }

    const email = authForm.value.email
    const password = authForm.value.password

    this.authenticate(email, password)
    authForm.reset()

  }


  onSignup() {

  }

  private showAlert(message: string) {
    this.alertController.create({
      header: 'Authentication failed',
      message,
      buttons: ['Okay']
    }).then(alertEl => {
      alertEl.present()
    },
    )
  }

  authenticate(email: string, password: string) {
    this.isLoading = true


    this.loadingController
      .create(
        {
          keyboardClose: true,
          message: 'Logging in...'
        })
      .then(loadingEl => {
        loadingEl.present()
        let authObs: Observable<AuthResponseData>

        if (this.isLogin) {
          authObs = this.authService.login(email, password)
            
        }else{
          authObs = this.authService.singup(email, password)
        }
       
          authObs.subscribe(response => {
            //console.log(response)

            this.isLoading = false
            loadingEl.dismiss()
            this.router.navigateByUrl('/places/tabs/discover')

          }, errorResponse => {

            loadingEl.dismiss()
            const code = errorResponse.error.error.message

            let message = 'Could not sign you up, please try again.'

            if (code === 'EMAIL_EXISTS') {
              message = 'This email address already exists!'
            }else if( code ==='EMAIL_NOT_FOUND'){
              message = 'E-mail and/or password invalid!'
            }else if(code === 'INVALID_PASSWORD'){
              message = 'E-mail and/or password invalid!'
            }

            this.showAlert(message)

          })
      

      })

  }

  onLogout() {
    this.authService.logout()
  }

  onSwitchAuthMode() {
    this.isLogin = !this.isLogin
  }
}
