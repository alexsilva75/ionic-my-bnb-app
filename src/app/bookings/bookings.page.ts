import { Booking } from './booking.model';
import { BookingService } from './booking.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit, OnDestroy {
  isLoading = false
  loadedBookings: Booking[]
  private bookingsSub: Subscription

  constructor(
    private bookingService: BookingService,
    private loadingController: LoadingController
    ) { }
  ngOnDestroy(): void {
    if(this.bookingsSub){
      this.bookingsSub.unsubscribe()
    }
  }

  ngOnInit() {
    this.bookingsSub = this.bookingService.bookings.subscribe(bookings =>{
      this.loadedBookings = bookings
    })
  }

  ionViewWillEnter(){
    this.isLoading = true
    this.bookingService.fetchBookings().subscribe(()=>{
      this.isLoading = false
    })
  }

  onCancelBooking(bookingId : string, slidingBooking: IonItemSliding){
    slidingBooking.close()
    this.loadingController.create({message: 'Cancelling booking...'})
    .then( loadingEl => {
      loadingEl.present()
      this.bookingService
        .cancelBooking(bookingId)
        .subscribe(()=>{
          loadingEl.dismiss()
        })
    })
    
  }

}
