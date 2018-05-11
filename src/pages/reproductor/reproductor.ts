import { Component, ChangeDetectorRef,/*, Output, EventEmitter*/ OnDestroy} from '@angular/core';
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
export class ReproductorPage implements OnDestroy{

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
    //statusRep: number;
    ficheroExiste: boolean;
    posicionRepStr: string = "00:00:00";
    tamanyoStr: string = "01:00:00"
    posicionRep: number = 0;
    totDurPlay: number;
    iconoPlayPause: string = 'play';
    timer: number = 0;
    timerDescarga: number = 0;
    timerVigilaEnVivo: number;
    timerParpadeo: number = 0;

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

    ocultaTiempoRep: boolean = false;
    

    longAudioLiveDescargado: number = 0;
    esIOS: boolean = false;
    capItemTxt: string;

    // Con esta variable vamos a monitorizar posibles cortes. Será false si Schrodingüer me dice que el capítulo está vivo, o si siendo 
    // retaguardia el capítulo no ha llegado al final. Si siendo true llega un estado de Stop, entonces saltará el error de conexión.
    corteEnDescarga: boolean = false;
    // Puede haber terminado la reproducción porque hayan pulsado stop...
    stopPulsado:boolean = false; 

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
                private player: Player,
                private chngDetector: ChangeDetectorRef) {

        this.capItem = this.navParams.get('episodio').objeto;
        this.capItemTxt = JSON.stringify(this.capItem);
        this.episodioLike = this.navParams.get('episodio').like;
        if(this.episodioLike){
            this.colorLike = "danger";
        }
        this.httpAudio = this.capItem.site_url;
        this.episodio = this.capItem.episode_id;
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
        this.esIOS = this.platform.is('ios');

        if (this.mscControl == null) {
            console.log("[REPRODUCTOR.ngOnInit] Creando un nuevo player en la zona de notificación.");
            this.mscControl = new MusicControls ();
            this.creaControlEnNotificaciones (false);
        }
        if (this.reproductor == null) {
            console.log("[REPRODUCTOR.ngOnInit] El reproductor era nulo, así que me lo invento.");
            this.reproductor = this.player;
        }
        console.log("[REPRODUCTOR.ngOnInit] Estatus es :" +  this.reproductor.dameStatusRep());
    }

    /****************************************
     Hay que estudiar esto. Salir de la página cancelará la descarga. ¿Seguro que quiere salir?


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

    
    ngOnInit() {
    //console.log ('[app.component.ngOnInit]');

        this.platform.ready().then(() => {
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
                console.log("[REPRODUCTOR.ngOnInit] Error recuperando posición de la reproducción.");
            });
            this.events.subscribe("reproduccion:status", (statusRep) => this.cambiandoStatusRep(statusRep));
            this.events.subscribe("errorReproduccion:status", (statusRep) => {
                console.log("[REPRODUCTOR.ngOnInit] Error en la reproducción. Recibido " + statusRep.status);
                if (statusRep.status != 0) {
                    this.playPause();
                }
            });
/*
            this.events.subscribe('streaming:descargado', (dato) => {
                console.log('[REPRODUCTOR.ngOnInit] Me dicen que ha terminado el programa en vivo.' + JSON.stringify(dato));
                if (dato.valor) {
                    this.corteEnDescarga = true;
                }
                else{
                    this.stop();
                    this.dialogs.alert("Error descargando audio de Spreaker. ¿Problemas de conexión?", 'Error');
                }
                console.log('[REPRODUCTOR.ngOnInit] Me dicen que ha terminado el programa en vivo.' + dato.valor);
            });*/
        })
        .catch((error)=>{
            console.log('[REPRODUCTOR.ngOnInit] Error:' + JSON.stringify(error));
        });
    }

    ionViewDidLoad() {
        this._configuracion.getWIFI()
            .then((val)=> {
                this.soloWifi = val==true;
            }).catch(()=>{
                this.soloWifi = true;
                console.log("[REPRODUCTOR.ionViewDidLoad] Error recuperando valor WIFI. Forzando escuchar vía WIFI");
            });

        //console.log ("[REPRODUCTOR.ionViewDidLoad] Esto " + this.platform.is("ios")?"sí":"no" + "es ios.");

        console.log("[REPRODUCTOR.ionViewDidLoad] EnVivo vale "+ this.enVivo);

        if (this.enVivo){
            this.timerVigilaEnVivo = setInterval(() => this.gatoSchrodinger(), 1000);
        }
        else{
            console.log("[REPRODUCTOR.ionViewDidLoad] No es en vivo.");
        }
    }

    ngOnDestroy(){
        //this._configuracion.setTimeRep(this.episodio, this.posicionRep);
        clearInterval(this.timer);
        clearInterval(this.timerVigilaEnVivo);
        this.timer = this.timerVigilaEnVivo = 0;
        this.events.unsubscribe("reproduccion:status");
        this.events.publish('audio:modificado', {reproductor:this.reproductor, controlador:this.mscControl});
        console.log("[REPRODUCTOR.ngOnDestroy] Saliendoooooooooooooooooooooooooooo!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!.");
        //MusicControls.destroy(); // onSuccess, onError
    }

    creaControlEnNotificaciones (destruir: boolean){
        if (destruir) {
            this.mscControl.destroy();    
            this.creaControlEnNotificaciones (false);
        }
        else {
            this.mscControl.create({
                track       : this.capItem.title,        // optional, default : ''
                artist      : 'Radiocable.com',             // optional, default : ''
                cover       : this.capItem.image_url,      // optional, default : nothing
                isPlaying   : false,                         // optional, default : true
                dismissable : true,                       // Esto es importante ponerlo a true para que no vuelva a arrancar si matan la app

                // hide previous/next/close buttons:
                hasPrev   : true,      // show previous button, optional, default: true
                hasNext   : true,      // show next button, optional, default: true
                hasClose  : !this.esIOS,       // Si es iOS le quito el botón de cerrar.

                // Android only, optional
                // text displayed in the status bar when the notification (and the ticker) are updated
                ticker    : 'Bienvenido a Sherwood',
                // iOS only, optional
                album : 'Bienvenido a Sherwood',
                duration: 0,
                elapsed: 0,
                skipForwardInterval: 15, // display number for skip forward, optional, default: 0
                skipBackwardInterval: 15, // display number for skip backward, optional, default: 0
                hasScrubbing: false // enable scrubbing from control center and lockscreen progress bar, optional
            })
            .then((data) => {console.log("[REPRODUCTOR.creaControlEnNotificaciones] Control remoto creado OK " + JSON.stringify(data)) })
            .catch((error) => {console.log("[REPRODUCTOR.creaControlEnNotificaciones] ***** ERROR ***** Control remoto creado KO " + error) });

            this.mscControl.subscribe()
            .subscribe((action) => {
                console.log("[REPRODUCTOR.creaControlEnNotificaciones] Recibido " + JSON.stringify(action));
                const message = JSON.parse(action).message;
                switch(message) {
                    case 'music-controls-next':
                        this.reproductor.adelantaRep();
                        console.log("[REPRODUCTOR.creaControlEnNotificaciones] music-controls-next");
                        break;
                    case 'music-controls-previous':
                        this.reproductor.retrocedeRep();
                        console.log("[REPRODUCTOR.creaControlEnNotificaciones] music-controls-previous");
                        break;
                    case 'music-controls-pause':
                        console.log("[REPRODUCTOR.creaControlEnNotificaciones] music-controls-pause");
                        //this.playPause(this._configuracion);
                        this.reproductor.pause(this._configuracion);
                        break;
                    case 'music-controls-play':
                        console.log("[REPRODUCTOR.creaControlEnNotificaciones] music-controls-play");
                        this.reproductor.play(this.audioEnRep, this._configuracion);
                        //this.playPause(this._configuracion);
                        break;
                    case 'music-controls-destroy':
                        this.stopPulsado = true;
                        this.reproductor.release(this._configuracion);
                        this.platform.exitApp();
                        break;
                    case 'music-controls-stop-listening':
                        //this.mscControl.destroy();
                        break;

                    case 'music-controls-media-button' :
                // External controls (iOS only)
                    case 'music-controls-toggle-play-pause' :
                        console.log("[REPRODUCTOR.creaControlEnNotificaciones] music-controls-toggle-play-pause");
                        this.playPause();
                        break;
                    case 'music-controls-headset-unplugged':
                        console.log("[REPRODUCTOR.creaControlEnNotificaciones] music-controls-headset-unplugged");
                        this.reproductor.pause(this._configuracion);
                        break;
                    case 'music-controls-headset-plugged':
                        console.log("[REPRODUCTOR.creaControlEnNotificaciones] music-controls-headset-plugged");
                        this.reproductor.pause(this._configuracion);
                        break;
                    default:
                        break;
                }
            },
            (error) => {console.log("[REPRODUCTOR.ionViewDidLoad] Error en valor recibido desde music-controls")});
            this.mscControl.listen();
        }
    }
        
    gatoSchrodinger(){
        this.episodiosService.dameDetalleEpisodio(this.episodio).subscribe(
            // this.episodiosService.sigueSiendoVivo(this.episodio) // Debería usar esto, ya que lo tengo.
            data => {
                //console.log("[REPRODUCTOR.ionViewDidLoad] Respuesta vale: " + data.response.episode.type);
                if (data.response.episode.type != "LIVE"){
                    console.log("[REPRODUCTOR.gatoSchrodinger] El episodio ha muerto. Larga vida al episodio .");
                    clearInterval(this.timerVigilaEnVivo);
                    this.enVivo = false;
                    this.corteEnDescarga = false; //  Si el programa no es en vivo no es aquí donde puedo decidir si hay corte o no.
                    //console.log ("[REPRODUCTOR.gatoSchrodinger] corte en descarga false");
                    this.episodioDescarga = data.response.episode.episode_id;
                    this.totDurPlay = data.response.episode.duration;
                    this.tamanyoStr = this.dameTiempo(this.totDurPlay/1000);
                    this.events.publish('capitulo:fenecido', {valor:data.response.episode.type});
                }
                else{
                    this.corteEnDescarga = true;  // Si estamos en vivo, no "puede" cortarse.
                    //console.log ("[REPRODUCTOR.gatoSchrodinger] corte en descarga true");
                }
            },
            error => {
                console.log("[REPRODUCTOR.gatoSchrodinger] Error revisando si el capítulo " + this.episodio + " sigue estando vivo. Posible error de conexión.");
                this.corteEnDescarga = true; //Si tengo problemas de conexión... true.
                //console.log ("[REPRODUCTOR.gatoSchrodinger] corte en descarga true");
            }
        )   
    }

    cambiandoStatusRep(statusRep) {
        console.log('[REPRODUCTOR.cambiandoStatusRep] Se ha modificado el status de la reproducción a ' + statusRep.status);
        if ((statusRep.status == this.reproductor.dameStatusStop() || statusRep.status == this.reproductor.dameStatusPause()) ){
            console.log("[REPRODUCTOR.cambiandoStatusRep] El reproductor está apagado o fuera de cobertura.");
            if (statusRep.status == this.reproductor.dameStatusStop()) {
                //this.stopPulsado  = false; //tanto si lo habían pulsado como si no, ya no me sirve tenerlo.
                this.posicionRep = 0;
                this.posicionRepStr = "00:00:00";
                console.log("[REPRODUCTOR.cambiandoStatusRep] actualizando status control remoto");
                this.parpadeoTiempoRep(false);
                //this.chngDetector.markForCheck();
                clearInterval(this.timer);
                if (!this.stopPulsado && this.corteEnDescarga){
                    console.error("[REPRODUCTOR.cambiandoStatusRep] Parece que se ha producido un corte en las comunicaciones. " + this.stopPulsado + ' - ' + this.corteEnDescarga);
                    this.dialogs.alert("Se ha producido un corte del flujo de audio con Spreaker.", 'Super - Gurú');
                    this.stop();
                }
                this.stopPulsado = false; // Limpiamos el valor.
            }
            this.reproduciendo = false;
            this.iconoPlayPause = 'play';
            this.chngDetector.markForCheck();
            this.mscControl.updateIsPlaying(this.reproduciendo);
        } // Esto es importante. Cuando salimos del capítulo y entramos en otro, nos llega un status nulo y lo pone todo en marcha. Por eso no vale sólo un "else"
        else if (statusRep.status == this.reproductor.dameStatusRep() || 
                 statusRep.status == this.reproductor.dameStatusStarting()){
            if (statusRep.status == this.reproductor.dameStatusStarting()){
                console.log("[REPRODUCTOR.cambiandoStatusRep] El reproductor está buffereando.");
                this.posicionRepStr = "Cargando café.";
                this.iconoPlayPause = 'pause';
                this.reproduciendo = true;
                //this.stopPulsado  = false; // Parece que esto aquí no pinta nada pero es importante.
                console.log("[REPRODUCTOR.cambiandoStatusRep] actualizando status control remoto");
                this.parpadeoTiempoRep(true);
                this.chngDetector.markForCheck();
                this.mscControl.updateIsPlaying(this.reproduciendo);
            }
            else {
                console.log("[REPRODUCTOR.cambiandoStatusRep] El reproductor está reproduciendo.");
                this.iconoPlayPause = 'pause';
                this.reproduciendo = true;
                this.parpadeoTiempoRep(false);
                console.log("[REPRODUCTOR.cambiandoStatusRep] actualizando status control remoto");
                this.mscControl.updateIsPlaying(this.reproduciendo);
                this.iniciaContadorRep();
            }
        }
    }

    parpadeoTiempoRep(iniciar: boolean){
        //if (!this.enVivo){
            console.log("[REPRODUCTOR.parpadeoTiempoRep] Parpadeo vale " + this.timerParpadeo);
            if (iniciar){
                if ( this.timerParpadeo == 0){
                    console.log("[REPRODUCTOR.parpadeoTiempoRep] Comenzando parpadeo");
                    this.timerParpadeo = setInterval(() =>{ 
                        this.ocultaTiempoRep = !this.ocultaTiempoRep; 
                        // console.log("[REPRODUCTOR.parpadeoTiempoRep] Parpadeando " + this.reproduciendo);
                    }, 1000);
                }
                else {
                    console.log("[REPRODUCTOR.parpadeoTiempoRep] Has intentado iniciar el parpadeo dos veces (Muy hábil, Morgan)");
                }
            }
            else {
                console.log("[REPRODUCTOR.parpadeoTiempoRep] Eliminando parpadeo");
                clearInterval(this.timerParpadeo);
                this.timerParpadeo = 0;
                this.ocultaTiempoRep = false;
                this.chngDetector.markForCheck();
            }
        //}
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
        if (!this.enVivo){
            console.log ("[REPRODUCTOR.iniciaContadorRep] Entrando");
            this.timer = setInterval(() => {
                this.reproductor.getCurrentPosition()
                    .then((position) => {
                        this.posicionRep = position*1000;
                        //console.log ("[REPRODUCTOR.iniciaContadorRep] this.posicionRep: " + this.posicionRep + " this.totDurPlay " + this.totDurPlay);
                        if (Math.abs(this.posicionRep - this.totDurPlay) < 1000) {
                            this.corteEnDescarga = false;
                        }
                        else {
                            this.corteEnDescarga = true;
                        }
                        this.posicionRepStr = this.dameTiempo(Math.round(position));
                        if (!this.enVivo){ // No hay nada que refrescar en la pantalla si estamos en vivo. Pero me interesa el dato.
                            this.chngDetector.detectChanges();
                        }
                    })
                    .catch ((error) => {
                        console.error("[REPRODUCTOR.iniciaContadorRep] Error solicitando posición de la reproducción: " + error);
                    });
            }, 1000);
        }
    }

    stop ()  {
        console.log ("[REPRODUCTOR.stop] solicitada parada de reproducción streaming");
        this.parpadeoTiempoRep(false); // pongo esto aquí por si acaso no le había dado tiempo a empezar a sonar
        this.iconoPlayPause = 'play';
        if (this.reproduciendo) {
            this.reproduciendo = false;
            this.reproductor.stop();// // Comento esto porque hacer stop si no está reproduciendo provoca un error. Con el release lo hago todo.
        }
        this.stopPulsado = true;
        //this.reproductor.release(this._configuracion);
    }

    playPause(/*configuracion: ConfiguracionService*/){
        let descargaPermitida = (this.network.type === "wifi" || !this.soloWifi);
        console.log ("[REPRODUCTOR.playPause] La conexión es " + this.network.type + " y la obligación de tener wifi es " + this.soloWifi + " y reproduciendo vale " + this.reproduciendo);

        if (this.reproductor.inicializado){
            if (this.reproduciendo) {
                console.log ("[REPRODUCTOR.playPause] Está reproduciendo y el timer vale " + this.timer );
                clearInterval(this.timer);  
                this.reproductor.pause(this._configuracion);
                this.reproduciendo = false;
                this.parpadeoTiempoRep(false);
                this.posicionRepStr = this.dameTiempo(Math.round(this.posicionRep/1000));
            }
            else {
                if (descargaPermitida || this.noRequiereDescarga) {
                    this.parpadeoTiempoRep(true);
                    if (this.reproductor.play(this.audioEnRep, this._configuracion)){
                        // si estamos aquí al darle al play hemos cambiado el audio por lo que hay  que renovar el control del area de notificaciones.
                        console.log ("[REPRODUCTOR.playPause] reproduciendo nuevo audio. Regeneramos el reproductor del area de notificacioes." );
                        this.creaControlEnNotificaciones(true); 
                    }
                }
                else{
                    this.msgDescarga ("Sólo tiene permitida reproducción por streaming con la conexión WIFI activada.");
                }
            }
        }
        else this.dialogs.alert("Es nulo. (Error reproduciendo)", 'Super - Gurú');
    }

    actualizaPosicion(){
        if (this.reproductor.inicializado && this.reproductor.dameStatus() != this.reproductor.dameStatusStop()){//} this.reproduciendo){
            this.reproductor.seekTo(this.posicionRep);
            this.posicionRepStr = this.dameTiempo(Math.round(this.posicionRep/1000));
        //    console.log("[REPRODUCTOR.actualizaPosicion] Ha cambiado la posición del slider: " + this.posicionRepStr + " - " + this.posicionRep);
        }
        else {
            console.log("[REPRODUCTOR.actualizaPosicion] No cambio la posición del slider porque reproductor es nulo.");
            this.posicionRep = 0;
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
            files: [this.imagen], //[imagen], // an array of filenames either locally or remotely
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
            nombrerep = encodeURI('https://api.spreaker.com/v2/episodes/'+this.episodio+'/play'); // stream
            console.log("[REPRODUCTOR.ficheroDescargado] EL fichero no existe. Reproduciendo de red. " + nombrerep + " . ");
            this.noRequiereDescarga = false;
        };
        if (this.audioEnRep != null){
            console.log("[REPRODUCTOR.ficheroDescargado] Segunda o más vez que entramos. AudioEnRep vale " + this.audioEnRep);
            if (this.audioEnRep != nombrerep){
                //this.stopPulsado = true; // Esto lo pongo para que no salte el "se ha producido un corte".
                //this.reproductor.release(this._configuracion);
                this.audioEnRep = nombrerep;
                if (!this.reproductor.inicializado) {
                    console.log("[REPRODUCTOR.ficheroDescargado] reproductor es nulo");
                    this.reproductor.crearepPlugin (this.audioEnRep, this._configuracion, false);
                } else {
                    //this.reproduciendo = (this.reproductor.dameStatus()==this.reproductor.dameStatusRep());
                    if (this.reproduciendo && (this.network.type === 'wifi' || !this.soloWifi)){
                        //this.iconoPlayPause = 'pause';
						//this.reproduciendo = true;
                        //this.iniciaContadorRep();
                        this.stopPulsado = true; // Esto lo pongo para que no salte el "se ha producido un corte".
                        this.reproductor.play(this.audioEnRep, this._configuracion);
                        console.log("[REPRODUCTOR.ficheroDescargado] ya estaba reproduciendo. Se iba por " + this.posicionRep/1000);
                    }
                }
            }
        }
        else {
            console.log("[REPRODUCTOR.ficheroDescargado] Primera vez que entramos." + this.reproductor);
            this.audioEnRep = nombrerep;
            if (!this.reproductor.inicializado) {
                console.log("[REPRODUCTOR.ficheroDescargado] reproductor es nulo");
                this.reproductor.crearepPlugin(this.audioEnRep, this._configuracion, false);
            }
            else {
                console.log("[REPRODUCTOR.ficheroDescargado] reproductor no es nulo");
                if (this.reproductor.reproduciendoEste(this.audioEnRep)){
                    console.log("[REPRODUCTOR.ficheroDescargado] Estábamos reproduciendo este mismo audio ");
                    // Se trata de que "cambiandoStatusRep" centralice el cambio del icono del play/pause, el contador, etc...  
                    this.cambiandoStatusRep({status:this.reproductor.dameStatus()});
                    //this.iconoPlayPause = 'pause';
					//this.reproduciendo = true;
                    //this.iniciaContadorRep();

                    //this.reproduciendo = (this.reproductor.dameStatus()==this.reproductor.dameStatusRep());
                }
                else {
                    console.log("[REPRODUCTOR.ficheroDescargado] Estábamos reproduciendo otro audio");
                    //this.iconoPlayPause = 'play';
					//this.reproduciendo = false;
                }
            }
        }
		//this.mscControl.updateIsPlaying(this.reproduciendo);
        //this.mscControl.updateDismissable(true);
    }

    meGustasMucho(){
        this._configuracion.dameUsuario()
        .then ((dataUsuario) => {
            if (dataUsuario != null && dataUsuario != ''){
                this._configuracion.dameToken()
                .then ((dataToken) => {
                    if (this.episodioLike){ 
                        console.log("[REPRODUCTOR.meGustasMucho] solicitado envío de dislike para usuario " + dataUsuario);
                        this.episodiosService.episodioDislike(this.episodio, dataUsuario, dataToken ).subscribe(
                            data => {
                                console.log("[REPRODUCTOR.meGustasMucho] eliminando like:" + JSON.stringify(data));
                                this.episodioLike = false;
                                this.colorLike = "";
                                this.events.publish('like:modificado', {valorLike:this.episodioLike, episodio:this.episodio});
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
                                this.events.publish('like:modificado', {valorLike:this.episodioLike, episodio:this.episodio});
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
                console.log("[REPRODUCTOR.meGustasMucho] El código de usuario es nulo");
                this.msgDescarga ("Por favor, conéctese a Spreaker en el menú de la app.");
            }
        })
        .catch (() => {
            this.msgDescarga ("Error extrayendo usuario de Spreaker.");
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

/*/---------------------- revisar ------------------------

https://api.spreaker.com/v2/episodes/13004122?export=episode_segments


-----------------

https://api.spreaker.com/v2/sync/users/7985950/plays?revision=51393428

*/