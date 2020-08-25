import { AuthService } from './../../../auth/auth.service';
import { BookingService } from './../../../bookings/booking.service';
import { CreateBookingComponent } from './../../../bookings/create-booking/create-booking.component';
import { PlacesService } from './../../places.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController, ModalController, ActionSheetController, LoadingController, AlertController } from '@ionic/angular';
import { Place } from '../../place.model';
import { Subscription } from 'rxjs';
import { MapModalComponent } from 'src/app/shared/map-modal/map-modal.component';
import { switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  private placesSub: Subscription
  isBookable = false
  isLoading = false
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
    private authService: AuthService,
    private alertController: AlertController,


  ) { }

  ngOnInit() {

    this.placesSub = this.activatedRoute.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navController.navigateBack('/places/tabs/discover')
        return
      }
      this.isLoading = true
      let fetchedUserId: string
      this.authService.userId.pipe(
        take(1),
        switchMap(userId => {
        if (!userId) {
          throw new Error('No user id found.')
        }

        fetchedUserId = userId
        return this.placesService
          .getPlace(paramMap.get('placeId'))
      }))
      .subscribe(place => {
        this.place = place
        this.isBookable = place.userId !== fetchedUserId
        this.isLoading = false
      }, error => {
        this.alertController.create({
          header: 'An error occurred!',
          message: 'Could not load place',
          buttons: [{
            text: 'Okay', handler: () => {
              this.router.navigate(['/places/tabs/discover'])
            }
          }]
        }).then(alertEl => {
          alertEl.present()
        })
      })
    })

  }

  ngOnDestroy(): void {
    if (this.placesSub) {
      this.placesSub.unsubscribe()
    }
  }

  onShowFullMap() {
    this.modalController.create({
      component: MapModalComponent,
      componentProps: {
        center: {
          lat: this.place.location.lat,
          lng: this.place.location.lng
        },
        selectable: false,
        closeButtonText: 'Close',
        title: this.place.location.address


      }
    }).then(modalEl => {
      modalEl.present()
    })
  }

  onBookPlace() {
    //this.router.navigate(['/places/tabs/discover'])
    //this.router.navigateByUrl('/places/tabs/discover')
    //this.navController.pop()
    //this.navController.navigateBack('/places/tabs/discover')

    this.actionSheetController.create({
      header: 'Choose an action',
      buttons: [
        { text: 'Select Date', handler: () => { this.openBookingModal('select') } },
        { text: 'Random Date', handler: () => { this.openBookingModal('random') } },
        { text: 'Cancel', role: 'cancel' }
      ]
    }).then(actionSheetEl => {
      actionSheetEl.present()
    })


  }

  openBookingModal(mode: 'select' | 'random') {
    console.log(mode)
    this.modalController.create({
      component: CreateBookingComponent,
      componentProps: { selectedPlace: this.place, selectedMode: mode }
    }).then(modalEl => {
      modalEl.present()
      return modalEl.onDidDismiss()
    }).then(resultData => {
      console.log(resultData.data, resultData.role)
      if (resultData.role === 'confirm') {
        this.loadingController.create({ message: 'Booking place...' })
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
            ).subscribe(() => {
              loadingEl.dismiss()
            })
          })

      }
    })
  }
}
