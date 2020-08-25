import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import {GoogleMapsModule} from '@angular/google-maps'

import {GoogleMapsComponent} from './google-maps.component'

@NgModule({
    //declarations: [LocationPickerComponent, MapModalComponent],
    imports: [
      CommonModule,
      IonicModule,
      GoogleMapsModule
    ],
     exports: [GoogleMapsComponent],
    // entryComponents: [MapModalComponent]
    declarations: [GoogleMapsComponent]
  })
  export class GoogleMapsLocalModule{
    
  }