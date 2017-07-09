import { Component, /*ViewChild, ElementRef*/  } from '@angular/core';
import { /*PopoverController, */NavParams, ViewController, App } from 'ionic-angular';

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
        <button ion-item (click)="mostrarInfoUsuarioSpreaker()"><ion-icon name="contact"></ion-icon>Tú en Spreaker</button>
        <button ion-item (click)="programasDescargados()"><ion-icon name="folder"></ion-icon>Programas Descargados</button>
        <button ion-item (click)="mostrarMapaCafetero()"><ion-icon name="map"></ion-icon>Mapa Cafetero</button>
        <button ion-item (click)="mostrarLaCafetera()"><ion-icon name="information-circle"></ion-icon>Acerca de La Cafetera</button>
      </ion-list>
    `
})
export class MenuExtComponent {

  infoFer = InfoFerPage;
  mapaCafetero = MapaCafeteroPage;
  infoUsuario = InfoUsuarioPage;
  descargados = CapitulosDescargadosPage;

  constructor(public viewCtrl: ViewController, public appCtrl: App, public navParams: NavParams) {
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
      this.appCtrl.getRootNav().push(this.infoUsuario, {detalles: ""});
  }

  programasDescargados(){
     console.log('[MENUEXT.programasDescargados] Abriendo capítulos descargados ');
      this.viewCtrl.dismiss();
      this.appCtrl.getRootNav().push(this.descargados, this.navParams.data);
  //  close();
  }

  close() {
   this.viewCtrl.dismiss();
  }

}
