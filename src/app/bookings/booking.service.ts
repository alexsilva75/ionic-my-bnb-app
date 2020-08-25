import { GOOGLE_FIREBASE_URL } from './../../secret';
import { AuthService } from './../auth/auth.service';
import { Booking } from './booking.model';
import { Injectable } from '@angular/core';
import { BehaviorSubject, pipe, of } from 'rxjs';
import { take, tap, delay, switchMap, map, switchMapTo } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

interface BookingData {
    bookedFrom: string
    bookedTo: string
    firstName: string
    lastName: string
    guestNumber: number
    placeId: string
    placeImage: string
    placeTitle: string
    userId: string
}

@Injectable({ providedIn: 'root' })
export class BookingService {
    private _bookings = new BehaviorSubject<Booking[]>([])

    get bookings() {
        return this._bookings.asObservable()
    }



    constructor(
        private authService: AuthService,
        private http: HttpClient
    ) {

    }

    addBooking(
        placeId: string,
        placeTitle: string,
        placeImage: string,
        firstName: string,
        lastName: string,
        guestNumber: number,
        dateFrom: Date,
        dateTo: Date
    ) {

        let generatedId: string
        let token: string
        let newBooking: Booking

        return this.authService.token.pipe(
            take(1),
            switchMap(fetchedToken =>{
                token = fetchedToken
                return this.authService.userId
            }),
            take(1),
            switchMap(userId => {
                if (!userId) {
                    throw new Error('No user id provided.')
                }
    
                newBooking = new Booking(
    
                    Math.random().toString(),
                    placeId,
                    userId,
                    placeTitle,
                    placeImage,
                    firstName,
                    lastName,
                    guestNumber,
                    dateFrom,
                    dateTo
                )
                return this.http.post<{ name: string }>(
                    `${GOOGLE_FIREBASE_URL}/bookings.json?auth=${token}`,
                    { ...newBooking, id: null })
    
            }),
            switchMap(response => {
                generatedId = response.name
    
                return this.bookings
            }),
            take(1), 
            tap(bookings => {
                newBooking.id = generatedId
                this._bookings.next(bookings.concat(newBooking))
            })

        )

        // return this.authService.userId.pipe(take(1), switchMap(userId => {
        //     if (!userId) {
        //         throw new Error('No user id provided.')
        //     }

        //     newBooking = new Booking(

        //         Math.random().toString(),
        //         placeId,
        //         userId,
        //         placeTitle,
        //         placeImage,
        //         firstName,
        //         lastName,
        //         guestNumber,
        //         dateFrom,
        //         dateTo
        //     )
        //     return this.http.post<{ name: string }>(
        //         `${GOOGLE_FIREBASE_URL}/bookings.json`,
        //         { ...newBooking, id: null })

        // }), switchMap(response => {
        //     generatedId = response.name

        //     return this.bookings
        // }), take(1), tap(bookings => {
        //     newBooking.id = generatedId
        //     this._bookings.next(bookings.concat(newBooking))
        // }))
        // return this.bookings.pipe(take(1), delay(1000),tap(bookings => {
        //     this._bookings.next(bookings.concat(newBooking))
        // }))
    }

    fetchBookings() {
        let token : string

        return this.authService.token.pipe(
            take(1),
            switchMap(fetchedToken => {
                token = fetchedToken
                return this.authService.userId
            }),
            take(1),
            switchMap(userId => {
                if (!userId) {
                    throw new Error('No user id found.')
                }
                return this.http.get<{ [key: string]: BookingData }>(
                    `${GOOGLE_FIREBASE_URL}/bookings.json?auth=${token}&orderBy="userId"&equalTo="${
                    userId}"`
                )
    
            }),
            map(responseData => {
                const bookings = []
                for (const key in responseData) {
                    if (responseData.hasOwnProperty(key)) {
                        bookings.push(new Booking(
                            key,
                            responseData[key].placeId,
                            responseData[key].userId,
                            responseData[key].placeTitle,
                            responseData[key].placeImage,
                            responseData[key].firstName,
                            responseData[key].lastName,
                            responseData[key].guestNumber,
                            new Date(responseData[key].bookedFrom),
                            new Date(responseData[key].bookedTo)
                        )
                        )
                    }
                }
    
                return bookings
            }),
            tap(bookings => {
                return this._bookings.next(bookings)
            })

        )

        // return this.authService.userId.pipe(
        //     take(1)
        //     ,switchMap(userId => {
        //     if (!userId) {
        //         throw new Error('No user id found.')
        //     }
        //     return this.http.get<{ [key: string]: BookingData }>(
        //         `${GOOGLE_FIREBASE_URL}/bookings.json?orderBy="userId"&equalTo="${
        //         userId}"`
        //     )

        // }), map(responseData => {
        //     const bookings = []
        //     for (const key in responseData) {
        //         if (responseData.hasOwnProperty(key)) {
        //             bookings.push(new Booking(
        //                 key,
        //                 responseData[key].placeId,
        //                 responseData[key].userId,
        //                 responseData[key].placeTitle,
        //                 responseData[key].placeImage,
        //                 responseData[key].firstName,
        //                 responseData[key].lastName,
        //                 responseData[key].guestNumber,
        //                 new Date(responseData[key].bookedFrom),
        //                 new Date(responseData[key].bookedTo)
        //             )
        //             )
        //         }
        //     }

        //     return bookings
        // }), tap(bookings => {
        //     return this._bookings.next(bookings)
        // })
        // )
    }

    cancelBooking(bookingId: string) {

        return this.authService.token.pipe(
            take(1),
            switchMap(token => {
                return this.http.delete(`${GOOGLE_FIREBASE_URL}/bookings/${bookingId}.json?auth=${token}`)
            }),
            switchMap(() => {
                return this.bookings
            }),
            take(1),
            tap(bookings => {

                this._bookings.next(bookings.filter(b => {
                    return b.id !== bookingId
                }))
            })
        )

        // return this.http.delete(`${GOOGLE_FIREBASE_URL}/bookings/${bookingId}.json`)
        //     .pipe(switchMap(() => {
        //         return this.bookings
        //     }), take(1), tap(bookings => {

        //         this._bookings.next(bookings.filter(b => {
        //             return b.id !== bookingId
        //         }))
        //     }))
        // return this.bookings.pipe(take(1), delay(1000), tap(bookings => {

        //     this._bookings.next(bookings.filter(b => {
        //         return b.id !== bookingId
        //     }))
        // }))
    }
}