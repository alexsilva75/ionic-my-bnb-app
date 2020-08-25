import { LoadingController, AlertController } from '@ionic/angular';
//import { Route } from '@angular/compiler/src/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { PlacesService } from './../../places.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Place } from '../../place.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit, OnDestroy {
  place: Place
  form: FormGroup
  isLoading = false
  private placesSub: Subscription

  constructor(
    private placesService: PlacesService,
     private navController: NavController,
     private activatedRoute: ActivatedRoute,
     private router: Router,
     private loadingController: LoadingController,
     private alertController: AlertController
     ) { }

     ngOnDestroy(): void {
      if(this.placesSub){
        this.placesSub.unsubscribe()
      }
    }

  ngOnInit() {
    this.isLoading = true
    this.activatedRoute.paramMap.subscribe( paramMap =>{
      if(!paramMap.has('placeId')){
        this.navController.navigateBack('/places/tabs/offers')
        return 
      }

      this.placesSub = this.placesService
      .getPlace(paramMap.get('placeId'))
      .subscribe(place =>{
        this.place = place

        this.form = new FormGroup({
          title: new FormControl(this.place.title, {
            updateOn: 'blur',
            validators: [Validators.required]
          }),
          description: new FormControl(this.place.description, {
            updateOn: 'blur',
            validators: [Validators.required, Validators.maxLength(180)]
          }) ,
          
        })

        this.isLoading = false
      }, error => {
        this.alertController.create({
          header: 'An error occurred!',
          message: 'Place could not be fetched.',
          buttons: [{text: 'Okay', handler: ()=>{
            this.router.navigate(['/places/tabs/offers'])
          }}]
        }).then((alertEl)=>{
          alertEl.present()
        })
      })

     
    })
    
  }

  onUpdateOffer(){
    if(!this.form.valid){
      return
    }
    this.loadingController.create({message: 'Updating place...'}).then(loadingEl => {
      loadingEl.present()
      this.placesService.updateOffer(
        this.place.id,
        this.form.value.title,
        this.form.value.description
        ).subscribe(()=>{
          loadingEl.dismiss()
          this.form.reset()
          this.router.navigate(['/places/tabs/offers'])
        })
    })
    
  }

}
