import { Component /*, OnDestroy*/} from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';

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
export class MapaCafeteroPage /* implements OnDestroy */{

  constructor(public navCtrl: NavController, public navParams: NavParams, private screenOrientation: ScreenOrientation, 
    public toastCtrl: ToastController) {
      /*this.screenOrientation.onChange().subscribe(
        data => {
          this.msgDescarga ("La orientación del terminal es: " + this.screenOrientation.type);
        },
        err => {
          this.msgDescarga ("La orientación del terminal es: " + this.screenOrientation.type);
        }
    );*/
  }

  ionViewDidLoad() {
    console.log("[MapaCafeteroPage.ionViewDidLoad] La orientación del parato es: " + this.screenOrientation.type);
    //this.msgDescarga ("La orientación del terminal es: " + this.screenOrientation.type);
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
    console.log("[MapaCafeteroPage.ionViewDidLoad] Ahora la orientación del parato es: " + this.screenOrientation.type);
  }

  ionViewWillLeave() {
    console.log("[MapaCafeteroPage.ionViewWillLeave] Desbloqueando.");
    this.screenOrientation.unlock();
  }

  ngOnDestroy(){
    //this.msgDescarga ("La orientación del terminal es: " + this.screenOrientation.type);
    console.log("[MapaCafeteroPage.ngOnDestroy] Saliendo " + this.screenOrientation.type);
  }

  msgDescarga  (mensaje: string) {
    let toast = this.toastCtrl.create({
        message: mensaje,
        duration: 3000,
        cssClass: 'msgDescarga'
    });
    toast.present();
  } 
}
