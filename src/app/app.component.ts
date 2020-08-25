import { Component, OnInit, OnDestroy } from '@angular/core';

import { Platform } from '@ionic/angular';
// import { SplashScreen } from '@ionic-native/splash-screen/ngx';
// import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Plugins, Capacitor, AppState } from '@capacitor/core'
import { AuthService } from './auth/auth.service'
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private isAuthSub: Subscription
  private previousAuthState = false

  constructor(
    private platform: Platform,
    // private splashScreen: SplashScreen,
    // private statusBar: StatusBar,
    private authService: AuthService,
    private router: Router
  ) {
    this.initializeApp();
  }
  ngOnDestroy(): void {
    if (this.isAuthSub) {
      this.isAuthSub.unsubscribe()
    }

    

  }
  ngOnInit(): void {
    this.isAuthSub = this.authService.userIsAuthenticated.subscribe(isAuth => {
      if (!isAuth && this.previousAuthState == !isAuth) {
        this.router.navigateByUrl('/auth')
      }

      this.previousAuthState = isAuth
    })

    Plugins.App.addListener('appStateChange', this.checkAuthOnResume.bind(this))
  }


  private checkAuthOnResume(state: AppState) {
    if (state.isActive) {
      this.authService
        .autoLogin()
        .pipe(take(1))
        .subscribe(success => {
          if (!success) {
            this.onLogout();
          }
        });
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
      if (Capacitor.isPluginAvailable('SplashScreen')) {
        Plugins.SplashScreen.hide()
      }
    });
  }

  onLogout() {
    this.authService.logout()
    this.router.navigateByUrl('/auth')
  }
}
