import { Injectable } from '@angular/core';


@Injectable()
export class CadenasTwitterService {

    cantidad : number = 0;
    listaCadenas: Array<Object>;

    constructor() {}

    dameDirTwitter (cadena){
        return ('http://www.twitter.com/'+cadena.substr(1));
    }

    troceaCadena (cadenaIn:string):Array<Object>{
        let hayMasUsuarios =  cadenaIn.indexOf('@');
        let siguienteEspacio: number;
        let siguienteComa: number;
        let siguientePos:number;
        //let restoCadena:string;

        this.listaCadenas = new Array();
        while (hayMasUsuarios != -1){
            this.listaCadenas[this.cantidad] = new Object();
            this.listaCadenas[this.cantidad]["cadena"] = cadenaIn.substr (0, hayMasUsuarios);
            siguienteComa = cadenaIn.substr(hayMasUsuarios+1).indexOf(',');
            if (siguienteComa == -1) siguienteComa = 9999;
            siguienteEspacio = cadenaIn.substr (hayMasUsuarios+1).indexOf(' ');
            if (siguienteEspacio == -1) siguienteEspacio = 9999;
            if (siguienteComa < siguienteEspacio){
                siguientePos = siguienteComa+1;
            }
            else {
                siguientePos = siguienteEspacio+1;
            }            
            //console.log("[CADENASTWITTER.troceaCadena] siguienteComa " + siguienteComa + " siguienteEspacio " + siguienteEspacio); 
            this.listaCadenas[this.cantidad]["usuario"] = cadenaIn.substr (hayMasUsuarios, siguientePos); 
            cadenaIn = cadenaIn.substr(hayMasUsuarios+siguientePos).trim();
            //console.log("[CADENASTWITTER.troceaCadena] posición " + this.cantidad  + "; cadena ->" + this.listaCadenas[this.cantidad]["cadena"] + "<- usuario ->" + this.listaCadenas[this.cantidad]["usuario"] + "<-");
            this.cantidad ++; 
            hayMasUsuarios = cadenaIn.indexOf('@');
        }
        if (cadenaIn.length > 0){
            this.listaCadenas[this.cantidad] = new Object();
            this.listaCadenas[this.cantidad]["cadena"] = cadenaIn;
            this.listaCadenas[this.cantidad]["usuario"] = "";
        }
        return (this.listaCadenas);
    }
}
