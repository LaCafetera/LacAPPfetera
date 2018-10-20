import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';

import { NavController, Events, MenuController, PopoverController, Platform, normalizeURL } from 'ionic-angular';
import { Dialogs } from '@ionic-native/dialogs';
import { MusicControls, MusicControlsOptions } from '@ionic-native/music-controls';
import { Network } from '@ionic-native/network';

import { EpisodiosService } from '../../providers/episodios-service';
import { ConfiguracionService } from '../../providers/configuracion.service';
import { EpisodiosGuardadosService } from '../../providers/episodios_guardados.service';
import { MenuExtComponent } from '../../components/menuext/menuext';

import { InfoFerPage } from '../info-fer/info-fer';
import { ReproductorPage } from '../reproductor/reproductor';
import { Player } from '../../app/player';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [EpisodiosService,  Dialogs, Network/*, ConfiguracionService*/, EpisodiosGuardadosService]
})

export class HomePage implements OnDestroy, OnInit {

    items: Array<any>;
   // reproductor = ReproductorPage;
    infoFer = InfoFerPage;
    // reproductor: Player;
    capEnRep:string = 'ninguno';
    //soloWifi:boolean = false;
    //mscControl:MusicControls;

    hashtag:string ='';

    numCapsXDescarga: number = 10;

    contadorCapitulos : number = 0;
    timerVigilaDescargas: number;

    mostrarFechasAbsolutas : boolean = false;

    desconectado : boolean = false;
    mscControlOpt: MusicControlsOptions;

    constructor(public navCtrl: NavController,
                private episodiosService: EpisodiosService,
                public events: Events,
                public menuCtrl: MenuController,
                private dialogs: Dialogs,
                private _configuracion: ConfiguracionService,
                public popoverCtrl: PopoverController,
                public platform: Platform,
                private network: Network,
                private chngDetector: ChangeDetectorRef,
                public mscControl: MusicControls,
                private episodiosGuardados: EpisodiosGuardadosService,
                public reproductor: Player) {
        this.items = new Array();

        this.mscControlOpt =
        {
            track       : '',//this.capItem.title,        // optional, default : ''
            artist      : 'Radiocable.com',             // optional, default : ''
            cover       : '',//this.capItem.image_url,      // optional, default : nothing
            isPlaying   : false,                         // optional, default : true
            dismissable : true,                       // Esto es importante ponerlo a true para que no vuelva a arrancar si matan la app

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
            elapsed: 0,
            skipForwardInterval: 15, // display number for skip forward, optional, default: 0
            skipBackwardInterval: 15, // display number for skip backward, optional, default: 0
            hasScrubbing: false // enable scrubbing from control center and lockscreen progress bar, optional
        }
        this.events.subscribe('like:modificado', (valoresLike) => {
            console.log('[HOME.constructor] Recibido mensaje Like Modificado');
            this.actualizaLike (valoresLike.valorLike, valoresLike.episodio)
        });
        this.events.subscribe('capitulo:fenecido', (nuevoEstado) => {
            console.log('[HOME.constructor] Recibido mensaje de que ha terminado cap�tulo en vivo y en directo. Ahora es ' + JSON.stringify( nuevoEstado ));
            this.items[0].objeto.type= nuevoEstado;
        });
        this.events.subscribe('fechasAbsolutas:status', (dato) => {
            console.log('[HOME.constructor] Cambiado valor fechas absolutas a ' + dato.valor);
            this.mostrarFechasAbsolutas = dato.valor;
            this.chngDetector.markForCheck();
        });
        //this.events.subscribe('reproduccion:status', (statusRep) => this.cambiamscControl(statusRep));
    }

    ngOnInit() {
        this.platform.ready()
        .then(() => {
            this.compruebaConexion();
        })
        .catch((error)=>{
            console.error('[HOME.ngOnInit] Error:' + JSON.stringify(error));
        });
    }

    ionViewWillUnload() {
        console.log('[HOME.ionViewWillUnload] Cerrandoooooooooooooooooooooooo');
    }

    ngOnDestroy(){
        console.log('[HOME.ngOnDestroy] Cerrandoooooooooooooooooooooooo');
        this.events.unsubscribe('like:modificado');
        this.events.unsubscribe('capitulo:fenecido');
        this.events.unsubscribe('reproduccion:status');
        //this.mscControl.destroy(); // <-- Revisar esto que no funciona.
        this.reproductor.release(this._configuracion);
        //this.backgroundMode.disable();
    }

