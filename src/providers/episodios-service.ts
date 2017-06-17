import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { Observable } from 'rxjs/Observable';
 

import 'rxjs/add/operator/map';


@Injectable()
export class EpisodiosService {

    episodioVivo = `{"response":{"episode":{"episode_id":11015852,"type":"LIVE"}}}`;

    episodioMuerto = `{"response":{"episode":{"episode_id":11015852,"type":"RECORDED"}}}`;

    static get parameters() {
        return [[Http]];
    }

    meVigilan:Observable<any>;

    constructor(public http: Http) {
        this.meVigilan = new Observable();
    }

    dameEpisodios2(){ //Esto se usa para pruebas....
        let episodiosJSON = this.http.get('https://api.spreaker.com/v2/shows/1060718/episodes?filter=listenable&last_id=10462689').map(res => res.json()); // Fernando
        //var episodiosJSON = this.http.get('https://api.spreaker.com/v2/shows/1341125/episodes').map(res => res.json());   //Live
        return episodiosJSON;
    }

    dameEpisodios(usuario:string, token:string, ultimocap: string, numCaps: number){
        // let direccion = https://api.spreaker.com/v2/shows/1341125/episodes //--> LIVE
        let direccion = 'https://api.spreaker.com/v2/shows/1060718/episodes?limit='+numCaps;
        if (ultimocap != null) {
            console.log("[EPISODIOS-SERVICE.dameEpisodios] Solicitados audios más allá del "+ ultimocap  );    
            direccion = direccion + '&filter=listenable&last_id=' + ultimocap;
        }
        console.log("[EPISODIOS-SERVICE.dameEpisodios] "+ direccion  );
        return Observable.create(observer => {
            this.http.get(direccion).map(res => res.json()).subscribe(
                data => {
                    data.response.items.forEach((capitulo, elemento, array) => {
                        this.dameDetalleEpisodio(capitulo.episode_id).subscribe(
                            data => {
                                if (token!= null) {
                                    this.episodioDimeSiLike(capitulo.episode_id, usuario, token)
                                    .subscribe (
                                        espureo=>{ 
                                          //  console.log("[EPISODIOS-SERVICE.dameEpisodios] Devuelve datos --> Me gusta el capítulo " + capitulo.episode_id );
                                            observer.next ({objeto:data.response.episode,
                                                            like: true});
                                        },
                                        error=>{
                                           // console.log("[EPISODIOS-SERVICE.dameEpisodios] No me gusta el capítulo " + capitulo.episode_id);
                                            observer.next ({objeto:data.response.episode,
                                                            like: false});
                                        }
                                    )
                                }
                                else{
                                    observer.next ({objeto:data.response.episode,
                                                    like: false});
                                }
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
        //console.log("[EPISODIOS-SERVICE.dameDetalleEpisodio] Entrando para episodio " + episodio_id );
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

    enviaComentarios (episodio_id:string, usuario: string, token: string, comentario:string){
        console.log("[EPISODIOS-SERVICE.enviaComentarios] Solicitado envío de comentario para el episodio "+ episodio_id + " con token " + token);
        let headers = new Headers();
        headers.append ('Authorization', 'Bearer ' + token);
        return this.http.post('https://api.spreaker.com/v2/episodes/'+episodio_id+'/messages?text='+comentario, null, {headers: headers}).map(res => res.json());
    }
	
	borraComentarios  (episodio_id:string, usuario: string, token: string, message_id: string){
        console.log("[EPISODIOS-SERVICE.borraComentarios] Solicitado borrar el comentario " + message_id + "para el episodio "+ episodio_id + " con token " + token);
        let headers = new Headers();
        headers.append ('Authorization', 'Bearer ' + token);
        return this.http.delete('https://api.spreaker.com/v2/episodes/'+episodio_id+'/messages/'+message_id, {headers: headers}).map(res => res.json());
    }

    episodioLike(episodio_id:string, usuario: string, token: string){
        console.log("[EPISODIOS-SERVICE.episodioLike] Solicitado envío like para el episodio "+ episodio_id + " con token " + token);
        let headers = new Headers();
        headers.append ('Authorization', 'Bearer ' + token);
        headers.append('Content-Type', 'application/json');
        return this.http.put('https://api.spreaker.com/v2/users/'+usuario+'/likes/'+episodio_id, "null", {headers: headers}).map(res => res.json());
    }

    episodioDislike(episodio_id:string, usuario: string, token: string){
        console.log("[EPISODIOS-SERVICE.episodioDislike] Solicitado envío dislike para el episodio "+ episodio_id);
        let headers = new Headers();
        headers.append ('Authorization', 'Bearer ' + token);
        headers.append('Content-Type', 'application/json');
        return this.http.delete('https://api.spreaker.com/v2/users/'+usuario+'/likes/'+episodio_id, {headers: headers}).map(res => res.json());
    }

    episodioDimeSiLike(episodio_id:string, usuario:string, token:string){
        //console.log("[EPISODIOS-SERVICE.episodioDimeSiLike] Consultando si gusta o no gusta el episodio "+ episodio_id);
        let headers = new Headers();
        headers.append ('Authorization', 'Bearer ' + token);
        headers.append('Content-Type', 'application/json');
        return this.http.get('https://api.spreaker.com/v2/users/'+usuario+'/likes/'+episodio_id, {headers: headers}).map(res => res.json());
    }

    yTuDeQuienEres(user_id:string){
        console.log("[EPISODIOS-SERVICE.yTuDeQuienEres] Solicitando info de "+ user_id);
        return this.http.get('https://api.spreaker.com/v2/users/'+user_id).map(res => res.json());
    }

    whoAMi(token: string):Observable<any>{
        if (token == null || token == ""){
            console.log("[EPISODIOS-SERVICE.whoAMi] Recibido token vacío. Devuelvo null");
            Observable.empty();
        }
        else {
            let headers = new Headers();
            console.log("[EPISODIOS-SERVICE.whoAMi] Recibido token " + token);
            headers.append ('Authorization', 'Bearer ' + token);
            headers.append('Content-Type', 'application/json');
            return(this.http.get('https://api.spreaker.com/v2/me', {headers: headers}).map(res => res.json()));
        }
    }

    solicitaTokenViaCode (code: string){
        console.log("[EPISODIOS-SERVICE.solicitaTokenViaCode] Solicitado token para código recibido: "+ code);
        let gt = "grant_type=authorization_code";
        let cID = "client_id=1093";
        let cs = "client_secret=cG9J6z16F2qHtZFr3w79sdf1aYqzK6ST";
        let ru = "redirect_uri=http://localhost:8100";
        return this.http.post('https://api.spreaker.com/oauth2/token?' + cID + '&' + cs + '&' + gt + '&' + ru + '&code=' + code, null).map(res => res.json());
    }

    actualizaDatosUsuario(usuario: string, token: string, datosUsu:Array<any>){
        console.log("[EPISODIOS-SERVICE.actualizaDatosUsuario] Actualizando datos de usuario");
        let headers = new Headers();
        headers.append ('Authorization', 'Bearer ' + token);
        let parametros: string = "";
        for (let i=0; i<datosUsu.length; i++){
            //console.log("[EPISODIOS-SERVICE.actualizaDatosUsuario] Cambio " + i + " -> " + datosUsu[i]["nombre"] + " - " + datosUsu[i]["valor"]);
            parametros = parametros.concat(datosUsu[i]["nombre"]).concat('=').concat(datosUsu[i]["valor"]).concat('&');
        }
        parametros = parametros.substr(0, parametros.length - 1);
        console.log("[EPISODIOS-SERVICE.actualizaDatosUsuario] Quiero enviar " + parametros);
        return this.http.post('https://api.spreaker.com/v2/users/'+usuario+'?'+parametros, null, {headers: headers}).map(res => res.json());
    }
}



