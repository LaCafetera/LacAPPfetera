import { Component,} from '@angular/core';
import { NavParams, ViewController, App, Events } from 'ionic-angular';


/**
 * Generated class for the MenuExtChatComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'menuext',
  template: `
      <ion-list>
        <ion-item >
            <ion-label>Ascendente / descendente: </ion-label>
            <ion-toggle [(ngModel)]="paquipalla"  (ionChange)="CambiarOrdenChat($event)"></ion-toggle>
        </ion-item >
      </ion-list>
    `
})
export class MenuExtChatComponent {

    paquipalla:boolean;

    constructor(public viewCtrl: ViewController, public appCtrl: App, public navParams: NavParams, public events: Events) {
        this.paquipalla = this.navParams.get('ordenado');
        console.log('[MenuExtChatComponent constructor] Recibido valor this.paquipalla');
    }

    CambiarOrdenChat(evento){  
        console.log('[MenuExtChatComponent.CambiarOrdenChat] Cambiando el orden mundial. ' + evento.checked);
        this.events.publish('menuChat:orden', {valor:evento.checked});
        this.viewCtrl.dismiss();
    }

    close() {
        this.viewCtrl.dismiss();
    }

}
