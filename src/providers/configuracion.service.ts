import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';

import { EpisodiosService } from "./episodios-service";


@Injectable()

export class ConfiguracionService {
    // typing our private Observable, which will store our chosen theme in-memory
    public theme: BehaviorSubject<String>;
    // as promised, I've moved the availableThemes here as well
    availableThemes: {className: string, prettyName: string}[];

    constructor(public storage: Storage, 
                public episodioSrvc: EpisodiosService, 
                public events: Events) {
        this.theme = new BehaviorSubject('tema-base');

        // again, hard-coding the values for possible selections,
        // but you would similarly pull this from your database as well
        this.availableThemes = [
            {className: 'tema-base', prettyName: 'Día'},
            {className: 'tema-bosque', prettyName: 'Bosque'},
            {className: 'tema-cafe', prettyName: 'Café'},
            {className: 'tema-lila', prettyName: 'Lila'},
            {className: 'tema-noche', prettyName: 'Noche'}
        ];

        this.storage.get('tema')
        .then((val) => {
            //console.log("[CONFIGURACION.SERVICE] El tema guardado es "+ val);
            if (this.availableThemes.findIndex((element)=>{
                    return (element.className ===val);
                }) > -1) {
                //this.theme = new BehaviorSubject(val);
                //console.log("[CONFIGURACION.SERVICE] El tema guardado es correcto. Lo envío");
                this.theme.next(val);
                //this.theme.next(val);
            }
            else {
                //console.log("[CONFIGURACION.SERVICE] El tema guardado no lo reconozco. Envío el tema por defecto");
                //this.theme = new BehaviorSubject('tema-base');
                //this.theme.next('tema-base');
            }
        })
        .catch((error)=>{
            console.log("[CONFIGURACION.SERVICE] Error enviando: " + error);
        });
    }

    setTheme(val) {
        if (val == null){
            console.log("[CONFIGURACION_SERVICE.setTheme] No puedo guardar un valor nulo")
        }
        else {
            this.storage.set ("tema",val);
            this.theme.next(val);
        }
        //console.log("[CONFIGURACION.SERVICE.setTheme] cambiado el tema a "+ val );
    }

    getTheme() {
        //console.log("[CONFIGURACION.SERVICE.getTheme] Enviado tema.")
        //return this.theme.asObservable();
        this.storage.get ("tema")
        .then (
            data=> {return this.theme.next(data)},
            error=> {return this.theme.next('tema-base')}
        )
    }

    getWIFI(){
        //console.log("[CONFIGURACION.SERVICE.getWIFI].")
        //return this.theme.asObservable();
        return (this.storage.get ("WIFI"));/*
        return new Promise ((resolve,reject) =>{
                this.storage.get ("WIFI")
            .then (
                data=> {
                    console.log ("[CONFIGURACION.SERVICE.getWIFI] Enviado "+ data);
                    resolve(data==null?false:data);
                },
                error=> {
                    console.log ("[CONFIGURACION.SERVICE.getWIFI] Error "+ error);
                    resolve(false);
                }
        )});*/
    }

    setWIFI(val:boolean){
        if (val == null){
            console.log("[CONFIGURACION_SERVICE.setWIFI] No puedo guardar un valor nulo")
        }
        else {
            this.storage.set ("WIFI",val);
        //console.log("[CONFIGURACION.SERVICE.setWIFI] cambiado el WIFI a "+ val );
        }
    }

    getFechasAbsolutas(){
        return (this.storage.get ("FechasAbsolutas"));
    }

    setFechasAbsolutas(val:boolean){
        if (val == null){
            console.log("[CONFIGURACION_SERVICE.setFechasAbsolutas] No puedo guardar un valor nulo")
        }
        else {
            this.storage.set ("FechasAbsolutas",val);
        }
    }

    setTimeRep (cap: string, pos:number){
        console.log("[CONFIGURACION.SERVICE.setTimeRep] Guardando posición del cap. " + cap + ": " + pos + " (redondeada)");
        if (cap == null || pos == null){
            console.log("[CONFIGURACION_SERVICE.setTimeRep] No puedo guardar un valor nulo")
        }
        else if (cap.indexOf('str')!= -1){
            console.log("[CONFIGURACION_SERVICE.setTimeRep] No debo guardar la posición para un capítulo en vivo")
        }
        else {
            this.storage.set ("pos_"+cap, Math.round(pos));
        }
    }

