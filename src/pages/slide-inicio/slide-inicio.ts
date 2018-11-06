import { Component, ViewChild  } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, Platform } from 'ionic-angular';
import { HomePage } from '../home/home';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
//import { errorHandler } from '@angular/platform-browser/src/browser';

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

  horizontal: boolean = false;
  movil: boolean = true;
  panoramico: boolean = true;
  ulti : boolean = false;

  @ViewChild(Slides) slides: Slides;

  diapos = [
    {titulo: "Diapo1",
     descripcion: "Paseaba @radiocable por la calle...",
     imagenV: "assets/images/SI1V.jpg",
     imagenH: "assets/images/SI1H.jpg",
     boton: false},
    {titulo: "Diapo2",
    descripcion: "...cuando se encontró con Inda que le miraba golosón...",
    imagenV: "assets/images/SI2V.jpg",
    imagenH: "assets/images/SI2H.png",
    boton: false},
    {titulo: "Diapo3",
    descripcion: "Tras el susto inicial...",
    imagenV: "assets/images/SI3V.jpg",
    imagenH: "assets/images/SI3H.png",
    boton: false},
    {titulo: "Diapo4",
    descripcion: "... vino la reflexión sosegada:",
    imagenV: "assets/images/SI4V.jpg",
    imagenH: "assets/images/SI4H.png",
    boton: false},
    {titulo: "Diapo5",
    descripcion: "¡Podría haber sido peor! :-D ",
    imagenV: "assets/images/SI5V.jpg",
    imagenH: "assets/images/SI5H.png",
    boton: false},
    {titulo: "Diapo6",
    descripcion: "",
    imagenV: "assets/images/SI6H.png",
    imagenH: "assets/images/SI6V.png",
    boton: true}
  ]

  constructor(public navCtrl: NavController, public navParams: NavParams, private screenOrientation: ScreenOrientation, public _platform: Platform) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SlideInicioPage');
    this._platform.ready().then(() => {
        let ancho = this._platform.width();
        let alto = this._platform.height();
        this.panoramico = Math.abs((alto / ancho) - 1.77) < Math.abs((alto / ancho) - 1.33 );
        console.log (' ************** Ancho ' + ancho + '; alto ' + alto + ". Panoramico " + this.panoramico);
        this.movil = this._platform.is('mobile');
        this.screenOrientation.onChange().subscribe(
          data => {
            this.horizontal = this.screenOrientation.type.includes ("landscape");
          },
          err => {
            console.error ("[SlideInicioPage.ionViewDidLoad] La orientación del terminal es: " + this.screenOrientation.type + " - " + JSON.stringify(err) );
          }
        );
      })
  }

  letsRock(){
    this.navCtrl.setRoot (HomePage);
  }

  slideChanged(){
    this.ulti = this.slides.getActiveIndex()==this.slides.length()-1;
    console.log ("Activo " +  this.slides.getActiveIndex() + " longitud " + this.slides.length() + " ulti vale " + this.ulti);
  }

}
