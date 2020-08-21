import { AuthService } from './auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
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
    private loadingController: LoadingController
    ) { }

  ngOnInit() {
  }

  onSubmit(authForm: NgForm){
    if(!authForm.valid){
      return
    }

    const email = authForm.value.email
    const password = authForm.value.password

    console.log(email, password)
    
    if(this.isLogin){

    }else{

    }

  }
  onLogin(){
    this.isLoading = true
    this.authService.login()

    this.loadingController
    .create(
      {keyboardClose: true,
       message: 'Logging in...'})
    .then(loadingEl => {
      loadingEl.present()

      setTimeout(()=>{
        this.isLoading = false
        loadingEl.dismiss()
        this.router.navigateByUrl('/places/tabs/discover')
      }, 1500)
      
    })

    
    
    
  }

  onLogout(){
    this.authService.logout()
  }

  onSwitchAuthMode(){
    this.isLogin = !this.isLogin
  }
}
