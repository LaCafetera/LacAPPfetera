import { Component, ViewChild  } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides } from 'ionic-angular';
import { HomePage } from '../home/home';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { errorHandler } from '@angular/platform-browser/src/browser';

/**
 * Generated class for the SlideInicioPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-slide-inicio',
  templateUrl: 'slide-inicio.html',
})
export class SlideInicioPage {

  horizontal :boolean = false;

  @ViewChild(Slides) slides: Slides;

  diapos = [ 
    {titulo: "Diapo1",
     descripcion: "Paseaba @radiocable por la calle...",
     imagenV: "assets/images/SI1V.jpg",
     imagenH: "assets/images/SI1H.png"},
    {titulo: "Diapo2",
    descripcion: "...cuando se encontró con Inda que le miraba golosón...",
    imagenV: "assets/images/SI2V.jpg",
    imagenH: "assets/images/SI2H.png"},
    {titulo: "Diapo3",
    descripcion: "Tras el susto inicial...",
    imagenV: "assets/images/SI3V.jpg",
    imagenH: "assets/images/SI3H.png"},
    {titulo: "Diapo4",
    descripcion: "... vino la reflexión sosegada:",
    imagenV: "assets/images/SI4V.jpg",
    imagenH: "assets/images/SI4H.png"},
    {titulo: "Diapo5",
    descripcion: "¡Podría haber sido peor! :-D ",
    imagenV: "assets/images/SI5V.jpg",
    imagenH: "assets/images/SI5H.png"}
  ]

  constructor(public navCtrl: NavController, public navParams: NavParams, private screenOrientation: ScreenOrientation) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SlideInicioPage');
    
      this.screenOrientation.onChange().subscribe(
        data => {
          this.horizontal = this.screenOrientation.type.includes ("landscape");
        },
        err => {
          console.error ("La orientación del terminal es: " + this.screenOrientation.type + " - " + JSON.stringify(err) );
        }
    );
  }

  letsRock(){
    this.navCtrl.setRoot (HomePage);
  }

}
