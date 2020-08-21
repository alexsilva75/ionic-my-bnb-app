import { Offer } from './../offer.model';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OffersService {
  private offers: Offer[] = [
    new Offer('o1', 'p1'),
    new Offer('o2', 'p2'),
  ]
  

  constructor() { }

  getOffers(){
    return this.offers
  }
}
