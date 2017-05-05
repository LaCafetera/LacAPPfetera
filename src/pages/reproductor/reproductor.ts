import { Component/*, Output, EventEmitter*/ } from '@angular/core';
import { NavController, NavParams, Platform, PopoverController, Events, ToastController } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Dialogs } from '@ionic-native/dialogs';
import { Network } from '@ionic-native/network';
import { MusicControls } from '@ionic-native/music-controls';

import { EpisodiosService } from '../../providers/episodios-service';
import { ConfiguracionService } from '../../providers/configuracion.service';
import { CadenasTwitterService } from '../../providers/cadenasTwitter.service';
import { DetalleCapituloPage } from '../detalle-capitulo/detalle-capitulo';
import { ChatPage } from '../chat/chat';
import { Player } from '../../app/player';

//import { DescargaCafetera } from '../../app/descarga.components';

//declare var cordova: any

/*
  Generated class for the Reproductor page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-reproductor',
  templateUrl: 'reproductor.html',
  providers: [EpisodiosService, ConfiguracionService, CadenasTwitterService, Dialogs, SocialSharing, Network, Player]
})
export class ReproductorPage {

    capItem: any;
    reproductor: Player;

    // Parámetros de entrada----
    noRequiereDescarga: boolean=true;
    episodio: string;
    imagen: string;
    enVivo: boolean;
    // Hasta aquí
    episodioDescarga: string;
    audioEnRep: string = null;
    reproduciendo: boolean = false;
    descargando: boolean = false;
    statusRep: number;
    ficheroExiste: boolean;
    posicionRepStr: string = "00:00:00";
    tamanyoStr: string = "01:00:00"
    posicionRep: number = 0;
    totDurPlay: number;
    iconoPlayPause: string = 'play';
    timer: any;
    timerDescarga: number = 0;
    timerVigilaEnVivo: number;

    titulo: string;
    descripcion: string;

    httpAudio: string;
    storageDirectory: string = '';

    porcentajeDescargado: number = 0;

    pantallaChat= ChatPage;
    mscControl: MusicControls;
    soloWifi: boolean;
    dirTwitter: string = "";
    tituloObj: Array<Object>;
    episodioLike: boolean = false;
    colorLike: string = "";

    pagChat: any = ChatPage;


    constructor(public navCtrl: NavController, 
                public navParams: NavParams, 
                public platform : Platform, 
                private episodiosService: EpisodiosService, 
                public popoverCtrl: PopoverController, 
                public events: Events, 
                public toastCtrl: ToastController, 
                private _configuracion: ConfiguracionService, 
                public cadenaTwitter: CadenasTwitterService,
                private dialogs: Dialogs,
                private socialsharing: SocialSharing,
                private network: Network,
                private player: Player) {

        this.capItem = this.navParams.get('episodio').objeto;
        this.episodioLike = this.navParams.get('episodio').like;
        if(this.episodioLike){
            this.colorLike = "danger";
        }
        this.episodio = this.capItem.episode_id;
        this.httpAudio = this.capItem.site_url;
        this.imagen = this.capItem.image_url;
        this.enVivo = this.capItem.type=="LIVE";
        this.reproductor = this.navParams.get('player');
        this.mscControl = this.navParams.get('controlador');
        this.soloWifi = this.navParams.get('soloWifi');
        this.episodioDescarga = (this.enVivo?null:this.episodio);
        this.dirTwitter = this.navParams.get('enlaceTwitter');// + "?f=tweets" ;
        this.titulo = this.capItem.title;
        this.descripcion = this.capItem.description;
        this.totDurPlay =  this.capItem.duration;
        this.tamanyoStr = this.dameTiempo(this.totDurPlay/1000);
        this.tituloObj = cadenaTwitter.troceaCadena(this.titulo);

        if (this.mscControl == null) {
            this.mscControl = new MusicControls ();
        }

        if (this.reproductor == null) {
            this.reproductor = this.player;
        }

        this._configuracion.getTwitteado(this.episodio)
            .then((val)=> {
            //    console.log("[REPRODUCTOR.constructor] recibida verificación de twitteado " + val + " para el capítulo " + this.episodio );
                if (val == null){ //Si es null nunca se ha guardado nada, con lo que no hemos preguntado.
                    this.twitteaCapitulo ();
                    this._configuracion.setTwitteado(this.episodio);
                }
                //this.actualizaPosicion();
            })
            .catch(()=>{
                console.log("[REPRODUCTOR.constructor] Error recuperando posición de la reproducción.");
            });
    }

    /****************************************
     HAy que estudiar esto. Salir de la página cancelará la descarga. ¿Seguro que quiere salir?


  ionViewCanLeave(): boolean{
   // here we can either return true or false
   // depending on if we want to leave this view
   if(isValid(randomValue)){
      return true;
    } else {
      return false;
    }
  }

    */

    ionViewDidLoad() {
        this._configuracion.getWIFI()
            .then((val)=> {
                this.soloWifi = val==true;
            }).catch(()=>{
                this.soloWifi = true;
                console.log("[REPRODUCTOR.ionViewDidLoad] Error recuperando valor WIFI. Forzando escuchar vía WIFI");
            });

        //console.log ("[REPRODUCTOR.ionViewDidLoad] Esto " + this.platform.is("ios")?"sí":"no" + "es ios.");
        this.mscControl.create({
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
            ticker    : 'Bienvenido a Sherwood',
             // iOS only, optional
            album : 'Bienvenido a Sherwood',
            duration: 0,
            elapsed: 0
        })
        .then(() => {console.log("[REPRODUCTOR.ionViewDidLoad] Control remoto creado OK") })
        .catch((error) => {console.log("[REPRODUCTOR.ionViewDidLoad] ***** ERROR ***** Control remoto creado KO " + error) });

        this.mscControl.subscribe()
            .subscribe((action) => {
                switch(action) {
                    case 'music-controls-next':
                        this.adelanta();
                        console.log("[REPRODUCTOR.ionViewDidLoad] music-controls-next");
                        break;
                    case 'music-controls-previous':
                        this.retrasa();
                        console.log("[REPRODUCTOR.ionViewDidLoad] music-controls-previous");
                        break;
                    case 'music-controls-pause':
                        this.playPause();
                        console.log("[REPRODUCTOR.ionViewDidLoad] music-controls-pause");
                        break;
                    case 'music-controls-play':
                        this.playPause();
                        console.log("[REPRODUCTOR.ionViewDidLoad] music-controls-play");
                        break;
                    case 'music-controls-destroy':
                        this.platform.exitApp();
                        break;

                    case 'music-controls-media-button' :
                // External controls (iOS only)
                    case 'music-controls-toggle-play-pause' :
                        this.playPause();
                        console.log("[REPRODUCTOR.ionViewDidLoad] music-controls-toggle-play-pause");
                        break;

                    // Headset events (Android only)
                    // All media button events are listed below
                        // Do something
                    //    break;
                    case 'music-controls-headset-unplugged':
                        this.reproductor.pause();
                        console.log("[REPRODUCTOR.ionViewDidLoad] music-controls-headset-unplugged");
                        break;
                    case 'music-controls-headset-plugged':
                        this.reproductor.pause();
                        console.log("[REPRODUCTOR.ionViewDidLoad] music-controls-headset-plugged");
                        break;
                    default:
                        break;
                }
            },
            (error) => {console.log("[REPRODUCTOR.ionViewDidLoad] Error en valor recibido desde music-controls")}
        );
        this.mscControl.listen();

        console.log("[REPRODUCTOR.ionViewDidLoad] EnVivo vale "+ this.enVivo);

        if (this.enVivo){
            this.timerVigilaEnVivo = setInterval(() =>{
                this.episodiosService.dameDetalleEpisodio(this.episodio).subscribe(
                    data => {
                        if (data.response.episode.type != "LIVE"){
                            clearInterval(this.timerVigilaEnVivo);
                            this.enVivo = false;
                            this.episodioDescarga = data.response.episode.episode_id;
                            this.totDurPlay = data.response.episode.duration;
                            this.tamanyoStr = this.dameTiempo(this.totDurPlay/1000);
                        }
                        else {
                            console.log("[REPRODUCTOR.ionViewDidLoad] El primer episodio sigue siendo en vivo.");
                        }
                    }
            )}, 3000);
        }
        else{
            console.log("[REPRODUCTOR.ionViewDidLoad] No es en vivo.");
        }
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
        this.timer = setInterval(() => {
            this.reproductor.getCurrentPosition()
                .then((position) => {
                    let status = this.reproductor.dameStatus();
            //        console.log("[REPRODUCTOR] status vale "+ status + " y parado vale " + this.reproductor.MEDIA_STOPPED);
                    console.log("[REPRODUCTOR.iniciaContadorRep] Posición: " + position*1000 + ". Status: " + status + " - " + this.reproductor.dameStatusRep());
                    if (position > 0 && status == this.reproductor.dameStatusRep()) {
                        this.posicionRep = position*1000;
                        this.posicionRepStr = this.dameTiempo(Math.round(position));
                    //   console.log ("[REPRODUCTOR] Reproductor por " + position + " (" + Math.round(position) + ")");
                    }
                    if (status == this.reproductor.dameStatusPause() || status == this.reproductor.dameStatusStop()){
                        clearInterval(this.timer);
                        this.iconoPlayPause = 'play';
                        this.reproduciendo = false;
                        this.mscControl.updateIsPlaying(this.reproduciendo);
                        //this.mscControl.updateDismissable(true);
                        if (status == this.reproductor.dameStatusStop()){
                            console.log ("[REPRODUCTOR.iniciaContadorRep] Poniendo la posición del reproductor a 0");
                            this.posicionRep = 0;
                            this.posicionRepStr = this.dameTiempo(Math.round(0));
                            this.enVivo = false; // Si se ha terminado seguro que ya no es en vivo.
                        }
                        else {
                            console.log ("[REPRODUCTOR.iniciaContadorRep] Sin modificar la posición del reproductor a 0");
                        }
                    }
                })
                .catch ((e) => {
                    console.log("Error getting pos=" + e);
                });
        }, 1000);
    }

    playPause(){
        let descargaPermitida = (this.network.type === "wifi" || !this.soloWifi);
        console.log ("[REPORDUCTOR.playPause] La conexión es " + this.network.type + " y la obligación de tener wifi es " + this.soloWifi);
        if (this.reproductor != null){
            if (this.reproduciendo) {
                clearInterval(this.timer);
                if (this.enVivo){
                    this.reproductor.stop();
                    this.reproductor.release();
                    this.reproductor.crearepPlugin(this.audioEnRep, this._configuracion);
                }
                else {
                    this.reproductor.pause();
                }
                this.iconoPlayPause = 'play';
                this.reproduciendo = false;
            }
            else {
                if (descargaPermitida || this.noRequiereDescarga) {
                    this.reproductor.play(this.audioEnRep);
                    this.iconoPlayPause = 'pause';
                    this.iniciaContadorRep();
                    this.reproduciendo = true;
                }
                else{
                    this.msgDescarga ("Sólo tiene permitidas reproducción por streaming con la conexión WIFI activada.");
                }
            }
            console.log("[REPRODUCTOR.playpause] actualizando status control remoto");
            this.mscControl.updateIsPlaying(this.reproduciendo);
            //this.mscControl.updateDismissable(true);
        }
        else this.dialogs.alert("Es nulo. (Error reproduciendo)", 'Error');
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
        console.log("[REPRODUCTOR.adelanta] Adelantando.");
        this.reproductor.adelantaRep();
    }

    retrasa(){
        console.log("[REPRODUCTOR.retrasa] Retrasando.");
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

        this.socialsharing.shareWithOptions(options).then(() => {
            console.log("[REPRODUCTOR.compartir] enviado Ok"); // On Android apps mostly return false even while it's true
        }).catch(() => {
            console.log("[REPRODUCTOR.compartir] enviado KO");
        });
    }

    twitteaCapitulo(){
        this.dialogs.confirm('¡Ayudanos twitteando la dirección del programa!', '¡Ayudanos!', ['¡Café para todos!', 'Mejor no'])
            .then((respuesta) => {
                console.log ("[REPRODUCTOR.twitteaCapitulo] Recibida respuesta: " + respuesta);
                if (respuesta == 1) {// café para todos
                    this.socialsharing.shareViaTwitter(this.titulo, this.imagen, this.httpAudio)
                        .then((respuesta) => {
                            console.log ("[REPRODUCTOR.twitteaCapitulo] Twitteo OK: " + respuesta);
                        })
                        .catch((error) => {
                            console.log ("[REPRODUCTOR.twitteaCapitulo] Twitteo KO: " + error);
                        });
                }
                this._configuracion.setTwitteado(this.episodio);
            })
            .catch((error) => {
                console.log ("[REPRODUCTOR.twitteaCapitulo] Error en consulta: " + error)
            }); 
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
            nombrerep = encodeURI(/*cordova.file.dataDirectory + */this.episodio + '.mp3');
            console.log("[REPRODUCTOR.ficheroDescargado] EL fichero existe. Reproduciendo descarga. " + nombrerep + " . ");
            this.noRequiereDescarga = true;
        } else {
            nombrerep = encodeURI('https://api.spreaker.com/v2/episodes/'+this.episodio+'/play');
            console.log("[REPRODUCTOR.ficheroDescargado] EL fichero no existe. Reproduciendo de red. " + nombrerep + " . ");
            this.noRequiereDescarga = false;
        };
        if (this.audioEnRep != null){
            console.log("[REPRODUCTOR.ficheroDescargado] Segunda o más vez que entramos.");
            if (this.audioEnRep != nombrerep){
                this.reproductor.release();
                this.audioEnRep = nombrerep;
                if (this.reproductor == null) {
                    this.reproductor.crearepPlugin (this.audioEnRep, this._configuracion);
                    console.log("[REPRODUCTOR.ficheroDescargado] reproductor es nulo");
                } else {
                    this.reproduciendo = (this.reproductor.dameStatus()==this.reproductor.dameStatusRep());
                    if (this.reproduciendo && (this.network.type === 'wifi' || !this.soloWifi)){
                        this.iconoPlayPause = 'pause';
						this.reproduciendo = true;
                        this.iniciaContadorRep();
                        this.reproductor.play(this.audioEnRep);
                        console.log("[REPRODUCTOR.ficheroDescargado] ya estaba reproduciendo. Se iba por " + this.posicionRep/1000);
                    }
                }
            }
        }
        else {
            console.log("[REPRODUCTOR.ficheroDescargado] Primera vez que entramos." + this.reproductor);
            this.audioEnRep = nombrerep;
            if (this.reproductor == null) {
                console.log("[REPRODUCTOR.ficheroDescargado] reproductor es nulo");
                this.reproductor.crearepPlugin(this.audioEnRep, this._configuracion);
            }
            else {
                console.log("[REPRODUCTOR.ficheroDescargado] reproductor no es nulo");
                if (this.reproductor.reproduciendoEste(this.audioEnRep)){
                    console.log("[REPRODUCTOR.ficheroDescargado] Estábamos reproduciendo este mismo audio");
                    this.iconoPlayPause = 'pause';
					this.reproduciendo = true;
                    this.iniciaContadorRep();
                    this.reproduciendo = (this.reproductor.dameStatus()==this.reproductor.dameStatusRep());
                }
                else {
                    console.log("[REPRODUCTOR.ficheroDescargado] Estábamos reproduciendo otro audio");
                    this.iconoPlayPause = 'play';
					this.reproduciendo = false;
                }
            }
        }
		this.mscControl.updateIsPlaying(this.reproduciendo);
        //this.mscControl.updateDismissable(true);
    }

    meGustasMucho(){
        this._configuracion.dameUsuario()
        .then ((dataUsuario) => {
            if (dataUsuario != null){
                this._configuracion.dameToken()
                .then ((dataToken) => {
                    if (this.episodioLike){
                        console.log("[REPRODUCTOR.meGustasMucho] solicitado envío de dislike para usuario " + dataUsuario);
                        this.episodiosService.episodioDislike(this.episodio, dataUsuario, dataToken ).subscribe(
                            data => {
                                console.log("[REPRODUCTOR.meGustasMucho] eliminando like:" + JSON.stringify(data));
                                this.episodioLike = false;
                                this.colorLike = "";
                            },
                            err => {
                                console.log("[REPRODUCTOR.meGustasMucho] Error eliminando like al episodio:" + err);
                            }
                        );
                    }
                    else {
                        console.log("[REPRODUCTOR.meGustasMucho] solicitado envío de like para usuario " + dataUsuario);
                        this.episodiosService.episodioLike(this.episodio, dataUsuario, dataToken).subscribe(
                            data => {
                                console.log("[REPRODUCTOR.meGustasMucho] Aceptado el like:" + JSON.stringify(data));
                                this.episodioLike = true;
                                this.colorLike = "danger";
                            },
                            err => {
                                console.log("[REPRODUCTOR.meGustasMucho] Error mandando like al episodio:" + err);
                            }
                        );
                    }
                })
                .catch ((error) => {
                    console.log("[REPRODUCTOR.meGustasMucho] Error descargando token:" + error);
                    this.msgDescarga ("Error extrayendo usuario de Spreaker.");
                });
            }
            else {
                this.msgDescarga ("Error extrayendo usuario de Spreaker.");
            }
        })
        .catch (() => {
            this.msgDescarga ("Debe estar conectado a Spreaker para poder realizar esa acción.");
        });
    }
/*
    estaLogeado (){
        return true;
    }
*/
    msgDescarga  (mensaje: string) {
        let toast = this.toastCtrl.create({
            message: mensaje,
            duration: 3000,
            cssClass: 'msgDescarga'
        });
        toast.present();
    }
}

