import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the EpisodiosService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class EpisodiosService {
    
    static get parameters() {
        return [[Http]];
    }
    
    constructor(public http: Http) {
        //console.log('Hello EpisodiosService Provider');
    }
  
    dameEpisodios(){
        var episodiosJSON = this.http.get('https://api.spreaker.com/v2/shows/1060718/episodes').map(res => res.json()); // Fernando
        //var episodiosJSON = this.http.get('https://api.spreaker.com/v2/shows/1341125/episodes').map(res => res.json());   //Live
        return episodiosJSON;
    }
  
    dameDetalleEpisodio(episodio_id){
        var episodiosJSON = this.http.get('https://api.spreaker.com/v2/episodes/'+ episodio_id).map(res => res.json());
        return episodiosJSON;
    }
  
    dameChatEpisodio(episodio_id){
        var episodiosJSON = this.http.get('https://api.spreaker.com/v2/episodes/'+ episodio_id+'/messages').map(res => res.json());
        return episodiosJSON;
    }

}
