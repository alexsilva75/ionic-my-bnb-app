import { Component, OnInit, ViewChild, Input } from '@angular/core';
import {MapInfoWindow, MapMarker} from '@angular/google-maps'
//import {} from '@angular/platform-browser'

@Component({
  selector: 'app-google-maps',
  templateUrl: './google-maps.component.html',
  styleUrls: ['./google-maps.component.scss'],
})
export class GoogleMapsComponent implements OnInit {
  @ViewChild(MapInfoWindow, {static: false}) infoWindow: MapInfoWindow
  @Input() getPosition: Function

  mapsUrl = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB3uYutqIr9czS7KSiaeoR-pt-qYqGtLWY`

  center = {lat: -34.397, lng: 150.644}
  markerOptions = {draggable: false}
  markerPositions: google.maps.LatLngLiteral[] = []
  zoom = 13
  display?:google.maps.LatLngLiteral

  addMarker(event: google.maps.MouseEvent){
    if(this.markerPositions.length > 0){
      this.markerPositions.pop()
    }
    this.getPosition(event.latLng.toJSON())
    this.markerPositions.push(event.latLng.toJSON())
  }

  move(event: google.maps.MouseEvent){
    this.display = event.latLng.toJSON()
  }

  openInfoWindow(marker: MapMarker){
    this.infoWindow.open(marker)
  }

  removeLastMarker(){
    this.markerPositions.pop()
  }

  constructor() { }

  ngOnInit() {}

}