    compruebaConexion (){
        //console.log('[HOME.ionViewDidLoad] Entrando' );
        // BackgroundMode.enable();
        this.desconectado = this.network.type === 'none';
        console.log('[home.compruebaConexion] el sistema me dice que la conexión es ' + this.network.type);
        while (this.items.pop()!= undefined) {} //Vacío la matriz de capítulos antes de volver a rellenar.
        if (this.desconectado){
            this.dialogs.alert('El terminal no tiene conexión. Por favor, conéctese y arrastre la pantalla hacia abajo', 'Super-Gurú.');
			this.episodiosGuardados.daListaProgramas().subscribe(
            data => {
				if (this.items == null){
                    this.items = [{objeto:data, like: false}];
                    console.log('[home.compruebaConexion] Recibido capítulo ' + data.title);
                    console.log('[home.compruebaConexion] Imagen ' + data.image_url);
				}
				else {
					this.items.push({objeto:data, like: false});
                    console.log('[home.compruebaConexion] Recibido otro capítulo ' + data.title);
                    console.log('[home.compruebaConexion] Imagen ' + data.image_url);
				}
            },
            err => {
                console.log('[home.compruebaConexion] Error en detalle:' + err);
            });
        }
        else{
            this.cargaUsuarioParaProgramas(null);
            this._configuracion.getFechasAbsolutas()
                .then((dato)=>this.mostrarFechasAbsolutas = dato)
                .catch((error) => console.log('[HOME.ionViewDidLoad] Error descargando usuario:' + error));
        }
    }

    cargaUsuarioParaProgramas (episodio:string){
        this._configuracion.dameUsuario()
        .then ((dataUsuario) => {
            //console.log('[HOME.cargaUsuarioParaProgramas] dataUsuario ' + dataUsuario);
            if (dataUsuario != null){
                this._configuracion.dameToken()
                .then ((dataToken) => {
            //        console.log('[HOME.cargaUsuarioParaProgramas] dataToken ' + dataToken);
                    if (dataToken != null) {
            //            console.log('[HOME.cargaUsuarioParaProgramas] Usuario: ' + dataUsuario + ' token:' + dataToken);
                        this.cargaProgramas(dataUsuario, dataToken, episodio);
                    }
                    else {
                        console.log('[HOME.cargaUsuarioParaProgramas] El usuario no está logueado');
                        this.cargaProgramas(null, null, episodio);
                    }
                })
                .catch ((error) => {
                    console.log('[HOME.cargaUsuarioParaProgramas] Error descargando token:' + error);
                    this.cargaProgramas(null, null, episodio);
                });
            }
            else {
                console.log('[HOME.cargaUsuarioParaProgramas] El usuario no está logueado');
                this.cargaProgramas(null, null, episodio);
            }
        })
        .catch ((error) => {
            console.log('[HOME.cargaUsuarioParaProgramas] Error descargando usuario:' + error);
            this.cargaProgramas(null, null, episodio);
        });
    }

    cargaProgramas (usuario:string, token:string, episodio:string){
        this.contadorCapitulos = this.numCapsXDescarga;
        this.episodiosService.dameEpisodios(usuario, token, episodio, this.numCapsXDescarga).subscribe(
            data => {
                this.contadorCapitulos--;
                console.log('[HOME.cargaProgramas] faltan por descargar ' + this.contadorCapitulos + ' capítulos');
                //this.items=data.response.items;
                //console.log('[HOME.cargaProgramas] Recibido ' + JSON.stringify(data));
                //console.log('[HOME.cargaProgramas] like vale  ' + data.like + ' para el cap '+ data.objeto.episode_id) ;
                if (this.items == null){
                    this.items = data;
                }
                else {
                    this.items.push(data);
                    let ordenado = this.items;
                    let mapped = ordenado.map((el, i) => {
                        return { index: i, value: el.objeto.episode_id };
                    });

                    // ordenando el array mapeado conteniendo los valores reducidos
                    mapped.sort((a, b) => {
                        return (b.value - a.value);
                    });

                    // contenedor para el orden resultante
                    this.items = mapped.map((el) =>{
                        return ordenado[el.index];
                    });
                }
            },
            err => {
                console.log('[HOME.cargaProgramas] Error descargando episodio: ' + err.message);
                this.dialogs.alert ('Error descargando episodios' + err, 'Error');
                this.contadorCapitulos--;
              /*  if (this.contadorCapitulos == 0){
                }*/
            }
        );
    }


    pushPage(item){
        console.log('[HOME.pushPage] Entro en episodio. ');// + JSON.stringify (item));
        this.mscControlOpt.cover = item.objeto.image_url;
        this.mscControlOpt.track = item.objeto.title;
        this.creaControlEnNotificaciones();
        this.capEnRep = 'pdte' + item.objeto.episode_id;
        this.navCtrl.push(ReproductorPage, {episodio:   item,
                                            player:     this.reproductor,
                                       //     controlador:this.mscControl,
                                       //     soloWifi:this.soloWifi,
                                            enlaceTwitter: this.dameEnlace(item.objeto.title)});
    }

