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
                this.tamanyoStr = this.dameTiempo(this.totDurPlay);
                console.log ("La duración del capítulo es "+ this.totDurPlay + " y trato de mostrar "+ this.tamanyoStr);
            },
            err => {
                alert(err);
            }
        );       
        platform.ready().then((readySource) => {
            console.log("platform Ready");
      })
            
        //<audio-track-progress-bar>
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad ReproductorPage');
        /*
        this.reproductor.init.then(() => {
            console.log('Playback Finished');
        }, (err) => {
            console.log('somthing went wrong! error code: ' + err.code + ' message: ' + err.message);
        }, (msg) =>{this.statusRep = msg});*/
    }

    numerosDosCifras(numero):string {
        var ret = "00";
        if (!isNaN(numero)){
            if (numero < 10){
                ret = '0' + numero;
            }
            else {
                ret = numero.toString();
            }
        }
        return (ret);
    }

    dameTiempo(totSegundos){
        var horas = Math.floor(totSegundos / 3600);
        var minutos = Math.floor((totSegundos % 3600) / 60);
        var segundos = (totSegundos % 60);
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
                            console.log("Posición: "+ position + ". Status: "+ this.statusRep + " - " + MediaPlugin.MEDIA_RUNNING);
                            if (position > -1 && this.statusRep == MediaPlugin.MEDIA_RUNNING) {
                                    this.posicionRep = position;
                                    this.posicionRepStr = this.dameTiempo(Math.round(this.posicionRep));
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

    actualizaPosicion(posicion){
        this.reproductor.seekTo(posicion.value*1000);
        console.log("Ha cambiado la posición del slider." + this.posicionRep);
    }

    compartir(){

        console.log ("Compartir es muy bonito ");

        var options = {
            message: this.titulo, // not supported on some apps (Facebook, Instagram)
            subject: 'Creo que esto puede interesarte.', // fi. for email
            files: [], //[imagen], // an array of filenames either locally or remotely
            url: this.audio,
            chooserTitle: 'Selecciona aplicación.' // Android only, you can override the default share sheet title
        }
/*
        var onSuccess = function(result) {
            console.log("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
            console.log("Shared to app: " + result.app); // On Android result.app is currently empty. On iOS it's empty when sharing is cancelled (result.completed=false)
        }

        var onError = function(msg) {
            console.log("Sharing failed with message: " + msg);
        }*/

        SocialSharing.shareWithOptions(options).then(() => {
            console.log("Ok"); // On Android apps mostly return false even while it's true
        }).catch(() => {
            console.log("KO");
        });
    }

    actualizaPorcentaje(evento):void{
        console.log ("recibido evento "+ evento.porcentaje);
        this.porcentajeDescargado = evento.porcentaje;
    }

    muestraDetalle(myEvent) {
        let popover = this.popoverCtrl.create(DetalleCapituloPage, {id_episodio: this.episodio});
        popover.present({ ev: myEvent }) ;
    } 
    
    ficheroDescargado(evento):void{
        let nombrerep: string;
        const onStatusUpdate = (status) =>{
            this.statusRep = status
            console.log("actualizado status de la reproducción a " + status);
        };
        if (evento.existe ){
            nombrerep = cordova.file.dataDirectory + this.episodio + '.mp3';
            console.log("EL fichero existe. Reproduciendo descarga");
        } else {
            nombrerep = 'https://api.spreaker.com/listen/episode/'+this.episodio+'/http';
            console.log("EL fichero no existe. Reproduciendo de red");
        };
        if(this.noesAndroid){
            this.audio = nombrerep;
        }
        else{
            this.reproductor = new MediaPlugin (nombrerep, onStatusUpdate);
      /*    this.reproductor.getDuration().then((duration) => {
                console.log(position);
            });*/
        }
    }
/*
    inicializaReproductor(fichero){
        console.log ("Vamos a ver si existe el fichero " + fichero + " de la carpeta " + cordova.file.dataDirectory);
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(fileSystem){
            fileSystem.getFile(fichero, { create: false }, fileExists, fileDoesNotExist);
        }, getFSFail); //of requestFileSystem
    }
    function fileExists(fileEntry){
            console.log("El fichero existe. Reproduciremos fichero local")
            console.log("Reproductor:" + reproductor);
            if (typeof(reproductor) != 'undefined'){
                reproductor.release();
            }
            $("#descarga").removeClass("ui-icon-arrow-d ui-icon-cloud").addClass("ui-icon-cloud");
            reproductor = new Media(encodeURI(fichero_en_rep), function(){console.log("comenzando reproduccion fichero local")},
                                                             function(err){console.log("Error en reproduccion" + err.code)},
                                                             function(msg){reproduciendo = msg});
             $("#slider-rep").attr("max", "1");
                reproductor.play();
             descargado = true;
        }
        function fileDoesNotExist(){
            console.log("El fichero NO existe. Reproduciremos por streaming")
            $("#descarga").removeClass("ui-icon-arrow-d ui-icon-cloud").addClass("ui-icon-arrow-d");
            console.log("Reproductor:" + reproductor);
            if (typeof(reproductor) != 'undefined'){
                reproductor.release();
                console.log ("Eliminando instancia de reproductor");
            }
            else
            {
                console.log ("No se elimina la instancia de reproductor");
            }
            reproductor = new Media(encodeURI(audio_en_rep), function(){console.log("comenzando reproduccion streaming")},
                                                             function(err){console.log("Error en reproduccion: " + err.code); alert ("Error reproduciendo: " + err.code)},
                                                             function(msg){reproduciendo = msg});
            $("#slider-rep").attr("max", "1");
                reproductor.play();
            descargado = false;
        }
        function getFSFail(evt) {
            console.log(evt.target.error.code);
            alert("Errorrrr");
        }

*/
}
