import { Injectable } from '@angular/core';


@Injectable()
export class CadenasTwitterService {

    constructor() {}

    dameUsuTwitter (cadena){
        let usuarioTw = "";
        let posUsu = cadena.indexOf('@');
        if (posUsu != -1){
            let espacio = cadena.indexOf(' ', posUsu);
            if (espacio == -1) {
                espacio = cadena.length;
            }
            //let resta = value.indexOf(' ', posUsu)-posUsu;
            usuarioTw = cadena.substring(posUsu, espacio);
            console.log("[CadenasTwitterService.dameUsuTwitter] El usuario es ->" + usuarioTw + "<- La posición del caracter @ es " + posUsu + " espacio " + espacio);
        }
        else
        {
            console.log("[CadenasTwitterService.dameUsuTwitter]Sin usuario en el titulo");
        }
        return (usuarioTw);
    }

    dameDirTwitter (cadena){
        return ('http://www.twitter.com/'+this.dameUsuTwitter (cadena));
    }

    dameCadenaPreTwitter (cadena){
        let cadenaRet:string;
        let posUsu = cadena.indexOf('@');
        if (posUsu != -1){
            cadenaRet = cadena.substr(0, posUsu);
        }
        else{
            cadenaRet = cadena;
        }
        return (cadenaRet);
    }

    dameCadenaPostTwitter (cadena){
        let cadenaRet:string;
        let posUsu = cadena.indexOf('@');
        if (posUsu != -1){
            cadenaRet = cadena.substr(posUsu);
        }
        else{
            cadenaRet = "";
        }
        return (cadenaRet);
    }
}