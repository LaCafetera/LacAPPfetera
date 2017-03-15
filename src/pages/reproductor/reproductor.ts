/*npm install -g typings
typings install dt~cordova --save --global

ionic plugin add cordova-plugin-file-transfer*/

 // Esta es la línea comentada. JCSR. http://stackoverflow.com/questions/33905001/cordova-media-plugin-stopped-working-on-android-6/34045084

import { Component/*, Output, EventEmitter*/ } from '@angular/core';
import { NavController, NavParams, Platform, PopoverController, Events, ToastController } from 'ionic-angular';
import { SocialSharing, Dialogs, MusicControls, Network } from 'ionic-native';
import { EpisodiosService } from '../../providers/episodios-service';
import { ConfiguracionService } from '../../providers/configuracion.service';
import { CadenasTwitterService } from '../../providers/cadenasTwitter.service';
import { DetalleCapituloPage } from '../detalle-capitulo/detalle-capitulo';
import { ChatPage } from '../chat/chat';
import { Player } from '../../app/player';

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
  providers: [EpisodiosService, ConfiguracionService, CadenasTwitterService]
})
export class ReproductorPage {

    capItem: any;
    reproductor: Player;

    parche:boolean = false;

    // Parámetros de entrada----
    noRequiereDescarga:boolean=true;
    episodio: string;
    imagen: string;
    enVivo: boolean;
    // Hasta aquí
    episodioDescarga: string;
    audioEnRep: string = null;
    reproduciendo: boolean = false;
    descargando: boolean = false;
    statusRep: number;
    ficheroExiste:boolean;
    posicionRepStr:string = "00:00:00";
    tamanyoStr:string = "01:00:00"
    posicionRep: number =0;
    totDurPlay:number;
    iconoPlayPause:string = 'play';
    timer:any;
    timerDescarga:number = 0;
    timerVigilaEnVivo:number;

    titulo: string;
    descripcion: string;

    httpAudio: string;
    storageDirectory: string = '';

    porcentajeDescargado: number = 0;

    pantallaChat= ChatPage;
    mscControl:MusicControls;
    soloWifi:boolean;
    dirTwitter:string = "";




    constructor(public navCtrl: NavController, public navParams: NavParams, public platform : Platform, private episodiosService: EpisodiosService, public popoverCtrl: PopoverController, public events: Events, public toastCtrl: ToastController, private _configuracion: ConfiguracionService, public cadenaTwitter: CadenasTwitterService) {

        this.capItem = this.navParams.get('episodio');
        this.episodio = this.capItem.episode_id;
        this.httpAudio = this.capItem.site_url;
        this.imagen = this.capItem.image_url;
        this.enVivo = this.capItem.type=="LIVE";
        this.reproductor = this.navParams.get('player');
        this.mscControl = this.navParams.get('controlador');
        this.soloWifi = this.navParams.get('soloWifi');
        this.episodioDescarga = (this.enVivo?null:this.episodio);
        //this.dirTwitter = this.navParams.get('enlaceTwitter') + "/live" ; //--> Versión 2
        this.dirTwitter = this.navParams.get('enlaceTwitter') + "?f=tweets" ;
        //console.log("[reproductor] Enviado como episodio: " + this.episodioDescarga + "(" + this.episodio +")  porque enVivo vale " + this.enVivo);
        this.titulo = this.capItem.title;
        this.descripcion = this.capItem.description;
        this.totDurPlay =  this.capItem.duration;
        this.tamanyoStr = this.dameTiempo(this.totDurPlay/1000);
    }

