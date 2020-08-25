
//import { GoogleMapsModule } from '@angular/google-maps';
//import { GoogleMapsComponent } from './../google-maps/google-maps.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

 import { MapModalComponent } from './map-modal/map-modal.component';
 import { LocationPickerComponent } from './pickers/location-picker/location-picker.component';
 import { GoogleMapsLocalModule } from './../google-maps/google-maps-local.module';
import { ImagePickerComponent } from './pickers/image-picker/image-picker.component';
//import {GoogleMapsComponent} from '../google-maps/google-maps.component'

@NgModule({
    declarations: [MapModalComponent,LocationPickerComponent, ImagePickerComponent],
    imports: [
      CommonModule,
      IonicModule,
      GoogleMapsLocalModule //Using Angular Google Maps component
    ],
    exports: [MapModalComponent,LocationPickerComponent, ImagePickerComponent],
    entryComponents: [MapModalComponent]
    
  })

  export class SharedModule{}