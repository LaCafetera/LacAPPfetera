import { Component } from '@angular/core';
import { ViewController, NavParams/*, ModalController*/ } from 'ionic-angular';
import { EpisodiosService } from '../../providers/episodios-service';

/*
  Generated class for the MapaCafetero page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'detalle-capitulo.html',
  providers: [EpisodiosService]
})
export class DetalleCapituloPage {

  titulo: string;
  descripcion: string;
  capitulo:string;
    
  constructor( /*private modalCtrl: ModalController, private episodiosService: EpisodiosService, */private viewCtrl: ViewController, private params: NavParams) {
    //this.capitulo = params.get("id_episodio");
    this.titulo = params.get("titulo");
    this.descripcion = params.get("detalle");
    console.log ("[DETALLE-CAPITULO.constructor] recibidos parámetros " + this.titulo + " - "  + this.descripcion);
  }

  /*ionViewDidLoad() {
    console.log('ionViewDidLoad DetalleCapituloPage');
    this.episodiosService.dameDetalleEpisodio(this.capitulo).subscribe(
        data => {
            this.titulo = data.response.episode.title;
            this.descripcion = data.response.episode.description;
            console.log ("+++++++++++++++++++++++" + JSON.stringify(data));
        },
        err => {
            alert(err);
        }
    );       
  }*/ 

    close() {
    this.viewCtrl.dismiss();
  }


}