    ionViewDidLoad() {
        console.log("[reproductor.ionViewDidLoad] pidiendo datos del capítulo" + this.episodio);
        /*if (!this.descargando){
            this._configuracion.getTimeRep(this.episodio)
            .then((val)=> {
                console.log("[reproductor.ionViewDidLoad] recibida posición de reproducción "+val);
                this.posicionRep = Number(val);
                //this.actualizaPosicion();
            }).catch(()=>{
                console.log("[reproductor.ionViewDidLoad] Error recuperando posición de la reproducción.");
            });
        }*/

        console.log ("[reproductor-2] Esto " + this.platform.is("ios")?"sí":"no" + "es ios.");
        this.mscControl = MusicControls.create({
            track       : this.capItem.title,        // optional, default : ''
            artist      : 'Radiocable.com',             // optional, default : ''
            cover       : this.capItem.image_url,      // optional, default : nothing
            isPlaying   : false,                         // optional, default : true
            dismissable : false,

            // hide previous/next/close buttons:
            hasPrev   : true,      // show previous button, optional, default: true
            hasNext   : true,      // show next button, optional, default: true
            hasClose  : !this.platform.is('ios'),       // Si es iOS le quito el botón de cerrar.

            // Android only, optional
            // text displayed in the status bar when the notification (and the ticker) are updated
            ticker    : 'Bienvenido a Sherwood'
        });

        MusicControls.subscribe().subscribe(action => {
            switch(action) {
                case 'music-controls-next':
                    this.adelanta();
                    console.log("[REPRODUCTOR.MusicControls] music-controls-next");
                    break;
                case 'music-controls-previous':
                    this.retrasa();
                    console.log("[REPRODUCTOR.MusicControls] music-controls-previous");
                    break;
                case 'music-controls-pause':
                    this.playPause();
                    console.log("[REPRODUCTOR.MusicControls] music-controls-pause");
                    break;
                case 'music-controls-play':
                    this.playPause();
                    console.log("[REPRODUCTOR.MusicControls] music-controls-play");
                    break;
                case 'music-controls-destroy':
                    this.platform.exitApp();
                    break;

            // External controls (iOS only)
            case 'music-controls-toggle-play-pause' :
                    this.playPause();
                    console.log("[REPRODUCTOR.MusicControls] music-controls-toggle-play-pause");
                    break;

                // Headset events (Android only)
                // All media button events are listed below
               // case 'music-controls-media-button' :
                    // Do something
                //    break;
                case 'music-controls-headset-unplugged':
                    this.reproductor.pause();
                    console.log("[REPRODUCTOR.MusicControls] music-controls-headset-unplugged");
                    break;
                case 'music-controls-headset-plugged':
                    this.reproductor.pause();
                    console.log("[REPRODUCTOR.MusicControls] music-controls-headset-plugged");
                    break;
                default:
                    break;
            }
        });
        MusicControls.listen();

        console.log("[reproductor] EnVivo vale "+ this.enVivo);

        if (this.enVivo){
            this.timerVigilaEnVivo = setInterval(() =>{
                this.episodiosService.dameDetalleEpisodio(this.episodio).subscribe(
                    data => {
                        if (data.response.episode.type != "LIVE"){
                            clearInterval(this.timerVigilaEnVivo);
                            this.enVivo = false;
                            this.episodioDescarga = data.response.episode.episode_id;
                            this.totDurPlay =  data.response.episode.duration;
                            this.tamanyoStr = this.dameTiempo(this.totDurPlay/1000);
                        }
                        else {
                            console.log("[reproductor] El primer episodio sigue siendo en vivo.");
                        }
                    }
            )}, 3000);
        }
        else{
            console.log("[reproductor] No es en vivo.");
        }

        console.log ("[reproductor] Esto " + this.platform.is('ios')?"sí":"no" + "es ios.");
    }


