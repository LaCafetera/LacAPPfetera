import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

// import {Observable} from 'rxjs/Observable';
 

import 'rxjs/add/operator/map';

/*
  Generated class for the EpisodiosService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class EpisodiosService {

    episodioVivo = '{"response":{"episode":{"episode_id":11015852,"type":"LIVE","title":"Irene Montero responde a las reacciones de su nombramiento. Y @amnistiaespana alerta del discurso de odio en su informe 2016. En la Cafetera","duration":3634573,"explicit":false,"show_id":1060718,"author_id":5647623,"site_url":"https:\/\/www.spreaker.com\/episode\/11015852","image_url":"https:\/\/d1bm3dmew779uf.cloudfront.net\/large\/98b6d6432a5b2ad03b37a0b9bf434211.jpg","image_original_url":"https:\/\/d3wo5wojvuv7l.cloudfront.net\/images.spreaker.com\/original\/98b6d6432a5b2ad03b37a0b9bf434211.jpg","published_at":"2017-02-22 07:30:02","download_enabled":true,"waveform_url":"https:\/\/d3770qakewhkht.cloudfront.net\/episode_11015852.gz.json?v=5yCjmB","description":"La Cafetera es un programa que se mantiene gracias a las aportaciones econ\u00f3micas de los  oyentes. Si sientes que te acompa\u00f1a y te gusta el periodismo que defiende convi\u00e9rtete en  Mecenas y prot\u00e9gelo. Inf\u00f3rmate en \nhttp:\/\/www.radiocable.com\/mecenas","permalink":"irenemonteroenlacafetera-y-ademas-amnist","plays_count":9770,"downloads_count":2229,"likes_count":23,"messages_count":914,"chapters_count":0,"author":{"user_id":5647623,"fullname":"La Cafetera de radiocable","site_url":"https:\/\/www.spreaker.com\/user\/radiocable","image_url":"https:\/\/d1bm3dmew779uf.cloudfront.net\/large\/85c07fc70ab7c568dc559432042148c3.jpg","image_original_url":"https:\/\/d3wo5wojvuv7l.cloudfront.net\/images.spreaker.com\/original\/85c07fc70ab7c568dc559432042148c3.jpg"},"show":{"show_id":1060718,"title":"LaCafetera","site_url":"https:\/\/www.spreaker.com\/show\/lacafetera_1","image_url":"https:\/\/d1bm3dmew779uf.cloudfront.net\/large\/f4fa056b65c8e38807ff75c0ad62c506.jpg","image_original_url":"https:\/\/d3wo5wojvuv7l.cloudfront.net\/images.spreaker.com\/original\/f4fa056b65c8e38807ff75c0ad62c506.jpg","author_id":5647623}}}}';

    episodioMuerto = '{"response":{"episode":{"episode_id":11015852,"type":"RECORDED","title":"Irene Montero responde a las reacciones de su nombramiento. Y @amnistiaespana alerta del discurso de odio en su informe 2016. En la Cafetera","duration":3634573,"explicit":false,"show_id":1060718,"author_id":5647623,"site_url":"https:\/\/www.spreaker.com\/episode\/11015852","image_url":"https:\/\/d1bm3dmew779uf.cloudfront.net\/large\/98b6d6432a5b2ad03b37a0b9bf434211.jpg","image_original_url":"https:\/\/d3wo5wojvuv7l.cloudfront.net\/images.spreaker.com\/original\/98b6d6432a5b2ad03b37a0b9bf434211.jpg","published_at":"2017-02-22 07:30:02","download_enabled":true,"waveform_url":"https:\/\/d3770qakewhkht.cloudfront.net\/episode_11015852.gz.json?v=5yCjmB","description":"La Cafetera es un programa que se mantiene gracias a las aportaciones econ\u00f3micas de los  oyentes. Si sientes que te acompa\u00f1a y te gusta el periodismo que defiende convi\u00e9rtete en  Mecenas y prot\u00e9gelo. Inf\u00f3rmate en \nhttp:\/\/www.radiocable.com\/mecenas","permalink":"irenemonteroenlacafetera-y-ademas-amnist","plays_count":9770,"downloads_count":2229,"likes_count":23,"messages_count":914,"chapters_count":0,"author":{"user_id":5647623,"fullname":"La Cafetera de radiocable","site_url":"https:\/\/www.spreaker.com\/user\/radiocable","image_url":"https:\/\/d1bm3dmew779uf.cloudfront.net\/large\/85c07fc70ab7c568dc559432042148c3.jpg","image_original_url":"https:\/\/d3wo5wojvuv7l.cloudfront.net\/images.spreaker.com\/original\/85c07fc70ab7c568dc559432042148c3.jpg"},"show":{"show_id":1060718,"title":"LaCafetera","site_url":"https:\/\/www.spreaker.com\/show\/lacafetera_1","image_url":"https:\/\/d1bm3dmew779uf.cloudfront.net\/large\/f4fa056b65c8e38807ff75c0ad62c506.jpg","image_original_url":"https:\/\/d3wo5wojvuv7l.cloudfront.net\/images.spreaker.com\/original\/f4fa056b65c8e38807ff75c0ad62c506.jpg","author_id":5647623}}}}';

    static get parameters() {
        return [[Http]];
    }

    cantidad = 3;

    constructor(public http: Http) {
        //console.log('Hello EpisodiosService Provider');
    }

    dameEpisodios(){
        let episodiosJSON = this.http.get('https://api.spreaker.com/v2/shows/1060718/episodes').map(res => res.json()); // Fernando
        //var episodiosJSON = this.http.get('https://api.spreaker.com/v2/shows/1341125/episodes').map(res => res.json());   //Live
        return episodiosJSON;
    }

    dameEpisodios2(){ //Esto se usa para pruebas....
        let episodiosJSON = this.http.get('https://api.spreaker.com/v2/shows/1060718/episodes?filter=listenable&last_id=10462689').map(res => res.json()); // Fernando
        //var episodiosJSON = this.http.get('https://api.spreaker.com/v2/shows/1341125/episodes').map(res => res.json());   //Live
        return episodiosJSON;
    }

    dameMasEpisodios(ultimocap){
        console.log("[EPISODIOS-SERVICE] Solicitados audios más allá del "+ ultimocap  );
        let episodiosJSON = this.http.get('https://api.spreaker.com/v2/shows/1060718/episodes?filter=listenable&last_id='+ultimocap).map(res => res.json()); // Fernando
        //var episodiosJSON = this.http.get('https://api.spreaker.com/v2/shows/1341125/episodes').map(res => res.json());   //Live
        return episodiosJSON;
    }

    dameDetalleEpisodio(episodio_id){
        let episodiosJSON = this.http.get('https://api.spreaker.com/v2/episodes/'+ episodio_id).map(res => res.json());
        return episodiosJSON;
        /*
            console.log("************************************" + this.cantidad + "*****************************");
        if (this.cantidad-- > 0 ){
            console.log("************************************ VIVO *****************************");
            alert ("En vivo");
            return Observable.create(observer => {
                observer.next(this.episodioVivo);
                observer.complete();
            });
        }
        else{
            console.log("************************************ MUERTO *****************************");
            alert ("En muerto");
            return Observable.create(observer => {
                observer.next(this.episodioMuerto);
                observer.complete();
            });
        }
         */
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
