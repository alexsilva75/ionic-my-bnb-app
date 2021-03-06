export class User{
    constructor(
        public id: string,
        public email: string,
        private _token: string,
        private tokenExpirationDate: Date
    ){}


    get token(){
        if(!this.tokenExpirationDate || this.tokenExpirationDate <= new Date()){
            return null
        }
        return this._token
    }

    get tokenDuration(){
        if(!this.token){
            return 0
        }
        const duration = this.tokenExpirationDate.getTime() - new Date().getTime() 
        return duration <= 0 ? 0: duration
       // return 2000
    }
}