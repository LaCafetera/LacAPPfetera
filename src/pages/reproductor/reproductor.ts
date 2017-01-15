/*npm install -g typings
typings install dt~cordova --save --global

ionic plugin add cordova-plugin-file-transfer*/

import { Component } from '@angular/core';
import { NavController, NavParams, Platform, PopoverController } from 'ionic-angular';
import { MediaPlugin, SocialSharing } from 'ionic-native';
import { EpisodiosService } from '../../providers/episodios-service';
import { DetalleCapituloPage } from '../detalle-capitulo/detalle-capitulo';
//import { DescargaCafetera } from '../../app/descarga.components';

declare var cordova: any


/*
  Generated class for the Reproductor page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-reproductor',
  templateUrl: 'reproductor.html',
  providers: [EpisodiosService]
})
export class ReproductorPage {
    
    capItems: any;
    
    episodio: string;
    audioEnRep: string = null;
    imagen: string;
    reproductor: MediaPlugin;
    reproduciendo: boolean = false;
    descargando: boolean = false;
    statusRep: number;
    noesAndroid:boolean;
    ficheroExiste:boolean;
    posicionRepStr:string = "00:00:00";
    tamanyoStr:string = "01:00:00"
    posicionRep: number =0;
    totDurPlay:number;
    iconoPlayPause:string = 'play';
    timer:any;
    
    titulo: string;
    descripcion: string;
    
    audio: string;
    storageDirectory: string = '';


    porcentajeDescargado: number;

    /*** compartir */


    constructor(public navCtrl: NavController, public navParams: NavParams, public platform : Platform, private episodiosService: EpisodiosService, public popoverCtrl: PopoverController) {
        let prueba: string;
        this.noesAndroid = !platform.is('android');
        this.episodio = this.navParams.get('episodio');
        this.imagen = this.navParams.get('image_url');
        prueba = (this.noesAndroid?"si":"no");
        this.episodiosService.dameDetalleEpisodio(this.episodio).subscribe(
            data => {
                this.titulo = data.response.episode.title;
                this.descripcion = data.response.episode.description;
                this.totDurPlay =  data.response.episode.duration;
                this.tamanyoStr = this.dameTiempo(this.totDurPlay/1000);
                console.log ("La duración del capítulo es "+ this.totDurPlay + " y trato de mostrar "+ this.tamanyoStr);
            },
            err => {
                alert(err);
            }
        );       
        platform.ready().then((readySource) => {
            console.log("platform Ready");
      })
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad ReproductorPage');
    }

    numerosDosCifras(numero):string {
        let ret: string = "00";
        if (!isNaN(numero)){
            if (numero < 10){
                ret = '0' + numero;
            }
            else {
                ret = numero.toString();
            }
        }
        return (ret.substr(0,2));
    }

    dameTiempo(totSegundos){
        let horas = Math.floor(totSegundos / 3600);
        let minutos = Math.floor((totSegundos % 3600) / 60);
        let segundos = (totSegundos % 60);
        return (this.numerosDosCifras (horas) + ':' + this.numerosDosCifras (minutos) + ':' + this.numerosDosCifras (segundos));
    }

    playPause(){
        if (this.reproductor != null){
            if (this.reproduciendo) {
                if (!this.noesAndroid){
                    this.reproductor.pause();
                    clearInterval(this.timer);
                }
                this.iconoPlayPause = 'play';
                console.log("pause.");
                this.reproduciendo=!this.reproduciendo;
            }
            else {
                if (!this.noesAndroid){
                    this.reproductor.play();
                    this.iconoPlayPause = 'pause';
                    this.timer = setInterval(() =>{
                        // get media position
                        this.reproductor.getCurrentPosition().then((position)=>{
                            console.log("Posición: "+ position*1000 + ". Status: "+ this.statusRep + " - " + MediaPlugin.MEDIA_RUNNING);
                            if (position > -1 && this.statusRep == MediaPlugin.MEDIA_RUNNING) {
                                    this.posicionRep = position*1000;
                                    this.posicionRepStr = this.dameTiempo(Math.round(position));
                                    console.log ("Reproductor por " + this.posicionRep + " (" + Math.round(position) + ")");
                                    // ESta línea tiene que estar aquí abajo, para que refresque el valor máximo de la barra antes de que cambiemos el valor.
                                    //$("#slider-rep").val(Math.round(position)).slider("refresh");
                                }
                            },
                            // error callback
                            function (e) {
                                console.log("Error getting pos=" + e);
                            }
                        );
                    }, 1000);
                }
                console.log("play");
                this.reproduciendo=!this.reproduciendo;
            }
        }
        else alert("Es nulo");
    }

    actualizaPosicion(){
        this.reproductor.seekTo(this.posicionRep);
        console.log("Ha cambiado la posición del slider: " + this.posicionRep);
    }

    compartir(){
        var options = {
            message: this.titulo, // not supported on some apps (Facebook, Instagram)
            subject: 'Creo que esto puede interesarte.', // fi. for email
            files: [], //[imagen], // an array of filenames either locally or remotely
            url: this.audio,
            chooserTitle: 'Selecciona aplicación.' // Android only, you can override the default share sheet title
        }

        SocialSharing.shareWithOptions(options).then(() => {
            console.log("Ok"); // On Android apps mostly return false even while it's true
        }).catch(() => {
            console.log("KO");
        });
    }

    actualizaPorcentaje(evento):void{
        console.log ("[actualizaPorcentaje] recibido evento "+ evento.porcentaje);
        this.porcentajeDescargado = evento.porcentaje;
    }

    muestraDetalle(myEvent) {
        let popover = this.popoverCtrl.create(DetalleCapituloPage, {id_episodio: this.episodio});
        popover.present({ ev: myEvent }) ;
    } 
    
    ficheroDescargado(evento):void{
        let nombrerep: string;
        let meVoyPorAqui: number = 0;
        console.log("[ficheroDescargado] Recibido evento");
        const onStatusUpdate = (status) =>{
            this.statusRep = status
            console.log("[ficheroDescargado] actualizado status de la reproducción a " + status);
        };
        if (evento.existe ){
            nombrerep = cordova.file.dataDirectory + this.episodio + '.mp3';
            console.log("[ficheroDescargado] EL fichero existe. Reproduciendo descarga");
        } else {
            nombrerep = 'https://api.spreaker.com/listen/episode/'+this.episodio+'/http';
            console.log("[ficheroDescargado] EL fichero no existe. Reproduciendo de red");
        };
        if(this.noesAndroid){
            this.audio = nombrerep;
        }
        else{
            if (this.audioEnRep != null){
                console.log("[ficheroDescargado] Segunda o más vez que entramos.");
                if (this.audioEnRep != nombrerep){
                    if (this.audioEnRep.indexOf(this.episodio)) {
                        this.reproductor.getCurrentPosition().then((position)=>meVoyPorAqui = position);
                        console.log("[ficheroDescargado] El mismo fichero pero recién descargado (o recién borrado).");
                    }
                    this.reproductor.release();
                    this.audioEnRep = nombrerep;
                    this.reproductor = new MediaPlugin (this.audioEnRep, onStatusUpdate);
                    if (meVoyPorAqui > 0)
                    {
                        this.reproductor.play();
                        this.reproductor.seekTo(meVoyPorAqui*1000);
                    }
                }
            }
            else {
                this.audioEnRep = nombrerep;
                this.reproductor = new MediaPlugin (this.audioEnRep, onStatusUpdate);
                console.log("[ficheroDescargado] Primera vez que entramos.");
            }
        }
    }
}
