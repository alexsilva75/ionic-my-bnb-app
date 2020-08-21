import { AuthService } from './../../../auth/auth.service';
import { BookingService } from './../../../bookings/booking.service';
import { CreateBookingComponent } from './../../../bookings/create-booking/create-booking.component';
import { PlacesService } from './../../places.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController, ModalController, ActionSheetController, LoadingController } from '@ionic/angular';
import { Place } from '../../place.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  private placesSub: Subscription
  isBookable = false
  place: Place
  constructor(
    private router: Router, 
    private navController: NavController,
    private activatedRoute: ActivatedRoute,
    private placesService: PlacesService,
    private modalController: ModalController,
    private actionSheetController: ActionSheetController,
    private bookingService: BookingService,
    private loadingController: LoadingController,
    private authService: AuthService
    ) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe( paramMap =>{
      if(!paramMap.has('placeId')){
        this.navController.navigateBack('/places/tabs/discover')
        return 
      }

      this.placesSub = this.placesService.getPlace(paramMap.get('placeId')).subscribe(place =>{
        this.place = place
        this.isBookable = place.userId !== this.authService.userId
      })
    })

  }

  ngOnDestroy(): void {
    if(this.placesSub){
      this.placesSub.unsubscribe()
    }
  }

  onBookPlace(){
    //this.router.navigate(['/places/tabs/discover'])
    //this.router.navigateByUrl('/places/tabs/discover')
    //this.navController.pop()
    //this.navController.navigateBack('/places/tabs/discover')

    this.actionSheetController.create({
      header: 'Choose an action',
      buttons: [
        {text: 'Select Date', handler: ()=>{ this.openBookingModal('select')}},
        {text: 'Random Date', handler: ()=>{ this.openBookingModal('random')}},
        {text: 'Cancel', role: 'cancel'}
      ]
    }).then(actionSheetEl => {
      actionSheetEl.present()
    })

    
  }

  openBookingModal(mode: 'select' | 'random'){
    console.log(mode)
    this.modalController.create({
      component: CreateBookingComponent,
      componentProps: {selectedPlace: this.place, selectedMode: mode}
    }).then(modalEl => {
      modalEl.present()
      return modalEl.onDidDismiss()
    }).then(resultData =>{
      console.log(resultData.data, resultData.role)
      if(resultData.role === 'confirm'){
        this.loadingController.create({message: 'Booking place...'})
        .then(loadingEl => {
          loadingEl.present()
          const data = resultData.data.bookingData
          this.bookingService.addBooking(
            this.place.id,
            this.place.title,
            this.place.imageUrl,
            data.firstName,
            data.lastName,
            data.guestNumber,
            data.startDate,
            data.endDate
            ).subscribe(() =>{
              loadingEl.dismiss()
            })
        })
        
      }
    })
  }
}
