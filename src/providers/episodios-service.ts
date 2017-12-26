import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { Observable } from 'rxjs/Observable';
 

import 'rxjs/add/operator/map';


@Injectable()
export class EpisodiosService {

    static get parameters() {
        return [[Http]];
    }

    meVigilan:Observable<any>;

    constructor(public http: Http) {
        this.meVigilan = new Observable();
    }

    dameEpisodios(usuario:string, token:string, ultimocap: string, numCaps: number){
        //let direccion = 'https://api.spreaker.com/v2/shows/1341125/episodes' //--> LIVE (1341125)

// Para cuando haya que probar con un capítulo que deja de estar en vivo...
//        let primero = 0;

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
// Para cuando haya que probar con un capítulo que dejar de esta en vivo...
//                        if (primero == 0) {
//                            primero = capitulo.episode_id;
//                            console.log("[EPISODIOS-SERVICE.dameEpisodios] El primer episodio es "+ primero  );
//                        }  //--------------------

                        this.dameDetalleEpisodio(capitulo.episode_id).subscribe(
                            data => {

// Para cuando haya que probar con un capítulo que deja de estar en vivo...
//                                console.log("[EPISODIOS-SERVICE.dameEpisodios] Llega el capítulo  "+ data.response.episode.episode_id  );//--------------------
//                                if (data.response.episode.episode_id == primero ){ //--------------------
//                                    console.log("[EPISODIOS-SERVICE.dameEpisodios] detalle del capítulo  "+ JSON.stringify(data) );//--------------------
//                                    data.response.episode.type = 'LIVE'; //--------------------
//                                } //--------------------
// Para cuando haya que probar la llegada de un nuevo audio.
//                                if (data.response.episode.episode_id != primero || numCaps == 1){
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
//                                }
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
    }

    dameDetalleEpisodio(episodio_id){
        //console.log("[EPISODIOS-SERVICE.dameDetalleEpisodio] Entrando para episodio " + episodio_id );
        let episodiosJSON = this.http.get('https://api.spreaker.com/v2/episodes/'+ episodio_id).map(res => res.json());
        return episodiosJSON;
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
        //    console.log("[EPISODIOS-SERVICE.whoAMi] Recibido token " + token);
            headers.append ('Authorization', 'Bearer ' + token);
            headers.append('Content-Type', 'application/json');
            return(this.http.get('https://api.spreaker.com/v2/me', {headers: headers}).map(res => res.json()));
        }
    }

    solicitaTokenViaCode (code: string){
        console.log("[EPISODIOS-SERVICE.solicitaTokenViaCode] Solicitado token para código recibido: "+ code);
        let headers = new Headers();
        headers.append ('Content-Type', 'application/x-www-form-urlencoded');
        let gt = "grant_type=authorization_code";
        let cID = "client_id=1093";
        let cs = "client_secret=cG9J6z16F2qHtZFr3w79sfd1aYqzK6ST";
        let ru = "redirect_uri=cappfetera://lacappfetera.mo";
        console.log('[EPISODIOS-SERVICE.solicitaTokenViaCode] https://api.spreaker.com/oauth2/token?' + gt + '&' + cID + '&' + cs + '&' + ru + '&code=' + code );
        //return this.http.post('https://api.spreaker.com/oauth2/token?' + gt + '&' + cID + '&' + cs + '&' + ru + '&code=' + code, null, {headers: headers}).map(res => res.json());
        return this.http.post('https://api.spreaker.com/oauth2/token',(gt + '&' + cID + '&' + cs + '&' + ru + '&code=' + code), {headers: headers}).map(res => res.json());
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

    sigueSiendoVivo(episodio: string ){
        console.log("[EPISODIOS-SERVICE.sigueSiendoVivo] Me preguntan si sigue vivo el capítulo  " + episodio);
        let promesa = new Promise ((resolve, reject) => {
        this.dameDetalleEpisodio(episodio).subscribe(
            data => {
                console.log("[EPISODIOS-SERVICE.sigueSiendoVivo] ¿Sigue vivo el episodio? " + data.type==="LIVE");
                resolve(data.type==="LIVE");
            },
            err => {
                console.log("[EPISODIOS-SERVICE.sigueSiendoVivo] Error en detalle:" + err);
                reject ("[EPISODIOS-SERVICE.sigueSiendoVivo] Error en detalle:" + err);
            });
            resolve(true);
        });
        return (promesa);
    }
    
}


// consultas a revisar cuando esté conectado.
// https://api.spreaker.com/v2/sync/users/7985950/notifications
// https://api.spreaker.com/v2/sync/users/7985950/push-notifications 
//  https://api.spreaker.com/v2/sync/users/7985950/favorites 
//  https://api.spreaker.com/v2/sync/users/7985950/bookmarks
//  https://api.spreaker.com/v2/sync/users/7985950/likes 
//  https://api.spreaker.com/v2/sync/users/7985950/plays

//https://api.spreaker.com/v2/episodes/:episodio/likes?limit=5--> Esto devuelve datos de personas que han dado a like al episodio
