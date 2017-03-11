import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

 import {Observable} from 'rxjs/Observable';
 

import 'rxjs/add/operator/map';

/*
  Generated class for the EpisodiosService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class EpisodiosService {

    episodioVivo = `{"response":{"episode":{"episode_id":11015852,"type":"LIVE"}}}`;

    episodioMuerto = `{"response":{"episode":{"episode_id":11015852,"type":"RECORDED"}}}`;

    static get parameters() {
        return [[Http]];
    }

    //cantidad = 3;

    meVigilan:Observable<any>;


    constructor(public http: Http) {
        //console.log('Hello EpisodiosService Provider');
        this.meVigilan = new Observable();
    }

    dameEpisodios(){
        this.meVigilan = Observable.create(observer => {
            let posicion:number = 0;
           // this.http.get('https://api.spreaker.com/v2/shows/1341125/episodes').map(res => res.json()).subscribe(  //Live
            this.http.get('https://api.spreaker.com/v2/shows/1060718/episodes').map(res => res.json()).subscribe(
                data => {
                    data.response.items.forEach((capitulo, elemento, array) => {
                        this.dameDetalleEpisodio(capitulo.episode_id).subscribe(
                            data => {
                                if (posicion ++ == 0){
                                    data.response.episode.type="LIVE";
                                }
                                observer.next (data.response);
                            },
                            err => {
                                console.log("[EPISODIOS-SERVICE.dameEpisodios] Error en detalle:" + err);
                            }
                        )}
                    );
                },
                err => {
                    console.log("[EPISODIOS-SERVICE.dameEpisodios] Error en episodios:" + err);
                }
            );
        });
        return (this.meVigilan);
    }

    dameEpisodios2(){ //Esto se usa para pruebas....
        let episodiosJSON = this.http.get('https://api.spreaker.com/v2/shows/1060718/episodes?filter=listenable&last_id=10462689').map(res => res.json()); // Fernando
        //var episodiosJSON = this.http.get('https://api.spreaker.com/v2/shows/1341125/episodes').map(res => res.json());   //Live
        return episodiosJSON;
    }

    dameMasEpisodios(ultimocap){
        console.log("[EPISODIOS-SERVICE] Solicitados audios más allá del "+ ultimocap  );
        return Observable.create(observer => {
            this.http.get('https://api.spreaker.com/v2/shows/1060718/episodes?filter=listenable&last_id='+ultimocap).map(res => res.json()).subscribe(
                data => {
                    data.response.items.forEach((capitulo, elemento, array) => {
                        this.dameDetalleEpisodio(capitulo.episode_id).subscribe(
                            data => {
                                observer.next (data.response);
                            },
                            err => {
                                console.log("[EPISODIOS-SERVICE.dameEpisodios] Error en detalle:" + err);
                            }
                        )}
                    );
                },
                err => {
                    console.log("[EPISODIOS-SERVICE.dameEpisodios] Error en episodios:" + err);
                }
            );
        //let episodiosJSON = this.http.get('https://api.spreaker.com/v2/shows/1060718/episodes?filter=listenable&last_id='+ultimocap).map(res => res.json()); // Fernando
        //return episodiosJSON;
        });
    }

    dameDetalleEpisodio(episodio_id){
        let episodiosJSON = this.http.get('https://api.spreaker.com/v2/episodes/'+ episodio_id).map(res => res.json());
        return episodiosJSON;
        /*
        let observador :any;
            console.log("************************************" + this.cantidad + "*****************************");
        if (this.cantidad-- > 0 ){
            console.log("************************************ VIVO *****************************");
            return Observable.create(observer => {
                observer.next (JSON.parse(this.episodioVivo));
            });
        }
        else{
            console.log("************************************ MUERTO *****************************");
            return Observable.create(observer => {
                observer.next(JSON.parse(this.episodioMuerto));
            });
        } */
    }

    dameChatEpisodio(episodio_id){
        let episodiosJSON = this.http.get('https://api.spreaker.com/v2/episodes/'+ episodio_id+'/messages').map(res => res.json());
        return episodiosJSON;
    }

    dameMasComentarios(episodio_id, ultimo_comentario){
        console.log("[EPISODIOS-SERVICE] Solicitados comentarios del episodio "+ episodio_id +" más allá del "+ ultimo_comentario  );
        let episodiosJSON = this.http.get('https://api.spreaker.com/v2/episodes/'+ episodio_id+'/messages?last_id='+ultimo_comentario).map(res => res.json());
        return episodiosJSON;
    }
}
