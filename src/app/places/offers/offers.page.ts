import { PlacesService } from './../places.service';
import { OffersService } from './offers.service';
import { Offer } from './../offer.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Place } from '../place.model';
import { IonItemSliding } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit, OnDestroy {

  offers: Place[]
  isLoading = false

  private placesSub: Subscription
  constructor(private placesService: PlacesService, private router: Router) { }

  ngOnDestroy(): void {
     if(this.placesSub){
      this.placesSub.unsubscribe()
    }
  }

  ngOnInit() {
   this.placesSub = this.placesService.places.subscribe(places => {
      this.offers = places
    })
  }

  ionViewWillEnter(){
    this.isLoading = true
    this.placesService.fetchPlaces().subscribe(()=>{
      this.isLoading = false
    })
  }

  onEdit(id: string, slidingItem: IonItemSliding){
    slidingItem.close()
    console.log('Offer id: ', id)
    this.router.navigate(['places','tabs','offers','edit',id])
  }

}
