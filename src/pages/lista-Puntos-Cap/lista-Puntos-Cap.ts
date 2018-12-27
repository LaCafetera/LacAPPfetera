import { Component } from '@angular/core';
import { NavController , NavParams, Events } from 'ionic-angular';
import { Observable } from 'rxjs';

@Component({
    selector: 'page-lista-Puntos-Cap',
    templateUrl: 'lista-Puntos-Cap.html'}
)
export class listaPuntosCap {

    mirable: Observable<any>;
    capitulo: Array<any>;

    constructor(public navCtrl: NavController,
                private params: NavParams,
                public events: Events) {
        this.capitulo = params.get('listadoPuntos');
        this.capitulo.forEach(element => {
            if (element.image_url == null) {
                if (element.title.toUpperCase().includes('EDITORIAL')){
                    element.image_original_url = 'assets/images/EDITORIAL.png'
                }
                else if (element.title.includes('ENTREVISTA')){
                    element.image_original_url = 'assets/images/ENTREVISTA.png'
                }
                else if (element.title.toUpperCase().includes('AGENDA CAFETERA')){
                    element.image_original_url = 'assets/images/AGENDA_CAFETERA.png'
                }
                else if (element.title.toUpperCase().includes('SOBREMESA')){
                    element.image_original_url = 'assets/images/SOBREMESA.png'
                }
                else if (element.title.toUpperCase().includes('PRENSA INTERNACIONAL')){
                    element.image_original_url = 'assets/images/PRENSA_INTERNACIONAL.png'
                }
                else if (element.title.toUpperCase().includes('VIDEOFORUM')){
                    element.image_original_url = 'assets/images/VIDEOFORUM.png'
                }
                else if (element.title.toUpperCase().includes('CIENCIA')){
                    element.image_original_url = 'assets/images/CIENCIA.png'
                }
                else if (element.title.toUpperCase().includes('ECOLOGÍA')){
                    element.image_original_url = 'assets/images/ECOLOGIA.png'
                }
                else if (element.title.toUpperCase().includes('MEMORIA HISTÓRICA')){
                    element.image_original_url = 'assets/images/MEMORIA_HISTORICA.png'
                }
                else {
                    element.image_original_url = 'assets/images/GENERICO.png'
                }
            }
        });
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
