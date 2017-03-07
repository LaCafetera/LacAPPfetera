import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';
import { Storage } from '@ionic/storage';


@Injectable()
export class ConfiguracionService {
    // typing our private Observable, which will store our chosen theme in-memory
    public theme: BehaviorSubject<String>;
    // as promised, I've moved the availableThemes here as well
    availableThemes: {className: string, prettyName: string}[];

    constructor(public storage: Storage) {
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
            console.log("[CONFIGURACION.SERVICE] El tema guardado es "+ val);
            if (this.availableThemes.findIndex((element)=>{
                    return (element.className ===val);
                }) > -1) {
                //this.theme = new BehaviorSubject(val);
                console.log("[CONFIGURACION.SERVICE] El tema guardado es correcto. Lo envío");
                this.theme.next(val);
                //this.theme.next(val);
            }
            else {
                console.log("[CONFIGURACION.SERVICE] El tema guardado no lo reconozco. Envío el tema por defecto");
                //this.theme = new BehaviorSubject('tema-base');
                //this.theme.next('tema-base');
            }
        })
        .catch((error)=>{
            console.log("[CONFIGURACION.SERVICE] Error enviando: " + error);
        });
    }

    setTheme(val) {
        this.storage.set ("tema",val);
        this.theme.next(val);
        console.log("[CONFIGURACION.SERVICE.setTheme] cambiado el tema a "+ val );
    }

    getTheme() {
        console.log("[CONFIGURACION.SERVICE.getTheme] Enviado tema.")
        //return this.theme.asObservable();
        this.storage.get ("tema")
        .then (
            data=> {return this.theme.next(data)},
            error=> {return this.theme.next('tema-base')}
        )
    }

    getWIFI(){
        console.log("[CONFIGURACION.SERVICE.getWIFI].")
        //return this.theme.asObservable();
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
        )});
    }

    setWIFI(val:boolean){
        this.storage.set ("WIFI",val);
        console.log("[CONFIGURACION.SERVICE.setWIFI] cambiado el WIFI a "+ val );
    }

    setTimeRep (cap: string, pos:number){
        console.log("[CONFIGURACION.SERVICE.setTimeRep] Guardando posición del cap. " + cap + ": " + pos);
        this.storage.set ("pos_"+cap, pos);
    }

    getTimeRep(cap: string){
        console.log("[CONFIGURACION.SERVICE.getTimeRep] Recuperando posición del cap. " + cap + ".");
        //return this.theme.asObservable();
        return new Promise ((resolve,reject) =>{
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
        )});
    }

}