import { PlacesService } from './../../places.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Place } from '../../place.model';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offer-bookings',
  templateUrl: './offer-bookings.page.html',
  styleUrls: ['./offer-bookings.page.scss'],
})
export class OfferBookingsPage implements OnInit, OnDestroy {
  place: Place;
  private placesSub: Subscription

  constructor(
    private activatedRoute: ActivatedRoute, 
    private navController: NavController,
    private placesService: PlacesService
    ) { }

  ngOnDestroy(): void {
    if(this.placesSub){
      this.placesSub.unsubscribe()
    }
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if(!paramMap.has('placeId')){
        this.navController.navigateBack('/places/tabs/offers')
        return 
      }

      this.placesSub = this.placesService.getPlace(paramMap.get('placeId')).subscribe(place => {
        this.place = place
      })
    })
  }

}
