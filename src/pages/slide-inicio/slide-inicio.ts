import { Component, ViewChild  } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides } from 'ionic-angular';
import { HomePage } from '../home/home';

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

  @ViewChild(Slides) slides: Slides;

  diapos = [ 
    {titulo: "Diapo1",
     descripcion: "Paseaba @radiocable por la calle...",
     imagen: "assets/images/SI1.jpg"},
    {titulo: "Diapo2",
    descripcion: "...cuando se encontró con Inda que le miraba golosón...",
    imagen: "assets/images/SI2.jpg"},
    {titulo: "Diapo3",
    descripcion: "Tras el susto inicial...",
    imagen: "assets/images/SI3.jpg"},
    {titulo: "Diapo4",
    descripcion: "... vino la reflexión sosegada:",
    imagen: "assets/images/SI4.jpg"},
    {titulo: "Diapo5",
    descripcion: "¡Podría haber sido peor! :-D ",
    imagen: "assets/images/SI5.jpg"}
  ]

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SlideInicioPage')
  }

  letsRock(){
    this.navCtrl.setRoot (HomePage);
  }

}
