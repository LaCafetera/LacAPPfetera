import { Component, ChangeDetectorRef,/* Output,*/ EventEmitter, OnInit,  OnDestroy} from '@angular/core';
import { NavController, NavParams, Platform, PopoverController, Events, ToastController, ModalController, normalizeURL, ActionSheetController } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Dialogs } from '@ionic-native/dialogs/ngx';
import { Network } from '@ionic-native/network/ngx';
//import { MusicControls } from '@ionic-native/music-controls';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';

import { EpisodiosService } from '../../providers/episodios-service';
import { ConfiguracionService } from '../../providers/configuracion.service';
import { CadenasTwitterService } from '../../providers/cadenasTwitter.service';
import { DetalleCapituloPage } from '../detalle-capitulo/detalle-capitulo';
import { ChatPage } from '../chat/chat';
import { Player } from '../../app/player';
import { listaPuntosCap } from '../lista-Puntos-Cap/lista-Puntos-Cap';
import { EpisodiosGuardadosService } from "../../providers/episodios_guardados.service"
import { AutoDestruccionComponent } from "../../components/auto-destruccion";


/*
  Generated class for the Reproductor page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-reproductor',
  templateUrl: 'reproductor.html',
  providers: [EpisodiosService, ConfiguracionService, CadenasTwitterService, Dialogs, SocialSharing, Network, /*Player,*/ BackgroundMode, EpisodiosGuardadosService]
})

export class ReproductorPage implements OnInit, OnDestroy{

	
	
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
    //ficheroExiste: boolean;
    posicionRepStr: string = '00:00:00';
    tamanyoStr: string = '01:00:00'
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
    //mscControl: MusicControls;
    soloWifi: boolean;
    dirTwitter: string = '';
    tituloObj: Array<Object>;
    episodioLike: boolean = false;
    colorLike: string = '';
    noHayPuntos: boolean = false;
    detallesCapitulo: Array<any>;
    detalleIntervalo: number = 0;
    hayEnlaceIntervalo: boolean = false;

    pagChat: any = ChatPage;

    ocultaTiempoRep: boolean = false;


    longAudioLiveDescargado: number = 0;
    esIOS: boolean = false;
    capItemTxt: string;

    sinConexionCantando: boolean = false;
    icono: string;
    iconoDescarga: string = 'ios-cloud-download';

    // Con esta variable vamos a monitorizar posibles cortes. Será false si Schrodingüer me dice que el capítulo está vivo, o si siendo
    // retaguardia el capítulo no ha llegado al final. Si siendo true llega un estado de Stop, entonces saltará el error de conexión.
    corteEnDescarga: boolean = false;
    // Puede haber terminado la reproducción porque hayan pulsado stop...
    stopPulsado:boolean = false;
	
