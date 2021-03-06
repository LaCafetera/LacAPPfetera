import { Component, ViewChild  } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, Platform } from 'ionic-angular';
//import { HomePageModule } from '../home/home.module';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
//import { errorHandler } from '@angular/platform-browser/src/browser';

/**
 * Generated class for the SlideInicioPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@IonicPage()
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
     imagenV43: "assets/images/SI1V_4-3.jpg",
     imagenV169: "assets/images/SI1V_16-9.jpg",
     imagenH43: "assets/images/SI1H_4-3.jpg",
     imagenH169: "assets/images/SI1H_16-9.jpg",
     boton: false},
    {titulo: "Diapo2",
    descripcion: "...cuando se encontró con Inda que le miraba golosón...",
    imagenV43: "assets/images/SI2V_4-3.jpg",
    imagenV169: "assets/images/SI2V_16-9.jpg",
    imagenH43: "assets/images/SI2H_4-3.jpg",
    imagenH169: "assets/images/SI2H_16-9.jpg",
    boton: false},
    {titulo: "Diapo3",
    descripcion: "Tras el susto inicial...",
    imagenV43: "assets/images/SI3V_4-3.jpg",
    imagenV169: "assets/images/SI3V_16-9.jpg",
    imagenH43: "assets/images/SI3H_4-3.jpg",
    imagenH169: "assets/images/SI3H_16-9.jpg",
    boton: false},
    {titulo: "Diapo4",
    descripcion: "... vino la reflexión sosegada:",
    imagenV43: "assets/images/SI4V_4-3.jpg",
    imagenV169: "assets/images/SI4V_16-9.jpg",
    imagenH43: "assets/images/SI4H_4-3.jpg",
    imagenH169: "assets/images/SI4H_16-9.jpg",
    boton: false},
    {titulo: "Diapo5",
    descripcion: "¡Podría haber sido peor! :-D ",
    imagenV43: "assets/images/SI5V_4-3.jpg",
    imagenV169: "assets/images/SI5V_16-9.jpg",
    imagenH43: "assets/images/SI5H_4-3.jpg",
    imagenH169: "assets/images/SI5H_16-9.jpg",
    boton: false},
    {titulo: "Diapo6",
    descripcion: "",
    imagenV43: "assets/images/SI6V_4-3.jpg",
    imagenV169: "assets/images/SI6V_16-9.jpg",
    imagenH43: "assets/images/SI6H_4-3.jpg",
    imagenH169: "assets/images/SI6H_16-9.jpg",
    boton: false},
    {titulo: "Diapo7",
    descripcion: "",
    imagenV43: "assets/images/SI7V_4-3.jpg",
    imagenV169: "assets/images/SI7V_16-9.jpg",
    imagenH43: "assets/images/SI7H_4-3.jpg",
    imagenH169: "assets/images/SI7H_16-9.jpg",
    boton: true}
  ]

  constructor(public navCtrl: NavController, public navParams: NavParams, private screenOrientation: ScreenOrientation, public _platform: Platform) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SlideInicioPage');
    this._platform.ready().then(() => {
        let tamaño1 = this._platform.width();
        let largo = this._platform.width();
        let corto = this._platform.height();
        if (tamaño1 >= corto) {
          largo = tamaño1
        }
        else {
          largo = corto;
          corto = tamaño1;
        }
        this.panoramico = Math.abs((largo / corto) - 1.77) < Math.abs((largo / corto) - 1.33 );
        console.log ('[SlideInicioPage.ionViewDidLoad]  Ancho ' + largo + '; alto ' + corto + ". Panoramico " + this.panoramico);
        this.movil = this._platform.is('mobile');
        this.horizontal = this.screenOrientation.type.includes ("landscape");
        this.screenOrientation.onChange().subscribe(
          data => {
            this.horizontal = this.screenOrientation.type.includes ("landscape");
            console.log ('[SlideInicioPage.ionViewDidLoad]  Orientación :' + this.screenOrientation.type);
          },
          err => {
            console.error ("[SlideInicioPage.ionViewDidLoad] La orientación del terminal es: " + this.screenOrientation.type + " - " + JSON.stringify(err) );
          }
        );
      })
  }

  letsRock(){
    this.navCtrl.setRoot ('HomePage');
  }

  slideChanged(){
    this.ulti = this.slides.getActiveIndex()==this.slides.length()-1;
    console.log ("[SlideInicioPage.slideChanged] Activo " +  this.slides.getActiveIndex() + " longitud " + this.slides.length() + " ulti vale " + this.ulti);
  }

}
