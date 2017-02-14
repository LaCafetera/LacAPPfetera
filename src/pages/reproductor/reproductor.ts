/*npm install -g typings
typings install dt~cordova --save --global

ionic plugin add cordova-plugin-file-transfer*/

 // Esta es la línea comentada. JCSR. http://stackoverflow.com/questions/33905001/cordova-media-plugin-stopped-working-on-android-6/34045084

import { Component/*, Output, EventEmitter*/ } from '@angular/core';
import { NavController, NavParams, Platform, PopoverController, Events } from 'ionic-angular';
import { SocialSharing, Dialogs, MusicControls } from 'ionic-native';
import { EpisodiosService } from '../../providers/episodios-service';
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
  providers: [EpisodiosService]
})
export class ReproductorPage {

    capItem: any;

    // Parámetros de entrada----
    episodio: string;
    imagen: string;
    enVivo: boolean;
    reproductor: Player;
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

    titulo: string;
    descripcion: string;

    audio: string;
    storageDirectory: string = '';

    porcentajeDescargado: number;

    pantallaChat= ChatPage;


    constructor(public navCtrl: NavController, public navParams: NavParams, public platform : Platform, private episodiosService: EpisodiosService, public popoverCtrl: PopoverController, public events: Events) {

        this.capItem = this.navParams.get('episodio');
        this.episodio = this.capItem.episode_id;
        this.imagen = this.capItem.image_url;
        this.enVivo = this.capItem.type=="LIVE";
        this.reproductor = this.navParams.get('player');
        this.episodioDescarga = (this.enVivo?null:this.episodio);
        console.log("[reproductor] Enviado como episodio: " + this.episodioDescarga + "(" + this.episodio +")  porque enVivo vale " + this.enVivo);
        this.titulo = this.capItem.title;
        this.descripcion = this.capItem.description;
        this.totDurPlay =  this.capItem.duration;
        this.tamanyoStr = this.dameTiempo(this.totDurPlay/1000);
    }

    ionViewDidLoad() {
        MusicControls.create({
            track       : this.capItem.title,        // optional, default : ''
            artist      : 'Radiocable.com',             // optional, default : ''
            cover       : this.capItem.image_url,      // optional, default : nothing
            // cover can be a local path (use fullpath 'file:///storage/emulated/...', or only 'my_image.jpg' if my_image.jpg is in the www folder of your app)
            //           or a remote url ('http://...', 'https://...', 'ftp://...')
            isPlaying   : false,                         // optional, default : true
            dismissable : true,                         // optional, default : false

            // hide previous/next/close buttons:
            hasPrev   : true,      // show previous button, optional, default: true
            hasNext   : true,      // show next button, optional, default: true
            hasClose  : false,       // show close button, optional, default: false

            // Android only, optional
            // text displayed in the status bar when the notification (and the ticker) are updated
            ticker    : 'Bienvenido a Sherwood'
        });
        /*console.log('ionViewDidLoad ReproductorPage');
        this.events.subscribe('pctjeDescarga:cambiado', (pctjeDescarga) => {
            this.porcentajeDescargado=pctjeDescarga;
            console.log('[Reproductor] Recibido pctje descarga '+pctjeDescarga + ' - ' + this.porcentajeDescargado);
        });*/

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
                //case 'music-controls-destroy':
                    // Do something
                  //  break;

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
    }   


    ngOnDestroy(){
        //this.salidaPagina.emit({reproductor: this.reproductor});
        this.events.publish('audio:modificado', this.reproductor);
        MusicControls.destroy(); // onSuccess, onError
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
        this.timer = setInterval(() =>{
            this.reproductor.getCurrentPosition().then((position)=>{
                let status = this.reproductor.dameStatus();
        //        console.log("[REPRODUCTOR] status vale "+ status + " y parado vale " + this.reproductor.MEDIA_STOPPED);
                //console.log("Posición: "+ position*1000 + ". Status: "+ this.statusRep + " - " + this.reproductor.MEDIA_RUNNING);
                if (position > 0 && status == this.reproductor.MEDIA_RUNNING) {
                    this.posicionRep = position*1000;
                    this.posicionRepStr = this.dameTiempo(Math.round(position));
                 //   console.log ("[REPRODUCTOR] Reproductor por " + position + " (" + Math.round(position) + ")");
                }
                if (status == this.reproductor.MEDIA_PAUSED || status == this.reproductor.MEDIA_STOPPED){
                    this.iconoPlayPause = 'play';
                    this.reproduciendo = false;
                    if (status == this.reproductor.MEDIA_STOPPED){
                        clearInterval(this.timer);
                        this.posicionRep = 0;
                        this.posicionRepStr = this.dameTiempo(Math.round(0));
                        this.enVivo = false; // Si se ha terminado seguro que ya no es en vivo.
                    }
                }
            }).catch ((e) =>{
                console.log("Error getting pos=" + e);
            });
        }, 1000);
    }

