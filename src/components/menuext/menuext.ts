import { Component, ViewChild, ElementRef  } from '@angular/core';
import { PopoverController, NavParams, ViewController, App } from 'ionic-angular';

import { InfoFerPage } from "../../pages/info-fer/info-fer";
import { MapaCafeteroPage } from "../../pages/mapa-cafetero/mapa-cafetero";

/**
 * Generated class for the MenuExtComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'menuext',
  template: `
      <ion-list>
        <ion-list-header>Ionic</ion-list-header>
        <button ion-item (click)="mostrarLaCafetera()">Acerca de La Cafetera</button>
        <button ion-item (click)="mostrarMapaCafetero()">Mapa Cafetero</button>
        <button ion-item (click)="close()">Showcase</button>
        <button ion-item (click)="close()">GitHub Repo</button>
      </ion-list>
    `
})
export class MenuExtComponent {

  infoFer = InfoFerPage;
  mapaCafetero = MapaCafeteroPage;

  constructor(public viewCtrl: ViewController, public appCtrl: App) {
    console.log('Hello MenuExtComponent Component');
  }

  mostrarLaCafetera(){
     console.log('[MENUEXT.mostrarLaCafetera] Abriendo acerca de ');
      this.viewCtrl.dismiss();
      this.appCtrl.getRootNav().push(this.infoFer);
    close();
  }

  mostrarMapaCafetero(){
     console.log('[MENUEXT.mostrarLaCafetera] Abriendo acerca de ');
      this.viewCtrl.dismiss();
      this.appCtrl.getRootNav().push(this.mapaCafetero);
    close();
  }

  close() {
   this.viewCtrl.dismiss();
  }

}
