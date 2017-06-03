import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { ScreenOrientation } from '@ionic-native/screen-orientation';

/**
 * Generated class for the MapaCafeteroPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-mapa-cafetero',
  templateUrl: 'mapa-cafetero.html',
})
export class MapaCafeteroPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, private screenOrientation: ScreenOrientation) {
  }

  ionViewDidLoad() {
    console.log("[MapaCafeteroPage.ionViewDidLoad] La orientación del parato es: " + this.screenOrientation.type);
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
    console.log("[MapaCafeteroPage.ionViewDidLoad] Ahora la orientación del parato es: " + this.screenOrientation.type);
  }

  ionViewWillLeave() {
    console.log("[MapaCafeteroPage.ionViewWillLeave] Desbloqueando.");
    this.screenOrientation.unlock();
  }
}
