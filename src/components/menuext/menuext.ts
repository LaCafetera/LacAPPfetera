import { Component, /*ViewChild, ElementRef*/  } from '@angular/core';
import { /*PopoverController, */NavParams, ViewController, App } from 'ionic-angular';

import { InfoFerPage } from "../../pages/info-fer/info-fer";
import { MapaCafeteroPage } from "../../pages/mapa-cafetero/mapa-cafetero";
import { InfoUsuarioPage } from "../../pages/info-usuario/info-usuario";
import { CapitulosDescargadosPage } from "../../pages/capitulos-descargados/capitulos-descargados";
import { MapaOyentesPage } from "../../pages/mapa-oyentes/mapa-oyentes";

import { Player } from '../../app/player';

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
        <button ion-item (click)="mostrarInfoUsuarioSpreaker()"><i class="fas fa-user"></i>Tú en Spreaker</button>
        <!--button ion-item (click)="programasDescargados()"><i class="fas fa-folder-open"></i>Programas Descargados</button-->
        <button ion-item (click)="mostrarMapaCafetero()"><i class="fas fa-map"></i>Mapa Cafetero</button>
        <button ion-item (click)="mostrarMapaOyentes()"><i class="fas fa-map-marked"></i>Mapa de Oyentes</button>
        <button ion-item (click)="mostrarLaCafetera()"><i class="fas fa-info-circle"></i>Acerca de La Cafetera</button>
      </ion-list>
    `
})
export class MenuExtComponent {

  infoFer = InfoFerPage;
  mapaCafetero = MapaCafeteroPage;
  infoUsuario = InfoUsuarioPage;
  descargados = CapitulosDescargadosPage;
  mapaOyentes = MapaOyentesPage;

  reproductor: Player;

  // let datosObjeto = {player: this.reproductor, controlador:this.mscControl}

  constructor(public viewCtrl: ViewController, public appCtrl: App, public navParams: NavParams) {
    console.log('[MenuExtComponent constructor]');
    this.reproductor = this.navParams.get('player');
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

  mostrarMapaOyentes(){
     console.log('[MENUEXT.programasDescargados] Abriendo mapa oyentes ');
      this.viewCtrl.dismiss();
      this.appCtrl.getRootNav().push(this.mapaOyentes, this.navParams.data);
  //  close();
  }

  close() {
   this.viewCtrl.dismiss();
  }

}
