import { GOOGLE_MAPS_API_KEY } from './../../../secret';
import { ModalController } from '@ionic/angular';
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Renderer2, OnDestroy, Input } from '@angular/core';
//import { error } from 'protractor';


@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
})
export class MapModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('map') mapElementRef: ElementRef
  @Input() center = { lat: -34.397, lng: 150.644 }
  @Input() selectable = true
  @Input() closeButtonText = 'Cancel'
  @Input() title = 'Pick Location'
  private mapClickSub: any
  googleMaps: any

  constructor(private modalController: ModalController, private renderer: Renderer2) { }
  ngOnDestroy(): void {
    if (this.mapClickSub) {
      this.googleMaps.event.removeListener(this.mapClickSub)
    }
  }

  onGetPosition = (coords) => {
    console.log('Coords: ', coords)
    this.modalController.dismiss(coords)
  }

  ngAfterViewInit(): void {
    console.log(this.mapElementRef.nativeElement)
    this.getGoogleMaps().then(googleMaps => {
      this.googleMaps = googleMaps

      console.log('Google Maps: ', googleMaps)
      const mapEl = this.mapElementRef.nativeElement
      const map = new googleMaps.Map(mapEl, {
        center: this.center,
        zoom: 16
      })


      googleMaps.event.addListenerOnce(map, 'idle', () => {
        this.renderer.addClass(mapEl, 'visible')
      })

      if (this.selectable) {
        this.mapClickSub = map.addListener('click', event => {
          console.log('Event: ', event)
          const selectedCoords = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
          }

          this.modalController.dismiss(selectedCoords)
        })
      }else{
        const marker = new googleMaps.Marker({
          position: this.center,
          map,
          title: 'Picked Location'
        })
        marker.setMap(map)
      }

    }).catch(err => {
      console.log(err)
    })
  }

  ngOnInit() { }

  onCancel() {
    this.modalController.dismiss()
  }

  getGoogleMaps(): Promise<any> {
    const win = window as any
    const googleModule = win.google

    if (googleModule && googleModule.maps) {
      return Promise.resolve(googleModule.maps)
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src =
        `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap`

      script.async = true
      document.body.appendChild(script)
      console.log('Script: ', script)
      script.onload = () => {
        const loadedGoogleModule = win.google

        if (loadedGoogleModule && loadedGoogleModule.maps) {
          resolve(loadedGoogleModule.maps)
        } else {
          reject('Google Maps SDK not available.')
        }
      }


    })
  }

}
