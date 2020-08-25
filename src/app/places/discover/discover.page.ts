import { AuthService } from './../../auth/auth.service';
import { Place } from './../place.model';
import { PlacesService } from './../places.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { SegmentChangeEventDetail } from '@ionic/core'
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy {
  loadedPlaces: Place[]
  listedLoadedPlaces: Place[]
  relevantPlaces: Place[]
  isLoading = false
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

  ionViewWillEnter(){
    this.isLoading = true
    this.placesService.fetchPlaces().subscribe(()=>{
      this.isLoading = false
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
    this.authService.userId.pipe(take(1)).subscribe(userId => {
      if(event.detail.value === 'all'){
        this.relevantPlaces = this.loadedPlaces
        this.listedLoadedPlaces = this.relevantPlaces.slice(1)
      }else{
        this.relevantPlaces = this.loadedPlaces.filter(
          place =>place.userId !== userId 
          )
          this.listedLoadedPlaces = this.relevantPlaces.slice(1)
      }
    })

  
    
  }
}
