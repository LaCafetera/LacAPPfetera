import { Component, ViewChild, ElementRef} from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { InAppBrowser} from '@ionic-native/in-app-browser';
import { EpisodiosService } from '../../providers/episodios-service';
import { ConfiguracionService } from '../../providers/configuracion.service';
import leaflet from 'leaflet';

/**
 * Generated class for the MapaOyentesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-mapa-oyentes',
  templateUrl: 'mapa-oyentes.html',
  providers: [InAppBrowser, EpisodiosService]
})
export class MapaOyentesPage{
  @ViewChild('mapaCafetero') mapContainer: ElementRef;
  mapaCafetero: any;
  tokenScribble: string;
  geoCafeteros: Array<any>;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams, 
              private iab: InAppBrowser, 
              private epService: EpisodiosService, 
              private _configuracion: ConfiguracionService,
              private episodiosService: EpisodiosService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MapaOyentesPage');
  }

  ionViewDidEnter() {
    /*this._configuracion.getTokenScribble()
    .then((val)=> {
      if (val == null || val == ""){
        this.solicitaTokenScribble();
      }
      else {
        this.tokenScribble = val;
        this.recuperaCafeteros();
      }
      console.log("[mapa-oyentes.ionViewDidEnter] Recuperado token Scribble que teníamos guardado");
    }).catch(()=>{
      console.error("[mapa-oyentes.ionViewDidEnter] Error recuperando  token Scribble que teníamos guardado");
    });*/
    //this.loginScribble();
    this.recuperaCafeteros();
    //this.cargaMapaCafetero();
  }
/*
  solicitaTokenScribble () {
    this.epService.mapaCafeteroSolicitaToken().subscribe(
        data => {
            console.log("[mapa-oyentes.solicitaTokenScribble] Descargados datos de conexión: " + JSON.stringify(data));
            this.tokenScribble = data.access_token;
            this.guardarTokenScribble(this.tokenScribble); 
            this.recuperaCafeteros();
        },
        err => {
            console.error("[mapa-oyentes.solicitaTokenScribble] Error solicitando datos de usuario " + JSON.stringify(err));
        }
    );
  }*/

  recuperaCafeteros(){
    this.episodiosService.damePuntosMapa().subscribe(
      data => {
        console.log('[mapa-oyentes.recuperaCafeteros] Puntos recuperados ' + JSON.stringify(data));
        this.geoCafeteros = data;//.features;
        this.cargaMapaCafetero();
      },
      error => {
          console.error('[mapa-oyentes.recuperaCafeteros] Error ' + JSON.stringify(error));
      }
  )
  }
/*
  guardarTokenScribble (token: string){
    console.log ("[mapa-oyentes.guardarTokenScribble] Guardando token.");
    this._configuracion.setTokenScribble(token);
  }
 */
  cargaMapaCafetero() {
    this.mapaCafetero = leaflet.map("map").fitWorld();
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attributions: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 16
    }).addTo(this.mapaCafetero);
    leaflet.geoJSON(this.geoCafeteros, {
      onEachFeature: this.onEachFeature
    }).addTo(this.mapaCafetero);
    this.mapaCafetero.locate({
      setView: true,
      maxZoom: 10
    }).on('locationfound', (e) => {
      console.log('[mapa-oyentes.recuperaCafeteros] Puntos recuperados ');
    }).on('onLocationError', (e) => {
      console.error('--->' + e.message);
    })
  }

  onEachFeature(feature: any, layer) {
    // does this feature have a property named name?
    if (feature.properties && feature.properties.name) {
        layer.bindPopup(feature.properties.name);
    }
}
/*
  loginScribble(){
    let browser = this.iab.create('https://www.scribblemaps.com/oauth/authorize?response_type=code&redirect_uri=https://www.mapa.radiolacafetera.com&client_id=56867005-647b-4c11-a08e-93c93ae998a2&scope=read',
                                  '_blank',
                                  'location=no,clearsessioncache=yes,clearcache=yes');
    browser.on('loadstart')
    .subscribe((event) => {
      let responseParameters;
      let parsedResponse = {};
      console.log ("[mapa-oyentes.loginScribble] Evento loadstart: " + JSON.stringify(event));
      if ((event.url).indexOf("https://www.mapa.radiolacafetera.com") === 0) {
        if ((event.url).indexOf("?error") == -1) {
          //browser.removeEventListener("exit", (event) => {});
          browser.close();
          //if ((event.url).indexOf("http://localhost:8100") === 0 ){
            responseParameters = ((event.url).split("#")[1]).split("&");
          //}
          console.log ("[mapa-oyentes.loginScribble] responseParameters vale " + responseParameters);
          for (let i = 0; i < responseParameters.length; i++) {
            parsedResponse[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
          }
          if (parsedResponse["access_token"] !== undefined && parsedResponse["access_token"] !== null) { //conexión vía spreaker
            console.log ("[mapa-oyentes.loginScribble] Login vía Scribble OK");
            //this.habemusConexion(parsedResponse["access_token"]);
            //this._configuracion.setTokenSpreaker(parsedResponse["access_token"]);
            //this.actualizaAvatar(parsedResponse["access_token"]);
          }
        }
        else {
          //this.conectadoASpreaker = false;
          console.log ("[mapa-oyentes.loginScribble] Error en la conexión: " + (event.url).split("?")[1]);
          //this.msgDescarga ("Se ha producido un error conectando a Spreaker.");
        }
      }
    });
    browser.on('loadstop')
    .subscribe((event) => {
        console.log ("[mapa-oyentes.loginScribble] Evento loadstop: " + JSON.stringify(event));
    });
    browser.on('loaderror')
    .subscribe((event) => {
        console.log ("[mapa-oyentes.loginScribble] Evento loaderror: " + JSON.stringify(event));
    });
    browser.on('exit')
    .subscribe((event) => {
        console.log ("[mapa-oyentes.loginScribble] Evento exit: " + JSON.stringify(event));
    });
  }
*/
}