    playPause(){
        if (this.reproductor != null){
            console.log ("[REPRODUCTOR.playPause] " + this.reproductor);
            if (this.reproduciendo) {
                this.reproductor.pause();
                clearInterval(this.timer);
                this.iconoPlayPause = 'play';
                this.reproduciendo=false;
            }
            else {
                this.reproductor.play(this.audioEnRep);
                this.iconoPlayPause = 'pause';
                this.iniciaContadorRep();
                this.reproduciendo=true;
            }
            MusicControls.updateIsPlaying(this.reproduciendo);
        }
        else Dialogs.alert("Es nulo. (Error reproduciendo)", 'Error');
    }

    actualizaPosicion(){
        this.reproductor.seekTo(this.posicionRep);
        //console.log("Ha cambiado la posición del slider: " + this.posicionRep);
    }

    adelanta(){
        this.reproductor.adelantaRep();
    }

    retrasa(){
        this.reproductor.retrocedeRep();
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
        console.log ("[actualizaPorcentaje] Escrito en porcentajeDescargado: "+ this.porcentajeDescargado);
    }

    muestraDetalle(myEvent) {
        let popover = this.popoverCtrl.create(DetalleCapituloPage, {id_episodio: this.episodio});
        popover.present({ ev: myEvent }) ;
    }

    ficheroDescargado(fichero):void{
        let nombrerep: string;
        let meVoyPorAqui: number = 0;
        if (fichero.existe ){
            nombrerep = cordova.file.dataDirectory + this.episodio + '.mp3';
            console.log("[ficheroDescargado] EL fichero existe. Reproduciendo descarga");
        } else {
            nombrerep = 'https://api.spreaker.com/listen/episode/'+this.episodio+'/http';
            console.log("[ficheroDescargado] EL fichero no existe. Reproduciendo de red");
        };
        if (this.audioEnRep != null){
            console.log("[ficheroDescargado] Segunda o más vez que entramos.");
            if (this.audioEnRep != nombrerep){
                if (this.audioEnRep.includes(this.episodio)) {
                    this.reproductor.getCurrentPosition().then((position)=>{
                        meVoyPorAqui = position;
                        console.log("[ficheroDescargado] REcibido que se va por "+ meVoyPorAqui);
                    });
                    console.log("[ficheroDescargado] El mismo fichero pero recién descargado (o recién borrado).");
                }
                this.reproductor.release();
                this.audioEnRep = nombrerep;
                if (this.reproductor == null) {
                    this.reproductor = new Player(this.audioEnRep);
                    console.log("[ficheroDescargado] reproductor es nulo");
                } else {
                    this.reproduciendo = (this.reproductor.dameStatus()==this.reproductor.MEDIA_RUNNING);
                    if (this.reproduciendo){
                        this.iconoPlayPause = 'pause';
                        this.iniciaContadorRep();
                        this.reproductor.play(this.audioEnRep);
                        this.reproductor.seekTo(this.posicionRep);//*1000);
                        console.log("[ficheroDescargado] ya estaba reproduciendo. Se iba por " + this.posicionRep/1000);
                    }
                }
            }
        }
        else {
            console.log("[ficheroDescargado] Primera vez que entramos.");
            this.audioEnRep = nombrerep;
            if (this.reproductor == null) {
                this.reproductor = new Player(this.audioEnRep);
                console.log("[ficheroDescargado] reproductor es nulo");
            }
            else {
                if (this.reproductor.reproduciendoEste(this.audioEnRep)){
                    this.iconoPlayPause = 'pause';
                    this.iniciaContadorRep();
                    this.reproduciendo = (this.reproductor.dameStatus()==this.reproductor.MEDIA_RUNNING);
                }
                else {
                    this.iconoPlayPause = 'play';
                }
            }
        }
    }
}
