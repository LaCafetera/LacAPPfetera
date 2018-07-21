import { Component } from '@angular/core';
import { NavController , NavParams, Events } from 'ionic-angular';
import { Observable } from 'rxjs';

@Component({
    selector: 'page-lista-Puntos-Cap',
    templateUrl: 'lista-Puntos-Cap.html'}
)
export class listaPuntosCap {

    mirable: Observable<any>;
    capitulo: string;

    constructor(public navCtrl: NavController,
                private params: NavParams,
                public events: Events) {
                    this.capitulo = params.get('listadoPuntos');
    }

    numerosDosCifras(numero):string {
        let ret: string = "00";
        if (!isNaN(numero)){
            if (numero < 10){
                ret = '0' + numero;
            }
            else {
                ret = numero.toString();
            }
        }
        return (ret.substr(0,2));
    }

    dameTiempo(totSegundos){
        let horas = Math.floor(totSegundos / 3600);
        let minutos = Math.floor((totSegundos % 3600) / 60);
        let segundos = (totSegundos % 60);
        return ((this.numerosDosCifras (horas)=='00'?'':this.numerosDosCifras (horas) + ':') + this.numerosDosCifras (minutos) + ':' + this.numerosDosCifras (segundos));
    }

    cierra(posicion: number, descripcion: string) {
        this.events.publish('posicion:modificado', { 'posicion': posicion, 'descripcion': descripcion });
        this.navCtrl.pop();
        //this.viewCtrl.dismiss({ 'posicion': posicion, 'descripcion': descripcion });
    }

    cancelar() {
        this.cierra(0, '');
    }

}
