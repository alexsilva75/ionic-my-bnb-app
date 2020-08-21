import { AuthService } from './../../auth/auth.service';
import { Place } from './../place.model';
import { PlacesService } from './../places.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { SegmentChangeEventDetail } from '@ionic/core'
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy {
  loadedPlaces: Place[]
  listedLoadedPlaces: Place[]
  relevantPlaces: Place[]
  //private filter = 'all'
  private placesSub: Subscription

  constructor(
    private placesService: PlacesService, 
    private menuController: MenuController,
    private authService: AuthService
    ) { }


  ngOnInit() {
    this.placesSub = this.placesService.places.subscribe(places => {
      this.loadedPlaces = places
      this.relevantPlaces = this.loadedPlaces
      this.listedLoadedPlaces = this.relevantPlaces.slice(1)
    })
  }

  ngOnDestroy(): void {
    if (this.placesSub) {
      this.placesSub.unsubscribe()
    }

  }
  // ionViewWillEnter(){
  //   console.log('Will Enter....')
  //   this.loadedPlaces = this.placesService.places
  // }

  onOpenMenu() {
    this.menuController.toggle()
  }

  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
    console.log(event.detail)
    if(event.detail.value === 'all'){
      this.relevantPlaces = this.loadedPlaces
      this.listedLoadedPlaces = this.relevantPlaces.slice(1)
    }else{
      this.relevantPlaces = this.loadedPlaces.filter(
        place =>place.userId !== this.authService.userId 
        )
        this.listedLoadedPlaces = this.relevantPlaces.slice(1)
    }
  }
}