    getTimeRep(cap: string){
        console.log("[CONFIGURACION.SERVICE.getTimeRep] Recuperando posición del cap. " + cap + ".");
        //return this.theme.asObservable();
        return new Promise ((resolve,reject) =>{

            if (cap == null){
                console.log("[CONFIGURACION_SERVICE.getTimeRep] No puedo guardar un valor nulo");
                reject("No puedo devolver la posición de un capítulo vacío.")
            }
            else if (cap.indexOf('str')!= -1){
                console.log ("[CONFIGURACION.SERVICE.getTimeRep] De un capítulo en vivo siempre mando 0");
                resolve(0);
            }
            else {
                this.storage.get ("pos_"+cap)
                .then (
                    data=> {
                        console.log ("[CONFIGURACION.SERVICE.getTimeRep] Enviado "+ data);
                        resolve(data);
                    },
                    error=> {
                        console.log ("[CONFIGURACION.SERVICE.getTimeRep] Error "+ error);
                        resolve(0);
                    }
            )}});
    }

    setTwitteado (cap: string){
        //console.log("[CONFIGURACION.SERVICE.setTwitteado] Guardando capítulo twitteado para " + cap);
        if (cap == null){
            console.log("[CONFIGURACION_SERVICE.setTwitteado] No puedo guardar un valor nulo")
        }
        else {
            this.storage.set ("Twit_"+cap, true); // la cosa es guardar si se ha preguntado el twitear este capítulo; no qué ha respondido.
        }
    }

    getTwitteado (cap: string){
       // console.log("[CONFIGURACION.SERVICE.getTimeRep] Recuperando posición del cap. " + cap + ".");
        //return this.theme.asObservable();
        return new Promise ((resolve,reject) =>{

            if (cap == null){
                console.log("[CONFIGURACION_SERVICE.getTwitteado] No puedo guardar un valor nulo");
                reject("No puedo devolver si se ha twitteado un capítulo vacío.")
            }
            else {
                this.storage.get ("Twit_"+cap)
                .then (
                    data=> {
            //            console.log ("[CONFIGURACION.SERVICE.getTwitteado] Enviado "+ data);
                        resolve(data);
                    },
                    error=> {
                        console.log ("[CONFIGURACION.SERVICE.getTwitteado] Error "+ error);
                        resolve(0);
                    }
                )
            }
        });
    }

    setTokenSpreaker (token: string){
        console.log("[CONFIGURACION.SERVICE.setTokenSpreaker] Guardando token login spreaker " + token);
        this.storage.set ("tokenSpreaker", token);
        if (token != null){
            this.episodioSrvc.whoAMi(token).subscribe(
            data => {
                console.log("[CONFIGURACION.SERVICE.setTokenSpreaker] Solicitado usuario recibo " + JSON.stringify(data.response.user));
                //this.storage.set ("usuarioSpreaker", data.response.user.user_id);
                this.guardaUsuario(data.response.user.user_id);
            },
            err => {
                console.log("[CONFIGURACION.SERVICE.setTokenSpreaker] Error solicitando datos de usuario:" + err);
            });
        }
        else
        {   
            console.log("[CONFIGURACION.SERVICE.setTokenSpreaker] Borro el usuario ya que he borrado el token");
            //this.storage.set ("usuarioSpreaker", null);
            this.guardaUsuario("");
        }
    }

    getTokenSpreaker ():Promise<any>{
        return new Promise ((resolve,reject) =>{
            this.storage.get ("tokenSpreaker")
            .then ((data) => {
                    //console.log ("[CONFIGURACION.SERVICE.getTokenSpreaker] Enviado "+ data + " tipo " + typeof data);
                    if (data != null && data != ""){
                        console.log ("[CONFIGURACION.SERVICE.getTokenSpreaker] solicitando datos de usuario.");
                        this.episodioSrvc.whoAMi(data).subscribe(
                            data => {
                    //            console.log("[CONFIGURACION.SERVICE.getTokenSpreaker] recibido " + JSON.stringify(data.response.user));
                                //this.storage.set ("usuarioSpreaker", data.response.user.user_id);
                                this.guardaUsuario(data.response.user.user_id);
                            },
                            err => {
                                console.log("[CONFIGURACION.SERVICE.getTokenSpreaker] Error solicitando datos de usuario:" + err);
                            }
                        )
                    }
                    resolve(data);
                }
            )
            .catch ((error) => {
                console.log ("[CONFIGURACION.SERVICE.getTokenSpreaker] Error recuperando tokenSpreaker "+ error);
                //this.storage.set ("usuarioSpreaker", "");
                this.guardaUsuario("");
                resolve(0);
            }); 
        });
    }

    dameToken ():Promise<any>{
        return (this.storage.get ("tokenSpreaker"));
    }

    dameUsuario ():Promise<any>{
        console.log ("[CONFIGURACION.SERVICE.dameUsuario] Entrando");
        return (this.storage.get ("usuarioSpreaker"));
    }

    guardaUsuario(usuario:string){
        this.storage.set ("usuarioSpreaker", usuario);
        this.events.publish('conexion:status', {});
    }
}
