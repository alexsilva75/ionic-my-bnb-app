import { AuthService } from './../auth/auth.service';
import { Place } from './place.model';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { take, map, tap, delay } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([
    new Place(
      'p1',
      'Manhattan Mansion',
      'In the heart of New York City.',
      'https://3.bp.blogspot.com/_3k2ilY9vkCY/S73R1HhD_OI/AAAAAAAAASo/0gpAWoUgQzo/s1600/ResSinclairHFExt2.jpg',
      149.99,
      new Date('2020-01-01'),
      new Date('2020-12-31'),
      'def'
    ),
    new Place(
      'p2',
      'L\'Amour Toujours',
      'A romantic place in Paris.',
      'https://french.as.virginia.edu/sites/french.as.virginia.edu/files/la%20maison%20fancaise.png',
      189.99,
      new Date('2020-01-01'),
      new Date('2020-12-31'),
      'abc'
    ),
    new Place(
      'p3',
      'The Foggy Palace',
      'Not your average city trip.',
      'https://i.pinimg.com/originals/18/30/b1/1830b1e06b0d68f0cab6809609ddc4cf.jpg',
      99.99,
      new Date('2020-01-01'),
      new Date('2020-12-31'),
      'abc'
    ),
  ])


  get places() {
    return this._places.asObservable()
  }
  constructor(private authService: AuthService) { }

  getPlace(id: string) {
    return this.places.pipe(take(1), map(places => {
      return { ...places.find(p => p.id === id) }
    })

    )

  }

  addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    const newPlace = new Place(
      Math.random().toString(),
      title,
      description,
      'https://i.pinimg.com/originals/18/30/b1/1830b1e06b0d68f0cab6809609ddc4cf.jpg',
      price,
      dateFrom,
      dateTo,
      this.authService.userId

    )
    //console.log('Adding a new Place:', newPlace)
    return this.places.pipe(take(1), delay(1000),tap((places) => {  
        this._places.next(places.concat(newPlace))
    
    }))

  }

  updateOffer(
    placeId: string,
    title: string,
    description: string
  ){
    return this.places.pipe(take(1), delay(1000),tap(places=>{
      const updatedPlaceIndex = places.findIndex(place => place.id === placeId )
      const updatedPlaces = [...places]
      const oldPlace = updatedPlaces[updatedPlaceIndex]

      updatedPlaces[updatedPlaceIndex] = new Place(oldPlace.id,
        title,
        description,
        oldPlace.imageUrl,
        oldPlace.price,
        oldPlace.availableFrom,
        oldPlace.availableTo,
        oldPlace.userId
        )
        this._places.next(updatedPlaces)
    }))

  }
}
