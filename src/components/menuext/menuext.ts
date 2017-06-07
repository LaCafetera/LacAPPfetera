import { Component, ViewChild, ElementRef  } from '@angular/core';
import { PopoverController, NavParams, ViewController, App } from 'ionic-angular';

import { InfoFerPage } from "../../pages/info-fer/info-fer";
import { MapaCafeteroPage } from "../../pages/mapa-cafetero/mapa-cafetero";
import { InfoUsuarioPage } from "../../pages/info-usuario/info-usuario";
import { CapitulosDescargadosPage } from "../../pages/capitulos-descargados/capitulos-descargados";

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
        <button ion-item (click)="mostrarLaCafetera()">Acerca de La Cafetera</button>
        <button ion-item (click)="mostrarMapaCafetero()">Mapa Cafetero</button>
        <button ion-item (click)="mostrarInfoUsuarioSpreaker()">Tú en Spreaker</button>
        <button ion-item (click)="programasDescargados()">Programas Descargados</button>
      </ion-list>
    `
})
export class MenuExtComponent {

  infoFer = InfoFerPage;
  mapaCafetero = MapaCafeteroPage;
  infoUsuario = InfoUsuarioPage;
  descargados = CapitulosDescargadosPage;

  constructor(public viewCtrl: ViewController, public appCtrl: App) {
    console.log('Hello MenuExtComponent Component');
  }

  mostrarLaCafetera(){
     console.log('[MENUEXT.mostrarLaCafetera] Abriendo acerca de ');
      this.viewCtrl.dismiss();
  //    close();
      this.appCtrl.getRootNav().push(this.infoFer);
  }

  mostrarMapaCafetero(){
     console.log('[MENUEXT.mostrarLaCafetera] Abriendo acerca de ');
      this.viewCtrl.dismiss();
     // close();
      this.appCtrl.getRootNav().push(this.mapaCafetero);
  }

  mostrarInfoUsuarioSpreaker(){
     console.log('[MENUEXT.mostrarInfoUsuarioSpreaker] Abriendo acerca de ');
      this.viewCtrl.dismiss();
 //     close();
      this.appCtrl.getRootNav().push(this.infoUsuario);
  }

  programasDescargados(){
     console.log('[MENUEXT.programasDescargados] Abriendo capítulos descargados ');
      this.viewCtrl.dismiss();
      this.appCtrl.getRootNav().push(this.descargados);
  //  close();
  }

  close() {
   this.viewCtrl.dismiss();
  }

}
