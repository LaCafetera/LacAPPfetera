import { Component,} from '@angular/core';
import { NavParams, ViewController, App, Events } from 'ionic-angular';


/**
 * Generated class for the MenuExtDescComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'menuext',
  template: `
      <ion-list>
        <ion-item >
            <ion-label>Ordenar lista: </ion-label>
            <ion-toggle [(ngModel)]="ordenar"  (ionChange)="CambiarOrdenDescargados($event)"></ion-toggle>
        </ion-item >
      </ion-list>
    `
})
export class MenuExtDescComponent {

    ordenar:boolean = true;

    constructor(public viewCtrl: ViewController, public appCtrl: App, public navParams: NavParams, public events: Events) {
        console.log('[MenuExtDescComponent constructor]');
        this.ordenar = this.navParams.get('ordenado');
    }

    CambiarOrdenDescargados(evento){  
        console.log('[MenuExtDescComponent.CambiarOrdenDescargados] Cambiando el orden mundial.');
        this.events.publish('menuDescargas:orden', {valor:evento.checked});
        this.viewCtrl.dismiss();
    }

    close() {
        this.viewCtrl.dismiss();
    }

}