    recalentarCafe(event){
        let episodio = this.items[this.items.length-1].objeto.episode_id;
        if (episodio == null){
            console.log('[HOME.recalentarCafe] Episodio nulo');
            event.complete();
        }
        else {
            console.log('[HOME.recalentarCafe] Episodio vale ' + episodio);
            this.cargaUsuarioParaProgramas(episodio);
            this.timerVigilaDescargas = setInterval(() =>{
                console.log('[HOME.recalentarCafe] faltan por descargar ' + this.contadorCapitulos + ' cap�tulos');
                if (this.contadorCapitulos == 0){
                    clearInterval(this.timerVigilaDescargas);
                    event.complete();
                }
            }, 1000);
        }
    }

    lanzaTwitter(cap:string){
        window.open(this.dameEnlace(cap), '_system');
    }

    dameEnlace (cadena:string):string{
        return 'https://twitter.com/hashtag/'+this.damehashtag(cadena)//+'/live';  //--> Versi�n 2
        //return 'https://twitter.com/hashtag/'+this.damehashtag(cadena);
    }

    damehashtag(cadena:string):string{
        let hashtag:string ='';
        let posHT = cadena.indexOf('#');
        if (posHT != -1){
            let espacio = cadena.indexOf(' ', posHT);
            if (espacio == -1) {
                espacio = cadena.length;
            }
            hashtag = cadena.substring(posHT+1, espacio) + ' ';
        }
        return (hashtag);
    }

    hacerCafe(event){
        if (this.items.length > 0 && !this.desconectado){
            this.episodiosService.dameEpisodios(null, null, null, 1).subscribe(
                data => {
                    // console.log('[HOME.hacerCafe] ' + JSON.stringify (data));
                    if (data.objeto.episode_id != this.items[0].objeto.episode_id ) {
                        this.items.unshift(data);
                        console.log('[HOME.hacerCafe] Se han encontrado 1 nuevo capítulo');
                    }
                    else{
                        //Quitamos el primer elemento que tenemos y le ponemos el primero que acabamos de descargar, por si acaso �ste se hubiera actualizado
                        this.items.shift();
                        this.items.unshift(data);
                    }
                    event.complete();
                },
                err => {
                    event.complete();
                    console.log('[HOME.hacerCafe] Error haciendo café: ' + err);
                    this.dialogs.alert ('Error descargando episodios' + err, 'Error');
                }
            );
        }
        else {
            event.complete();
            this.compruebaConexion();
        }
    }
/*
    abreDatosUsuario() {
        console.log('[HOME.abreDatosUsuario] ************************************************************');
    }
*/
    muestraMenu(myEvent) {
        let datosObjeto = {player: this.reproductor/*, controlador:this.mscControl*/}
        let popover = this.popoverCtrl.create(MenuExtComponent, datosObjeto );
        popover.present({
            ev: myEvent
        });
    }

    actualizaLike (valorLike, episodio){
        var encontrado = false;
        for (var i = 0; i < this.items.length && !encontrado; i+=1) {
        // console.log('En el �ndice '' + i + '' hay este valor: ' + miArray[i]);
            if (this.items[i].objeto.episode_id == episodio) {
                this.items[i].like = valorLike;
                encontrado = true;
                console.log('[HOME.actualizaLike] Encontrado cap�tulo');
            }
        }
        if (!encontrado){
            console.log('[HOME.actualizaLike] Cap�tulo no Encontrado');
        }
    }

    normalizaUbicacion (ubicacion: string ):string {
        return (normalizeURL(ubicacion));
    }