    ngOnDestroy(){
        //this._configuracion.setTimeRep(this.episodio, this.posicionRep);
        this.events.publish('audio:modificado', {reproductor:this.reproductor, controlador:this.mscControl});
        //MusicControls.destroy(); // onSuccess, onError
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

    iniciaContadorRep(){
        console.log ("[REPRODUCTOR.iniciaContadorRep] Entrando");
        this.timer = setInterval(() =>{
            this.reproductor.getCurrentPosition().then((position)=>{
                let status = this.reproductor.dameStatus();
        //        console.log("[REPRODUCTOR] status vale "+ status + " y parado vale " + this.reproductor.MEDIA_STOPPED);
                console.log("[REPRODUCTOR.iniciaContadorRep] Posición: "+ position*1000 + ". Status: "+ status + " - " + this.reproductor.MEDIA_RUNNING);
                if (position > 0 && status == this.reproductor.MEDIA_RUNNING) {
                    this.posicionRep = position*1000;
                    this.posicionRepStr = this.dameTiempo(Math.round(position));
                 //   console.log ("[REPRODUCTOR] Reproductor por " + position + " (" + Math.round(position) + ")");
                }
                if (status == this.reproductor.MEDIA_PAUSED || status == this.reproductor.MEDIA_STOPPED){
                    clearInterval(this.timer);
                    this.iconoPlayPause = 'play';
                    this.reproduciendo = false;
                    MusicControls.updateIsPlaying(this.reproduciendo);
                    if (status == this.reproductor.MEDIA_STOPPED){
                        console.log ("[REPRODUCTOR.iniciaContadorRep] Poniendo la posición del reproductor a 0");
                        this.posicionRep = 0;
                        this.posicionRepStr = this.dameTiempo(Math.round(0));
                        this.enVivo = false; // Si se ha terminado seguro que ya no es en vivo.
                    }
                    else {
                        console.log ("[REPRODUCTOR.iniciaContadorRep] Sin modificar la posición del reproductor a 0");
                    }
                }
            }).catch ((e) =>{
                console.log("Error getting pos=" + e);
            });
        }, 1000);
    }

    playPause(){
        let descargaPermitida = (Network.type === "wifi" || !this.soloWifi);
        console.log ("[Descarga.components.descargarFichero] La conexión es " + Network.type + " y la obligación de tener wifi es " + this.soloWifi);
        if (this.reproductor != null){
            if (this.reproduciendo) {
                clearInterval(this.timer);
                if (this.enVivo){
                    this.reproductor.stop();
                    this.reproductor.release();
                    this.reproductor = new Player(this.audioEnRep, this._configuracion);
                }
                else {
                    this.reproductor.pause();
                }
                this.iconoPlayPause = 'play';
                this.reproduciendo=false;
            }
            else {
                console.log("[reproductor.playpause] tipo de conexión: " + Network.type + " noRequiereDescarga " + this.noRequiereDescarga);
                if (descargaPermitida || this.noRequiereDescarga) {
                    this.reproductor.play(this.audioEnRep);
                    this.iconoPlayPause = 'pause';
                    /*if (this.parche){
                        if (this.posicionRep > 0){
                            console.log ("[REPRODUCTOR.playPause] Comenzando vigilancia de play. ");
                            let timerSeek = setInterval(() =>{
                                if (this.reproductor.dameStatus() == this.reproductor.MEDIA_RUNNING){
                                    clearInterval(timerSeek);
                                    this.actualizaPosicion();
                                    console.log ("[REPRODUCTOR.playPause] Actualizando posición de reproducción ");
                                }
                            }, 500);
                            this.parche = false;
                        }
                    }*/
                    this.iniciaContadorRep();
                    this.reproduciendo=true;
                }
                else{
                    this.msgDescarga ("Sólo tiene permitidas reproducción por streaming con la conexión WIFI activada.");
                }
            }
            console.log("[reproductor.playpause] actualizando status control remoto");
            MusicControls.updateIsPlaying(this.reproduciendo);
        }
        else Dialogs.alert("Es nulo. (Error reproduciendo)", 'Error');
    }

    actualizaPosicion(){
        if (this.reproductor != null){
            this.reproductor.seekTo(this.posicionRep);
            this.posicionRepStr = this.dameTiempo(Math.round(this.posicionRep/1000));
            console.log("[REPRODUCTOR.actualizaPosicion] Ha cambiado la posición del slider: " + this.posicionRepStr);
        }
        else {
            console.log("[REPRODUCTOR.actualizaPosicion] No cambio la posición del slider porque reproductor es nulo.");
        }
    }

    adelanta(){
        this.reproductor.adelantaRep();
    }

    retrasa(){
        this.reproductor.retrocedeRep();
    }

    compartir(){
        console.log ("[REPRODUCTOR.compartir] Compartiendo url " + this.httpAudio);
        var options = {
            message: this.titulo, // not supported on some apps (Facebook, Instagram)
            subject: 'Creo que esto puede interesarte.', // fi. for email
            files: [], //[this.imagen], //[imagen], // an array of filenames either locally or remotely
            url: this.httpAudio,
            chooserTitle: 'Selecciona aplicación.' // Android only, you can override the default share sheet title
        }

        SocialSharing.shareWithOptions(options).then(() => {
            console.log("[REPRODUCTOR.compartir] enviado Ok"); // On Android apps mostly return false even while it's true
        }).catch(() => {
            console.log("[REPRODUCTOR.compartir] enviado KO");
        });
    }

    actualizaPorcentaje(evento):void{
        this.porcentajeDescargado = evento.porcentaje;
        console.log ("[actualizaPorcentaje] Escrito en porcentajeDescargado: "+ this.porcentajeDescargado);
       /* if(this.timerDescarga == 0){
            this.timerDescarga = setInterval(() =>{
                console.log ("[actualizaPorcentaje] timerDescarga: "+ this.porcentajeDescargado);
                if (this.porcentajeDescargado == 0){
                    clearInterval(this.timerDescarga);
                    console.log ("[actualizaPorcentaje] timerDescarga-> "+ this.timerDescarga);
                    this.timerDescarga = 0;
                    console.log ("[actualizaPorcentaje] clearInterval *********************************** ");
                }
            }, 1000);
        }*/
    }

    muestraDetalle(myEvent) {
        //let popover = this.popoverCtrl.create(DetalleCapituloPage, {id_episodio: this.episodio});
        console.log ("[REPRODUCTOR.muestraDetalle] Enviando datos : " + this.capItem.title + " - " +  this.capItem.description);
        let popover = this.popoverCtrl.create(DetalleCapituloPage, {titulo: this.capItem.title, detalle: this.capItem.description});
        popover.present({ ev: myEvent }) ;
    }

    ficheroDescargado(fichero):void{
        let nombrerep: string;
        //let meVoyPorAqui: number = 0;
        if (fichero.existe ){
            nombrerep = cordova.file.dataDirectory + this.episodio + '.mp3';
            console.log("[ficheroDescargado] EL fichero existe. Reproduciendo descarga");
            this.noRequiereDescarga = true;
        } else {
            nombrerep = 'https://api.spreaker.com/listen/episode/'+this.episodio+'/http';
            console.log("[ficheroDescargado] EL fichero no existe. Reproduciendo de red");
            this.noRequiereDescarga = false;
        };
        if (this.audioEnRep != null){
            console.log("[ficheroDescargado] Segunda o más vez que entramos.");
            if (this.audioEnRep != nombrerep){
                /*if (this.audioEnRep.includes(this.episodio)) {
                    this.reproductor.getCurrentPosition().then((position)=>{
                        meVoyPorAqui = position;
                        console.log("[ficheroDescargado] Recibido que se va por "+ meVoyPorAqui);
                    });
                    console.log("[ficheroDescargado] El mismo fichero pero recién descargado (o recién borrado).");
                }*/
                this.reproductor.release();
                this.audioEnRep = nombrerep;
                if (this.reproductor == null) {
                    this.reproductor = new Player(this.audioEnRep, this._configuracion);
                    console.log("[ficheroDescargado] reproductor es nulo");
                } else {
                    this.reproduciendo = (this.reproductor.dameStatus()==this.reproductor.MEDIA_RUNNING);
                    if (this.reproduciendo && (Network.type === 'wifi' || !this.soloWifi)){
                        this.iconoPlayPause = 'pause';
                        this.iniciaContadorRep();
                        this.reproductor.play(this.audioEnRep);
                        console.log("[ficheroDescargado] ya estaba reproduciendo. Se iba por " + this.posicionRep/1000);
                    }
                }
                // this.actualizaPosicion();//*1000);
            }
        }
        else {
            console.log("[ficheroDescargado] Primera vez que entramos.");
            this.audioEnRep = nombrerep;
            if (this.reproductor == null) {
                this.reproductor = new Player(this.audioEnRep, this._configuracion);
                console.log("[ficheroDescargado] reproductor es nulo");
                this.parche = true;
            }
            else {
                if (this.reproductor.reproduciendoEste(this.audioEnRep)){
                    this.iconoPlayPause = 'pause';
                    this.iniciaContadorRep();
                    this.reproduciendo = (this.reproductor.dameStatus()==this.reproductor.MEDIA_RUNNING);
                }
                else {
                    this.iconoPlayPause = 'play';
                    this.parche = true;
                }
            }
        }
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
