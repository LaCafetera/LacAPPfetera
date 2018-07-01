import { Component } from '@angular/core';
import { ViewController , NavParams } from 'ionic-angular';
import { Observable } from 'rxjs';

@Component({
    selector: 'lista-Puntos-Cap',
    templateUrl: 'lista-Puntos-Cap.html'}
)
export class listaPuntosCap {

    mirable: Observable<any>;
    capitulo: string;

    constructor(public viewCtrl: ViewController,
                private params: NavParams) {
                    this.capitulo = params.get('listadoPuntos');
    }

    cierra(posicion: number, descripcion: string) {
        this.viewCtrl.dismiss({ 'posicion': posicion, 'descripcion': descripcion });
    }

}