	fechaCapitulo: string = '';

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
                private chngDetector: ChangeDetectorRef,
                public modalCtrl: ModalController,
                private episodiosDescargados: EpisodiosGuardadosService,
                private actionSheet: ActionSheetController) {

        this.capItem = this.navParams.get('episodio').objeto;
        this.capItemTxt = JSON.stringify(this.capItem);
        this.episodioLike = this.navParams.get('episodio').like;
        if(this.episodioLike){
            this.colorLike = 'danger';
        }
        this.httpAudio = this.capItem.site_url;
        this.episodio = this.capItem.episode_id;
        this.imagen = this.capItem.image_url;
        console.log('[REPRODUCTOR.constructor] El fichero de imagen es: ' + this.imagen);
        this.enVivo = this.capItem.type=='LIVE';
        this.reproductor = this.navParams.get('player');
        this.episodioDescarga = (this.enVivo?null:this.episodio);
        this.dirTwitter = this.navParams.get('enlaceTwitter');// + '?f=tweets' ;
        this.titulo = this.capItem.title;
        this.descripcion = this.capItem.description;
        this.totDurPlay =  this.capItem.duration;
        this.tamanyoStr = this.dameTiempo(this.totDurPlay/1000);
        this.tituloObj = cadenaTwitter.troceaCadena(this.titulo);
		this.fechaCapitulo = this.capItem.published_at;
        this.events.subscribe('audio:peticion', (peticion: string) => this.atiendePeticion(peticion));
        this.events.subscribe('conexion:status', (conexion) => this.revisaConexion(conexion));
        this.events.subscribe('reproduccionHome:status', (statusRep) => this.cambiandoStatusRep(statusRep));
        this.events.subscribe('posicion:modificado', (posicionObj) => this.cambiaPosicion(posicionObj));
        this.events.subscribe('descarga.ficheroDescargado', (descargaObj) => this.ficheroExiste(this.episodio));
    }


    ngOnInit() {
        console.log ('[app.component.ngOnInit]');
        this.platform.ready().then(() => {
            this.esIOS = this.platform.is('ios');
            this.ficheroExiste(this.episodio);
            this._configuracion.getTwitteado(this.episodio)
            .then((val)=> {
            //    console.log('[REPRODUCTOR.constructor] recibida verificación de twitteado ' + val + ' para el capítulo ' + this.episodio );
                if (val == null){ //Si es null nunca se ha guardado nada, con lo que no hemos preguntado.
                    this.twitteaCapitulo ();
                    this._configuracion.setTwitteado(this.episodio);
                }
            })
            .catch(()=>{
                console.log('[REPRODUCTOR.ngOnInit] Error recuperando posición de la reproducción.');
            });
            
            this.episodiosService.damePuntosEpisodio(this.episodio).subscribe(
                data => {
                    this.detallesCapitulo = data.response.items;
                    if (this.detallesCapitulo.length > 0) {
                        this.noHayPuntos = false;
                    }
                    else{
                        this.noHayPuntos = true;
                    }
                },
                error => {
                    console.error('[LISTA-PUNTOS-CAP.constructor] Error ' + JSON.stringify(error));
                }
            )
        })
        .catch((error)=>{
            console.error('[REPRODUCTOR.ngOnInit] Error:' + JSON.stringify(error));
        });
    }

    ionViewDidLoad() {
        this._configuracion.getWIFI()
            .then((val)=> {
                this.soloWifi = val==true;
            }).catch(()=>{
                this.soloWifi = true;
                console.error('[REPRODUCTOR.ionViewDidLoad] Error recuperando valor WIFI. Forzando escuchar vía WIFI');
            });

        console.log('[REPRODUCTOR.ionViewDidLoad] EnVivo vale '+ this.enVivo);

        if (this.enVivo){
            this.timerVigilaEnVivo = setInterval(() => this.gatoSchrodinger(), 1000);
        }
        else{
            console.log('[REPRODUCTOR.ionViewDidLoad] No es en vivo.');
        }
    }

    ngOnDestroy(){
        //this._configuracion.setTimeRep(this.episodio, this.posicionRep);
        clearInterval(this.timer);
        clearInterval(this.timerVigilaEnVivo);
        clearInterval(this.timerParpadeo);
        this.timer = 0;
        this.timerVigilaEnVivo = 0;
        this.timerParpadeo = 0;
        if (!this.events.unsubscribe('audio:peticion')) {console.error('[REPRODUCTOR.ngOnDestroy] No me he dessuscrito de audio.')};
        if (!this.events.unsubscribe('conexion:status')) {console.error('[REPRODUCTOR.ngOnDestroy] No me he dessuscrito de conexion.')};
        if (!this.events.unsubscribe('reproduccionHome:status')) {console.error('[REPRODUCTOR.ngOnDestroy] No me he dessuscrito de reproduccion.')};
        //if (!this.events.unsubscribe('reproduccionHome:status')) {console.error('[REPRODUCTOR.ngOnDestroy] No me he dessuscrito de reproduccion.')};
        if (!this.events.unsubscribe('posicion:modificado')) {console.error('[REPRODUCTOR.ngOnDestroy] No me he dessuscrito de posicion.')};
        //if (!this.events.unsubscribe('errorReproduccion:status')) {console.error('[REPRODUCTOR.ngOnDestroy] No me he dessuscrito de errorReproduccion.')};
        //this.backgroundMode.disable();
        //this.events.publish('audio:modificado', {reproductor:this.reproductor, controlador:this.mscControl});
        console.log('[REPRODUCTOR.ngOnDestroy] Saliendoooooooooooooooooooooooooooo!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!.');
        //MusicControls.destroy(); // onSuccess, onError
    }

    gatoSchrodinger(){
        this.episodiosService.dameDetalleEpisodio(this.episodio).subscribe(
            // this.episodiosService.sigueSiendoVivo(this.episodio) // Debería usar esto, ya que lo tengo.
            data => {
                //console.log('[REPRODUCTOR.ionViewDidLoad] Respuesta vale: ' + data.response.episode.type);
                if (data.response.episode.type != 'LIVE'){
                    console.log('[REPRODUCTOR.gatoSchrodinger] El episodio ha muerto. Larga vida al episodio .');
                    clearInterval(this.timerVigilaEnVivo);
                    this.enVivo = false;
                    this.corteEnDescarga = false; //  Si el programa no es en vivo no es aquí donde puedo decidir si hay corte o no.
                    //console.log ('[REPRODUCTOR.gatoSchrodinger] corte en descarga false');
                    this.episodioDescarga = data.response.episode.episode_id;
                    this.totDurPlay = data.response.episode.duration;
                    this.tamanyoStr = this.dameTiempo(this.totDurPlay/1000);
                    this.events.publish('capitulo:fenecido', {valor:data.response.episode.type});
                }
                else{
                    this.corteEnDescarga = true;  // Si estamos en vivo, no 'puede' cortarse.
                    clearInterval(this.timerVigilaEnVivo);
                    //console.log ('[REPRODUCTOR.gatoSchrodinger] corte en descarga true');
                }
            },
            error => {
                console.error('[REPRODUCTOR.gatoSchrodinger] Error revisando si el capítulo ' + this.episodio + ' sigue estando vivo. Posible error de conexión.');
                this.corteEnDescarga = true; //Si tengo problemas de conexión... true.
                clearInterval(this.timerVigilaEnVivo);
                //console.log ('[REPRODUCTOR.gatoSchrodinger] corte en descarga true');
            }
        )
    }

    cambiandoStatusRep(statusRep: number) {
        console.log('[REPRODUCTOR.cambiandoStatusRep] Se ha modificado el status de la reproducción a ' + statusRep);
        if ((statusRep == this.reproductor.dameStatusStop() || statusRep == this.reproductor.dameStatusPause()) ){
            console.log('[REPRODUCTOR.cambiandoStatusRep] El reproductor está apagado o fuera de cobertura.');
            if (statusRep == this.reproductor.dameStatusStop()) {
                this.posicionRep = 0;
                this.posicionRepStr = '00:00:00';
                console.log('[REPRODUCTOR.cambiandoStatusRep] actualizando status control remoto');
                 this.parpadeoTiempoRep(false);
                clearInterval(this.timer);
                this.stopPulsado = false; // Limpiamos el valor.
            }
            this.reproduciendo = false;
            this.iconoPlayPause = 'play';
        } // Esto es importante. Cuando salimos del capítulo y entramos en otro, nos llega un status nulo y lo pone todo en marcha. Por eso no vale sólo un 'else'
        else if (statusRep == this.reproductor.dameStatusRep() || statusRep == this.reproductor.dameStatusStarting()){
            if (statusRep == this.reproductor.dameStatusStarting()){
                console.log('[REPRODUCTOR.cambiandoStatusRep] El reproductor está buffereando.');
                this.posicionRepStr = 'Cargando café.';
                this.parpadeoTiempoRep(true);
            }
            else {
                console.log('[REPRODUCTOR.cambiandoStatusRep] El reproductor está reproduciendo.');
                this.parpadeoTiempoRep(false);
                this.iniciaContadorRep();
            }
            this.reproduciendo = true;
            this.iconoPlayPause = 'pause';
        }
        console.log('[REPRODUCTOR.cambiandoStatusRep] actualizando status control remoto ' + this.iconoPlayPause);
        //this.mscControl.updateIsPlaying(this.reproduciendo);
        //this.chngDetector.markForCheck();
        this.chngDetector.detectChanges();
    }

    parpadeoTiempoRep(iniciar: boolean){
        console.log('[REPRODUCTOR.parpadeoTiempoRep] Parpadeo vale ' + this.timerParpadeo);
        if (iniciar){
            if ( this.timerParpadeo == 0){
                console.log('[REPRODUCTOR.parpadeoTiempoRep] Comenzando parpadeo');
                this.timerParpadeo = setInterval(() =>{
                    this.ocultaTiempoRep = !this.ocultaTiempoRep;
                    this.iconoPlayPause = 'pause'; // Esto aquí es un poco bestia, pero en realidad es una forma de intentar forzar que ponga el pause...
                    //this.chngDetector.markForCheck();
                    this.chngDetector.detectChanges();
                    //console.log('[REPRODUCTOR.parpadeoTiempoRep] Parpadeando. El icono debería ser ' + this.iconoPlayPause);
                }, 1000);
            }
            else {
                console.log('[REPRODUCTOR.parpadeoTiempoRep] Has intentado iniciar el parpadeo dos veces (Muy hábil, Morgan)');
            }
        }
        else {
            console.log('[REPRODUCTOR.parpadeoTiempoRep] Eliminando parpadeo');
            clearInterval(this.timerParpadeo);
            this.timerParpadeo = 0;
            this.iconoPlayPause = 'pause'; // Esto aquí es un poco bestia, pero en realidad es una forma de intentar forzar que ponga el pause...
            this.ocultaTiempoRep = false;
            //this.chngDetector.markForCheck();
            this.chngDetector.detectChanges();
            console.log('[REPRODUCTOR.parpadeoTiempoRep] Quitando parpadeo. El icono debería ser ' + this.iconoPlayPause);
        }
    }

    numerosDosCifras(numero):string {
        let ret: string = '00';
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
            console.log ('[REPRODUCTOR.iniciaContadorRep] Entrando');
            this.timer = setInterval(() => {
                if (this.timer > 0) { // Esto no debería hacer falta, pero aunque haga un clearInterval no me hace demasiado caso :-(
                    this.reproductor.getCurrentPosition()
                    .then((position) => {
                        this.posicionRep = position*1000;
                        this.events.publish('reproduccion:posicion', Math.round(position));
                        //console.log ('[REPRODUCTOR.iniciaContadorRep] this.posicionRep: ' + this.posicionRep + ' this.totDurPlay ' + this.totDurPlay);
                        if (Math.abs(this.posicionRep - this.totDurPlay) < 1000) {
                            this.corteEnDescarga = false;
                        }
                        else {
                            this.corteEnDescarga = true;
                        }
                        this.posicionRepStr = this.dameTiempo(Math.round(position));
                        if (!this.enVivo){ // No hay nada que refrescar en la pantalla si estamos en vivo. Pero me interesa el dato.
                            //if (!this.chngDetector['destroyed']) {
                                this.chngDetector.detectChanges();
                            //}
                        }
                        this.actualizaDetalle(position);
                    })
                    .catch ((error) => {
                        console.error('[REPRODUCTOR.iniciaContadorRep] Error solicitando posición de la reproducción: ' + error);
                    });
                }
            }, 1000);
        }
    }

    stop ()  {
        console.log ('[REPRODUCTOR.stop] solicitada parada de reproducción streaming');
        this.parpadeoTiempoRep(false); // pongo esto aquí por si acaso no le había dado tiempo a empezar a sonar
        this.iconoPlayPause = 'play';
        if (this.reproduciendo) {
            this.reproduciendo = false;
            this.reproductor.stop();// // Comento esto porque hacer stop si no está reproduciendo provoca un error. Con el release lo hago todo.
        }
        this.stopPulsado = true;
    }

    playPause(){
        let descargaPermitida = (this.network.type === 'wifi' || !this.soloWifi);
        console.log ('[REPRODUCTOR.playPause] La conexión es ' + this.network.type + ' y la obligación de tener wifi es ' + this.soloWifi + ' y reproduciendo vale ' + this.reproduciendo);

        if (this.reproductor != null){
            if (this.reproduciendo) {
                console.log ('[REPRODUCTOR.playPause] Está reproduciendo y el timer vale ' + this.timer );
                clearInterval(this.timer);
                this.reproductor.pause(this._configuracion);
                this.reproduciendo = false;
                //this.parpadeoTiempoRep(false);
                this.posicionRepStr = this.dameTiempo(Math.round(this.posicionRep/1000));
            }
            else {
                if (descargaPermitida || this.noRequiereDescarga) {
                    //this.parpadeoTiempoRep(true);
                    this.reproductor.play(this.audioEnRep, this._configuracion, this.enVivo);
                    //if (this.reproductor.play(this.audioEnRep, this._configuracion)){
                        // si estamos aquí al darle al play hemos cambiado el audio por lo que hay  que renovar el control del area de notificaciones.
                    //    console.log ('[REPRODUCTOR.playPause] reproduciendo nuevo audio. Regeneramos el reproductor del area de notificacioes.' );
                    //    this.creaControlEnNotificaciones(true);
                    //}
                }
                else{
                    this.msgDescarga ('Sólo tiene permitida reproducción por streaming con la conexión WIFI activada.');
                }
            }
        }
        else this.dialogs.alert('Es nulo. (Error reproduciendo)', 'Super - Gurú');
    }

    actualizaPosicion(){
        if (this.reproductor != null){
            this.reproductor.seekTo(this.posicionRep);
            this.posicionRepStr = this.dameTiempo(Math.round(this.posicionRep/1000));
        //    console.log('[REPRODUCTOR.actualizaPosicion] Ha cambiado la posición del slider: ' + this.posicionRepStr + ' - ' + this.posicionRep);
        }
        else {
            console.log('[REPRODUCTOR.actualizaPosicion] No cambio la posición del slider porque reproductor es nulo.');
            this.posicionRep = 0;
        }
    }

    adelanta(){
        console.log('[REPRODUCTOR.adelanta] Adelantando.');
        this.reproductor.adelantaRep();
    }

    retrasa(){
        console.log('[REPRODUCTOR.retrasa] Retrasando.');
        this.reproductor.retrocedeRep();
    }

    compartir(){
        console.log ('[REPRODUCTOR.compartir] Compartiendo url ' + this.httpAudio);
        var options: any;
        if (!this.esIOS){
            options = {
                message: this.titulo, // not supported on some apps (Facebook, Instagram)
                subject: 'Creo que esto puede interesarte.', // fi. for email
                files: [this.imagen], //[imagen], // an array of filenames either locally or remotely
                url: this.httpAudio,
                chooserTitle: 'Selecciona aplicación.' // Android only, you can override the default share sheet title
            }
        }
        else {
            options = {
                message: this.titulo + ' ' + this.httpAudio, // not supported on some apps (Facebook, Instagram)
                subject: 'Creo que esto puede interesarte.', // fi. for email
                files: [this.imagen], //[imagen], // an array of filenames either locally or remotely
                url: '',
                chooserTitle: 'Selecciona aplicación.' // Android only, you can override the default share sheet title
            }
        }

        this.socialsharing.shareWithOptions(options).then(() => {
            console.log('[REPRODUCTOR.compartir] enviado Ok'); // On Android apps mostly return false even while it's true
        }).catch(() => {
            console.error('[REPRODUCTOR.compartir] enviado KO');
        });
    }

    twitteaCapitulo(){
        this.dialogs.confirm('¡Ayudanos twitteando la dirección del programa!', '¡Ayudanos!', ['¡Café para todos!', 'Mejor no'])
            .then((respuesta) => {
                console.log ('[REPRODUCTOR.twitteaCapitulo] Recibida respuesta: ' + respuesta);
                if (respuesta == 1) {// café para todos
                    if (!this.esIOS){
                        this.socialsharing.shareViaTwitter(this.dameTexto() + this.titulo, this.imagen, this.httpAudio)
                        .then((respuesta) => {
                            console.log ('[REPRODUCTOR.twitteaCapitulo] Twitteo OK: ' + respuesta);
                        })
                        .catch((error) => {
                            console.error ('[REPRODUCTOR.twitteaCapitulo] Twitteo KO: ' + error);
                        });
                    }
                    else {
                        this.socialsharing.shareViaTwitter(this.dameTexto() + this.titulo + ' ' + this.httpAudio, this.imagen)
                        .then((respuesta) => {
                            console.log ('[REPRODUCTOR.twitteaCapitulo] Twitteo OK: ' + respuesta);
                        })
                        .catch((error) => {
                            console.error ('[REPRODUCTOR.twitteaCapitulo] Twitteo KO: ' + error);
                        });
                    }
                }
                this._configuracion.setTwitteado(this.episodio);
            })
            .catch((error) => {
                console.error ('[REPRODUCTOR.twitteaCapitulo] Error en consulta: ' + error)
            });
    }

    muestraDetalle(myEvent) {
        console.log ('[REPRODUCTOR.muestraDetalle] Enviando datos : ' + this.capItem.title + ' - ' +  this.capItem.description);
        let popover = this.popoverCtrl.create(DetalleCapituloPage, {titulo: this.capItem.title, detalle: this.capItem.description});
        popover.present({ ev: myEvent }) ;
    }

    ficheroDescargado(fichero):void{
        let nombrerep: string;
        //let meVoyPorAqui: number = 0;
        if (fichero.existe ){
            nombrerep = encodeURI(/*cordova.file.dataDirectory + */fichero.direccion + this.episodio + '.mp3');
            console.log('[REPRODUCTOR.ficheroDescargado] EL fichero existe. Reproduciendo descarga. ' + nombrerep + ' . ');
            this.noRequiereDescarga = true;
        } else {
            nombrerep = encodeURI('https://api.spreaker.com/v2/episodes/'+this.episodio+'/play'); // stream
            console.log('[REPRODUCTOR.ficheroDescargado] EL fichero no existe. Reproduciendo de red. ' + nombrerep + ' . ');
            this.noRequiereDescarga = false;
        };
        if (this.audioEnRep != null){
            console.log('[REPRODUCTOR.ficheroDescargado] Segunda o más vez que entramos. AudioEnRep vale ' + this.audioEnRep);
            if (this.audioEnRep != nombrerep){
                this.stopPulsado = true; // Esto lo pongo para que no salte el 'se ha producido un corte'.
                this.reproductor.release(this._configuracion);
                this.audioEnRep = nombrerep;
                if (!this.reproductor.inicializado) {
                    console.log('[REPRODUCTOR.ficheroDescargado] reproductor es nulo');
                    this.reproductor.crearepPlugin (this.audioEnRep, this._configuracion, false, this.enVivo);
                } else {
                    if (this.reproduciendo && (this.network.type === 'wifi' || !this.soloWifi)){
                        this.stopPulsado = true; // Esto lo pongo para que no salte el 'se ha producido un corte'.
                        this.reproductor.play(this.audioEnRep, this._configuracion, this.enVivo);
                        console.log('[REPRODUCTOR.ficheroDescargado] ya estaba reproduciendo. Se iba por ' + this.posicionRep/1000);
                    }
                }
            }
        }
        else {
            console.log('[REPRODUCTOR.ficheroDescargado] Primera vez que entramos.' + this.reproductor);
            this.audioEnRep = nombrerep;
            if (!this.reproductor == null) {
                console.log('[REPRODUCTOR.ficheroDescargado] reproductor es nulo');
                this.reproductor.crearepPlugin(this.audioEnRep, this._configuracion, false, this.enVivo);
            }
            else {
                console.log('[REPRODUCTOR.ficheroDescargado] reproductor no es nulo');
                if (this.reproductor.reproduciendoEste(this.audioEnRep)){
                    console.log('[REPRODUCTOR.ficheroDescargado] Estábamos reproduciendo este mismo audio ');
                    // Se trata de que 'cambiandoStatusRep' centralice el cambio del icono del play/pause, el contador, etc...
                    this.cambiandoStatusRep(this.reproductor.dameStatus());
                }
                else {
                    console.log('[REPRODUCTOR.ficheroDescargado] Estábamos reproduciendo otro audio');
                }
            }
        }
    }

    meGustasMucho(){
        this._configuracion.dameUsuario()
        .then ((dataUsuario) => {
            if (dataUsuario != null && dataUsuario != ''){
                this._configuracion.dameToken()
                .then ((dataToken) => {
                    if (this.episodioLike){
                        console.log('[REPRODUCTOR.meGustasMucho] solicitado envío de dislike para usuario ' + dataUsuario);
                        this.episodiosService.episodioDislike(this.episodio, dataUsuario, dataToken ).subscribe(
                            data => {
                                console.log('[REPRODUCTOR.meGustasMucho] eliminando like:' + JSON.stringify(data));
                                this.episodioLike = false;
                                this.colorLike = '';
                                this.events.publish('like:modificado', {valorLike:this.episodioLike, episodio:this.episodio});
                            },
                            err => {
                                console.log('[REPRODUCTOR.meGustasMucho] Error eliminando like al episodio:' + err);
                            }
                        );
                    }
                    else {
                        console.log('[REPRODUCTOR.meGustasMucho] solicitado envío de like para usuario ' + dataUsuario);
                        this.episodiosService.episodioLike(this.episodio, dataUsuario, dataToken).subscribe(
                            data => {
                                console.log('[REPRODUCTOR.meGustasMucho] Aceptado el like:' + JSON.stringify(data));
                                this.episodioLike = true;
                                this.colorLike = 'danger';
                                this.events.publish('like:modificado', {valorLike:this.episodioLike, episodio:this.episodio});
                            },
                            err => {
                                console.log('[REPRODUCTOR.meGustasMucho] Error mandando like al episodio:' + err);
                            }
                        );
                    }
                })
                .catch ((error) => {
                    console.error('[REPRODUCTOR.meGustasMucho] Error descargando token:' + error);
                    this.msgDescarga ('Error extrayendo usuario de Spreaker.');
                });
            }
            else {
                console.log('[REPRODUCTOR.meGustasMucho] El código de usuario es nulo');
                this.msgDescarga ('Por favor, conéctese a Spreaker en el menú de la app.');
            }
        })
        .catch (() => {
            //this.msgDescarga ('Error extrayendo usuario de Spreaker.');
            this.msgDescarga ('Debe estar conectado a Spreaker para poder realizar esa acción.');
        });
    }
    
    listaContenido() {
        this.navCtrl.push(listaPuntosCap, {listadoPuntos: this.detallesCapitulo});
    }

    cambiaPosicion(datos: any){
        this.msgDescarga(datos.descripcion);
        let statusActual = this.reproductor.dameStatus();
        if (datos.posicion != 0){
            console.log('[REPRODUCTOR.presentContaactModal] El estado de la reproducción es: ' + statusActual);
            if (this.reproductor.dameStatusStop() == statusActual || statusActual === undefined){
                this._configuracion.setTimeRep(this.episodio, Number(datos.posicion));
                this.playPause();
            }
            else {
                if (this.reproductor.dameStatusPause() == statusActual){
                    this.playPause();
                }
                this.reproductor.seekTo(datos.posicion);
            }
        }
    }

    
    revisaConexion(conexion) {
        console.log('[REPRODUCTOR.revisaConexion] this.network.type ' + conexion.valor + ' this.soloWifi ' + this.soloWifi + ' this.reproduciendo ' + this.reproduciendo + ' this.noRequiereDescarga ' + this.noRequiereDescarga + ' this.sinConexionCantando ' + this.sinConexionCantando + ' this.esIOS ' + this.esIOS);
        if (this.esIOS){
            console.log('[REPRODUCTOR.revisaConexion] network.onchange - Estoy en iOS');
            if (this.reproduciendo && !this.noRequiereDescarga) {
                this.sinConexionCantando = this.reproduciendo;
                this.reproductor.guardaPos(this._configuracion);
                this.reproductor.stop();
                console.log('[REPRODUCTOR.revisaConexion] Se ha producido un corte en la conexión a internet.');
                this.msgDescarga('Se ha producido un corte en la conexión a internet.');
                if (conexion.valor != 'wifi' &&  this.soloWifi){
                    this.dialogs.alert('No podemos recuperar la reproducción por streaming sin estar conectado a una red Wifi.', 'Super - Gurú');
                }
                else {
                    this.reproductor.play(this.audioEnRep, this._configuracion, this.enVivo);
                    this.msgDescarga('Recuperando reproducción tras reconexión.');
                    this.sinConexionCantando = false;
                }
            }
            else if (!this.reproduciendo && !this.noRequiereDescarga && (conexion.valor == 'wifi' || !this.soloWifi) && this.sinConexionCantando) {
                this.reproductor.play(this.audioEnRep, this._configuracion, this.enVivo);
            }
        }
        else if (this.reproduciendo && !this.noRequiereDescarga && conexion.valor != 'wifi' &&  this.soloWifi){
            this.reproductor.guardaPos(this._configuracion);
            this.reproductor.stop();
            this.dialogs.alert('Se ha desconectado de la red WIFI. Ha configurado que sin WIFI no quiere reproducir.', 'Super - Gurú');
        }
    }

    actualizaDetalle(position: number){
        let i = 0;
        let encontrado: boolean = false;
        if (this.detallesCapitulo.length > 0){
            if (this.detallesCapitulo[i].starts_at > (position * 1000)){
                this.imagen = this.capItem.image_url;
                this.hayEnlaceIntervalo = false;
            }
            else do {
                if ( i == 0  && this.detallesCapitulo[i].starts_at < (position * 1000)){
                    if (this.detallesCapitulo.length > 1 ){
                        if (this.detallesCapitulo[i+1].starts_at > (position * 1000) && (i+1) != this.detalleIntervalo){
                            encontrado = true;
                        }
                    }
                    else if (this.detalleIntervalo != 1){
                        encontrado = true;
                    }
                }
                if ( (i + 1) < this.detallesCapitulo.length  &&
                     this.detallesCapitulo[i].starts_at < (position * 1000) &&
                     this.detallesCapitulo[i+1].starts_at > (position * 1000) &&
                     this.detalleIntervalo != (i + 1)){
                    encontrado = true;
                }
                if ( (i + 1) == this.detallesCapitulo.length  &&
                    this.detallesCapitulo[i].starts_at < (position * 1000) &&
                    this.detalleIntervalo != (i + 1)){
                    encontrado = true;
                }
                if ( encontrado ){
                    this.imagen = (this.detallesCapitulo[i].image_url != null ? this.detallesCapitulo[i].image_url : this.capItem.image_url );
                    this.hayEnlaceIntervalo = (this.detallesCapitulo[i].external_url != null);
                    this.detalleIntervalo = ++i;
                    encontrado = true;
                };
            } while (++i < this.detallesCapitulo.length && !encontrado);
        };
    };

    lanzaWeb(){
        window.open(this.detallesCapitulo[this.detalleIntervalo-1].external_url, '_system', 'location=no,clearsessioncache=yes,clearcache=yes');
    }

    atiendePeticion (peticion: string){
        switch(peticion){
            case 'NEXT':
                this.reproductor.adelantaRep();
                console.log('[REPRODUCTOR.atiendePeticion] NEXT');
                break;
            case 'PREV':
                this.reproductor.retrocedeRep();
                console.log('[REPRODUCTOR.atiendePeticion] PREV');
                break;
            case 'PAUSE':
                console.log('[REPRODUCTOR.atiendePeticion] PAUSE');
                this.reproductor.pause(this._configuracion);
                break;
            case 'PLAY':
                console.log('[REPRODUCTOR.atiendePeticion] PLAY');
                this.reproductor.play(this.audioEnRep, this._configuracion, this.enVivo);
                break;
            case 'EXIT':
                console.log('[REPRODUCTOR.atiendePeticion] EXIT');
                this.stopPulsado = true;
                this.reproductor.release(this._configuracion);
                this.platform.exitApp();
                break;
            case 'PLAYPAUSE' :
                console.log('[REPRODUCTOR.atiendePeticion] PLAYPAUSE');
                this.playPause();
                break;
            default:
                break;
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

    normalizaUbicacion (ubicacion: string ):string {
      if (ubicacion.includes('file')) {
        return (normalizeURL(ubicacion));
      }
      else
      {
        return (ubicacion);
      }
    }

    ficheroExiste(fichero: string):void{
        let nombrerep: string;
        this.episodiosDescargados.dimeSiLoTengo(fichero)
        .then((nombreConUbicacion) => {
            if (nombreConUbicacion != null) {
                nombrerep = encodeURI(nombreConUbicacion);
                console.log('[REPRODUCTOR.ficheroExiste] El fichero existe. Reproduciendo descarga. ' + nombrerep + ' . ');
                this.noRequiereDescarga = true;
                this.iconoDescarga = 'trash';
            }
            else {
                nombrerep = encodeURI('https://api.spreaker.com/v2/episodes/'+this.episodio+'/play'); // stream
                console.log('[REPRODUCTOR.ficheroExiste] El fichero no existe. Reproduciendo de red. ' + nombrerep + ' . ');
                this.noRequiereDescarga = false;
                this.iconoDescarga = 'cloud-download'; 
            }
            this.parametrizaReproduccion(nombrerep);
            //this.chngDetector.detectChanges();
        })
        .catch ((error) => {           
            console.error('[REPRODUCTOR.ficheroExiste] Se ha producido un error. Reproduciendo de red. ' + error + ' . ');
            nombrerep = encodeURI('https://api.spreaker.com/v2/episodes/'+this.episodio+'/play'); // stream
            this.noRequiereDescarga = false;
            this.iconoDescarga = 'cloud-download'; 
            this.parametrizaReproduccion(nombrerep);
            //this.chngDetector.detectChanges();
        });
    }

    parametrizaReproduccion (nombreConUbicacion: string){
        if (this.audioEnRep != null){
            console.log('[REPRODUCTOR.parametrizaReproduccion] Segunda o más vez que entramos. AudioEnRep vale ' + this.audioEnRep);
            if (this.audioEnRep != nombreConUbicacion){
                this.stopPulsado = true; // Esto lo pongo para que no salte el 'se ha producido un corte'.
                this.reproductor.release(this._configuracion);
                this.audioEnRep = nombreConUbicacion;
                if (!this.reproductor.inicializado) {
                    console.log('[REPRODUCTOR.parametrizaReproduccion] reproductor es nulo');
                    this.reproductor.crearepPlugin (this.audioEnRep, this._configuracion, false, this.enVivo);
                } else {
                    if (this.reproduciendo && (this.network.type === 'wifi' || !this.soloWifi)){
                        this.stopPulsado = true; // Esto lo pongo para que no salte el 'se ha producido un corte'.
                        this.reproductor.play(this.audioEnRep, this._configuracion, this.enVivo);
                        console.log('[REPRODUCTOR.parametrizaReproduccion] ya estaba reproduciendo. Se iba por ' + this.posicionRep/1000);
                    }
                }
            }
        }
        else {
            console.log('[REPRODUCTOR.parametrizaReproduccion] Primera vez que entramos.' + this.reproductor);
            this.audioEnRep = nombreConUbicacion;
            if (!this.reproductor == null) {
                console.log('[REPRODUCTOR.parametrizaReproduccion] reproductor es nulo');
                this.reproductor.crearepPlugin(this.audioEnRep, this._configuracion, false, this.enVivo);
            }
            else {
                console.log('[REPRODUCTOR.parametrizaReproduccion] reproductor no es nulo');
                if (this.reproductor.reproduciendoEste(this.audioEnRep)){
                    console.log('[REPRODUCTOR.parametrizaReproduccion] Estábamos reproduciendo este mismo audio ');
                    this.cambiandoStatusRep(this.reproductor.dameStatus());
                }
                else {
                    console.log('[REPRODUCTOR.parametrizaReproduccion] Estábamos reproduciendo otro audio');
                }
            }
        }
    }
	
	procesaDescarga(){
		if (!this.enVivo) {
            console.log('[REPRODUCTOR.procesaDescarga] Solicitada descarga / borrado: ' + !this.noRequiereDescarga);
            this.events.publish('reproduccion:descarga',{descargar: !this.noRequiereDescarga, 
                                                         datosEpisodio: this.capItem});
									/*	 datosEpisodio: {episodio_id: this.episodio,
                                                         episodio_fecha: this.fechaCapitulo,
                                                         episodio_imagen: this.imagen}});*/
		}
		else {
			this.msgDescarga('No es posible descargar reproducciones en vivo');
		}
    }

    async muestraMenuAutodestruccion() {
        const actionSheet = await this.actionSheet.create({
          title: 'Esta cafetera se autodestruirá...',
          buttons: [{
            text: '... al terminar el episodio',
            handler: () => {
              console.log('Al terminar el episodio');
              this.events.publish('reproductor:autodestruccion', {valor:666});
              this.msgDescarga('Autoapagado al terminar capítulo.');
            }
          }, {
            text: '... dentro de 60 minutos',
            handler: () => {
              console.log('60 minutos');
              this.events.publish('reproductor:autodestruccion', {valor:60});
              this.msgDescarga('Autoapagado en 60 minutos.');
            }
          }, {
            text: '... dentro de 30 minutos',
            handler: () => {
              console.log('30 minutos');
              this.events.publish('reproductor:autodestruccion', {valor:30});
              this.msgDescarga('Autoapagado en 30 minutos.');
            }
          }, {
            text: '... dentro de 15 minutos',
            handler: () => {
              console.log('15 minutos');
              this.events.publish('reproductor:autodestruccion', {valor:15});
              this.msgDescarga('Autoapagado en 15 minutos.');
            }
          },{
            text: '¡Corta el cable azul!',
            handler: () => {
              console.log('Cancelar autoapagado');
              this.events.publish('reproductor:autodestruccion', {valor:0});
              this.msgDescarga('Autoapagado cancelado.');
            }
          }, {
            text: 'Ya lo apago yo si eso',
            icon: 'close',
            role: 'cancel',
            handler: () => {
              console.log('Cancelado');
            }
          }]
        });
        await actionSheet.present();
      }

      dameTexto():string {
          var posibles= ["Escucha ",
                         "Estoy oyendo ",
                         "No te pierdas ",
                         "No te puedes perder ",
                         "Anímate a escuchar ",
                         "Sal de la Agenda Setting: "];
                         return (posibles[Math.floor((Math.random()*posibles.length))])
      }

}

/*/---------------------- revisar ------------------------

https://api.spreaker.com/v2/episodes/13004122?export=episode_segments


-----------------

https://api.spreaker.com/v2/sync/users/7985950/plays?revision=51393428

*/