    creaControlEnNotificaciones (){
        this.mscControl.destroy()
        .then((data) => {
            console.log('[HOME.creaControlEnNotificaciones] Control remoto destruido OK ' + JSON.stringify(data));
            if (!this.events.unsubscribe('reproduccion:status')) {console.error('[HOME.creaControlEnNotificaciones] No me he dessuscrito de reproduccion.')};
        })
        .catch((error) => {console.error('[HOME.creaControlEnNotificaciones] ***** ERROR ***** Control remoto destruido KO ' + error) });

        console.log('[HOME.creaControlEnNotificaciones] Creando');
        this.mscControl.create(this.mscControlOpt)
        .then((data) => {
            console.log('[HOME.creaControlEnNotificaciones] Control remoto creado OK ' + JSON.stringify(data));
            if (!this.platform.is('ios')) {
                this.events.subscribe('reproduccion:status', (statusRep) => this.cambiamscControl(statusRep));
            }
        })
        .catch((error) => {console.error('[HOME.creaControlEnNotificaciones] ***** ERROR ***** Control remoto creado KO ' + error) });

        this.mscControl.subscribe()
        .subscribe((action) => {
            console.log('[HOME.creaControlEnNotificaciones] Recibido ' + JSON.stringify(action));
            const message = JSON.parse(action).message;
                switch(message) {
                    case 'music-controls-next':
                        //this.reproductor.adelantaRep();
                        this.events.publish('audio:peticion', 'NEXT');
                        console.log('[HOME.creaControlEnNotificaciones] music-controls-next');
                        break;
                    case 'music-controls-previous':
                        //this.reproductor.retrocedeRep();
                        this.events.publish('audio:peticion','PREV');
                        console.log('[HOME.creaControlEnNotificaciones] music-controls-previous');
                        break;
                    case 'music-controls-pause':
                        console.log('[HOME.creaControlEnNotificaciones] music-controls-pause');
                        //this.playPause(this._configuracion);
                        this.events.publish('audio:peticion','PAUSE');
                        this.reproductor.pause(this._configuracion);
                        break;
                    case 'music-controls-play':
                        console.log('[HOME.creaControlEnNotificaciones] music-controls-play');
                        this.events.publish('audio:peticion','PLAY');
                        //this.reproductor.justPlay(this._configuracion);
                        this.reproductor.resumePlay()
                        break;
                    case 'music-controls-destroy':
                        //this.reproductor.release(this._configuracion);
                        this.events.publish('audio:peticion','EXIT');
                        this.platform.exitApp();
                        break;
                    case 'music-controls-stop-listening':
                        //this.mscControl.destroy();
                        console.log('[HOME.creaControlEnNotificaciones] music-controls-stop-listening  Cerrando por aquí ya que el NgOnDestroy no me tira');
                        this.events.unsubscribe('like:modificado');
                        this.events.unsubscribe('capitulo:fenecido');
                        this.events.unsubscribe('reproduccion:status');
                        //this.mscControl.destroy(); // <-- Revisar esto que no funciona.
                        this.reproductor.release(this._configuracion);
                        break;
                    case 'music-controls-media-button' :
                // External controls (iOS only)
                    case 'music-controls-toggle-play-pause' :
                        console.log('[HOME.creaControlEnNotificaciones] music-controls-toggle-play-pause');
                        this.events.publish('audio:peticion','PLAYPAUSE');
                        break;
                    case 'music-controls-headset-unplugged':
                        console.log('[HOME.creaControlEnNotificaciones] music-controls-headset-unplugged');
                        this.reproductor.pause(this._configuracion);
                        this.events.publish('audio:peticion','PAUSE');
                        break;
                    case 'music-controls-headset-plugged':
                        console.log('[HOME.creaControlEnNotificaciones] music-controls-headset-plugged');
                        this.reproductor.pause(this._configuracion);
                        this.events.publish('audio:peticion','PAUSE');
                        break;
                    default:
                        break;
                }
        },
        (error) => {console.error('[HOME.creaControlEnNotificaciones] Error en valor recibido desde music-controls')});
        this.mscControl.listen();
        if (this.platform.is('ios')) {
            this.events.subscribe('reproduccion:status', (statusRep) => this.cambiamscControl(statusRep));
        }
    }

    cambiamscControl(statusRep: number){
        console.log('[HOME.cambiamscControl] ***** OJO ***** cambiado status de la reproducción a  ' + statusRep);
        let status = !(statusRep == this.reproductor.dameStatusStop() || statusRep == this.reproductor.dameStatusPause());
        this.events.publish('reproduccionHome:status', statusRep);
        this.mscControl.updateIsPlaying(status);
        if (status){
            if (this.capEnRep[0] == 'p'){
                this.capEnRep = this.capEnRep.slice(4);
            }
        }
        else {
            if (this.capEnRep[0] != 'p'){
                this.capEnRep = 'pdte' + this.capEnRep;
            }
        }
        this.chngDetector.detectChanges();
    }

/*------------------------- salir -----------------
exit(){
      let alert = this.alert.create({
        title: 'Confirm',
        message: 'Do you want to exit?',
        buttons: [{
          text: 'exit?',
          handler: () => { this.exitApp() }
        }, {
          text: 'Cancel',
          role: 'cancel'
        }]
      })
      alert.present();
  }
  exitApp(){
    this.platform.exitApp();
  }
  y por ah�:
  this.platform.registerBackButtonAction(this.exit)
  M�s a mirar:
  http://cordova.apache.org/docs/en/latest/config_ref/index.html#preference ---> KeepRunning(boolean)
*/
}


// ojo a esto
// https://ionicframework.com/docs/v2/api/components/virtual-scroll/VirtualScroll/
// Y a esto:
// https://ionicframework.com/docs/v2/api/components/refresher/Refresher/
