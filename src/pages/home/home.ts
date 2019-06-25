import { Component, OnDestroy, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';

import { NavController, Events, MenuController, PopoverController, Platform, normalizeURL, ActionSheetController, ToastController } from 'ionic-angular';
import { Dialogs } from '@ionic-native/dialogs';
import { MusicControls, MusicControlsOptions } from '@ionic-native/music-controls';
import { Network } from '@ionic-native/network';
import { BackgroundMode } from '@ionic-native/background-mode';

import { EpisodiosService } from '../../providers/episodios-service';
import { ConfiguracionService } from '../../providers/configuracion.service';
import { EpisodiosGuardadosService } from '../../providers/episodios_guardados.service';
import { DescargaCafetera } from '../../providers/descarga.service';
import { MenuExtComponent } from '../../components/menuext/menuext';

import { InfoFerPage } from '../info-fer/info-fer';
import { ReproductorPage } from '../reproductor/reproductor';
import { Player } from '../../app/player';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [EpisodiosService,  Dialogs, Network, BackgroundMode, EpisodiosGuardadosService]
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
    entrandoEnRep : boolean = false;

    desconectado : boolean = false;
    mscControlOpt: MusicControlsOptions;
    statusPlay: boolean = false;
    relojArena: number = 0;
    ordenado: boolean = true;
    soloCapitulosConLike: boolean = true;
    buscando: boolean = false ; // para mostrar o no el campo de búsqueda de episodios.
    textoBusqueda:string = '';

    datosConexion: any;
    infiniteScroll: boolean = true;

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
                public reproductor: Player,
                private descargaCafetera: DescargaCafetera,
                public actionSheetController: ActionSheetController,
                public toastCtrl: ToastController,
                private backgroundMode: BackgroundMode) {
        this.items = new Array();

        this.datosConexion = new Object();
        this.datosConexion.conectado = false;
        this.datosConexion.usuario = null;
        this.datosConexion.token = null;
        console.log('************************** '+ JSON.stringify (this.datosConexion));


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
            hasSkipForward : true, //optional, default: false. true value overrides hasNext.
            hasSkipBackward : true, //optional, default: false. true value overrides hasPrev.
            skipForwardInterval: 15, // display number for skip forward, optional, default: 0
            skipBackwardInterval: 15, // display number for skip backward, optional, default: 0
            hasScrubbing: false, // enable scrubbing from control center and lockscreen progress bar, optional
            playIcon: 'media_play',
            pauseIcon: 'media_pause',
            prevIcon: 'media_prev',
            nextIcon: 'media_next',
            closeIcon: 'media_close'
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
        this.events.subscribe('reproductor:autodestruccion', (dato) => {
            console.log('[HOME.constructor] Solicitada autodestrucción en ' + dato.valor + ' minutos... tic...tac...tic...tac...');
            this.lanzarAutodestruccion(dato.valor);
        });
        this.events.subscribe('conexionSpreaker:datos', (dato) => {
            console.log('[HOME.constructor] Recibidos datos de conexión');
            this.datosConexion = dato;
        });
        //this.events.subscribe('reproduccion:status', (statusRep) => this.cambiamscControl(statusRep));
        // https://ionicframework.com/docs/native/app-version/

        //this.navCtrl.setRoot(SlideInicioPage);
    }

    ngOnInit() {
        this.platform.ready()
        .then(() => {
            this.compruebaConexion(false);
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
        this.events.unsubscribe('reproduccion:descarga');
        //this.mscControl.destroy(); // <-- Revisar esto que no funciona.
        this.reproductor.release(this._configuracion);
        //this.backgroundMode.disable();
    }

    compruebaConexion (losQueMeGustan: boolean){
        this.desconectado = this.network.type === 'none';
        console.log('[home.compruebaConexion] el sistema me dice que la conexión es ' + this.network.type);
        while (this.items.pop()!= undefined) {} //Vacío la matriz de capítulos antes de volver a rellenar.
        if (this.desconectado){
            this.dialogs.alert('El terminal no tiene conexión. Por favor, conéctese y arrastre la pantalla hacia abajo', '');
            this.cargaEpisodiosGuardados(this.ordenado);
        }
        else{
            if (losQueMeGustan){
                this.cargaProgramasLike(this.datosConexion.usuario.user_id, null);
            }
            else{
                this.cargaProgramas(null);
            }
            this._configuracion.getFechasAbsolutas()
                .then((dato)=>this.mostrarFechasAbsolutas = dato)
                .catch((error) => console.log('[HOME.compruebaConexion] Error descargando usuario:' + error));
        }
    }

    despliegaProgramasBuscados (){
        this.desconectado = this.network.type === 'none';
        console.log('[home.cargaProgramasBuscados] el sistema me dice que la conexión es ' + this.network.type);
        while (this.items.pop()!= undefined) {} //Vacío la matriz de capítulos antes de volver a rellenar.
        if (this.desconectado){
            this.dialogs.alert('El terminal no tiene conexión. Por favor, conéctese y arrastre la pantalla hacia abajo', 'Super-Gurú.');
            this.cargaEpisodiosGuardados(this.ordenado);
        }
        else{
            this.cargaProgramasBuscados();
        }
    }

    cargaEpisodiosGuardados(ordenado:boolean){
        this.infiniteScroll = false;
        this.episodiosGuardados.daListaProgramas(ordenado).subscribe(
            data => {
				if (this.items == null){
                    this.items = [{objeto:data, like: false}];
                    console.log('[home.cargaEpisodiosGuardados] Recibido capítulo ' + data.title);
                    console.log('[home.cargaEpisodiosGuardados] Imagen ' + data.image_url);
				}
				else {
					this.items.push({objeto:data, like: false});
                    console.log('[home.cargaEpisodiosGuardados] Recibido otro capítulo ' + data.title);
                    console.log('[home.cargaEpisodiosGuardados] Imagen ' + data.image_url);
				}
            },
            err => {
                console.log('[home.cargaEpisodiosGuardados] Error en detalle:' + err);
            });
    }

    cargaUsuarioParaProgramas (episodio:string){
        this.cargaProgramas(episodio);
    }

    cargaProgramas (episodio:string){
        this.contadorCapitulos = this.numCapsXDescarga;
        this.episodiosService.dameEpisodios(this.datosConexion.usuario, this.datosConexion.token, episodio, this.numCapsXDescarga).subscribe(
            data => {
                this.contadorCapitulos--;
                console.log('[HOME.cargaProgramas] faltan por descargar ' + this.contadorCapitulos + ' capítulos');
                this._configuracion.getTimeRep(data.objeto.episode_id.toString())
                .then ((dataEscuchado) => {
                    console.log('[HOME.cargaProgramas] ha escuchado ' + dataEscuchado + ' y dura ' + data.objeto.duration);
                    if (dataEscuchado == 0) {
                        data.escuchado = 0;
                    }
                    else if ((data.objeto.duration - dataEscuchado) < 60000){
                        data.escuchado = 2;
                    }
                    else {
                        data.escuchado = 1;
                    }
                })
                .catch ((error) => {
                    console.error('[HOME.cargaProgramas] lakagaste ' + error);
                });
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
            }
        );
    }

    cargaProgramasLike (usuario:string, episodio:string){
        this.contadorCapitulos = this.numCapsXDescarga;
        this.episodiosService.dameDeLoQueMeGusta(usuario, episodio, this.numCapsXDescarga).subscribe(
            data => {
                this.contadorCapitulos--;
                console.log('[HOME.cargaProgramas] faltan por descargar ' + this.contadorCapitulos + ' capítulos');
                this._configuracion.getTimeRep(data.objeto.episode_id.toString())
                .then ((dataEscuchado) => {
                    console.log('[HOME.cargaProgramas] ha escuchado ' + dataEscuchado + ' y dura ' + data.objeto.duration);
                    if (dataEscuchado == 0) {
                        data.escuchado = 0;
                    }
                    else if ((data.objeto.duration - dataEscuchado) < 60000){
                        data.escuchado = 2;
                    }
                    else {
                        data.escuchado = 1;
                    }
                })
                .catch ((error) => {
                    console.error('[HOME.cargaProgramas] lakagaste ' + error);
                });
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
            }
        );
    }

    cargaProgramasBuscados (){
        this.contadorCapitulos = this.numCapsXDescarga;
        this.episodiosService.buscaEpisodios(this.datosConexion.usuario, this.datosConexion.token, this.textoBusqueda).subscribe(
            data => {
                this.contadorCapitulos--;
                console.log('[HOME.cargaProgramasBuscados] faltan por descargar ' + this.contadorCapitulos + ' capítulos');
                this._configuracion.getTimeRep(data.objeto.episode_id.toString())
                .then ((dataEscuchado) => {
                    console.log('[HOME.cargaProgramasBuscados] ha escuchado ' + dataEscuchado + ' y dura ' + data.objeto.duration);
                    if (dataEscuchado == 0) {
                        data.escuchado = 0;
                    }
                    else if ((data.objeto.duration - dataEscuchado) < 60000){
                        data.escuchado = 2;
                    }
                    else {
                        data.escuchado = 1;
                    }
                })
                .catch ((error) => {
                    console.error('[HOME.cargaProgramasBuscados] lakagaste ' + error);
                });
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
            }
        );
    }

    pushPage(item){
        console.log('[HOME.pushPage] Entro en episodio. ');// + JSON.stringify (item));
        this.entrandoEnRep = true;
        this.mscControlOpt.cover = item.objeto.image_url;
        this.mscControlOpt.track = item.objeto.title;
		this.mscControlOpt.duration = Math.round(item.objeto.duration/1000);
        this.creaControlEnNotificaciones();
        this.capEnRep = 'pdte' + item.objeto.episode_id;
        this.navCtrl.push(ReproductorPage, {episodio:   item,
                                            player:     this.reproductor,
                                       //     controlador:this.mscControl,
                                       //     soloWifi:this.soloWifi,
                                            enlaceTwitter: this.dameEnlace(item.objeto.title)});
    }

    recalentarCafe(event){
        if (this.infiniteScroll){
            let episodio = this.items[this.items.length-1].objeto.episode_id;
            if (episodio == null){
                console.log('[HOME.recalentarCafe] Episodio nulo');
                event.complete();
            }
            else {
                console.log('[HOME.recalentarCafe] Episodio vale ' + episodio);
                //this.cargaUsuarioParaProgramas(episodio);
                this.cargaProgramas(episodio);
                this.timerVigilaDescargas = setInterval(() =>{
                    console.log('[HOME.recalentarCafe] faltan por descargar ' + this.contadorCapitulos + ' cap�tulos');
                    if (this.contadorCapitulos == 0){
                        clearInterval(this.timerVigilaDescargas);
                        event.complete();
                    }
                }, 1000);
            }
        }
        else {
            event.complete();
            this.msgDescarga('Revisando capítulos descargados no puede ver si hay nuevos programas.');
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
        if (this.infiniteScroll){
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
                this.compruebaConexion(!this.soloCapitulosConLike);
            }
        }
        else {
            event.complete();
            this.msgDescarga('Revisando capítulos descargados no puede ver si hay nuevos programas.');
        }

    }

    muestraMenu(myEvent) {
        let datosObjeto = {player: this.reproductor/*, controlador:this.mscControl*/}
        let popover = this.popoverCtrl.create(MenuExtComponent, datosObjeto );
        popover.present({
            ev: myEvent
        });
    }

    async muestraMenuListado(myEvent) {
        const actionSheet = await this.actionSheetController.create({
            title: 'Filtrar listado de programas',
            buttons: [{
                text: 'Ver todos los programas',
                icon: 'list',
                handler: () => {
                    console.log('Quiere todos los programas');
                    this.infiniteScroll = true;
                    this.compruebaConexion (!this.soloCapitulosConLike);
                }
            }, {
                text: 'Descargados por fecha',
                icon: 'calendar',
                handler: () => {
                    console.log('Quiere los descargados por fecha');
                    while (this.items.pop()!= undefined) {};
                    this.infiniteScroll = false;
                    this.cargaEpisodiosGuardados(this.ordenado);
                }
            }, {
                text: 'Descargados por orden',
                icon: 'cloud-download',
                handler: () => {
                    console.log('Quiere los descargados por descarga');
                    while (this.items.pop()!= undefined) {};
                    this.infiniteScroll = false;
                    this.cargaEpisodiosGuardados(!this.ordenado);
                }
            }, {
                text: 'Mostrar programas favoritos',
                icon: 'heart',
                handler: () => {
                    console.log('Lista de favoritos');
                    this.infiniteScroll = false;
                    if (this.datosConexion.conectado){
                        this.compruebaConexion (this.soloCapitulosConLike);
                    }
                    else {
                        this.msgDescarga ('Para descargar los capítulos que le gustan debe estar logueado.')
                    }
                }
            }, {
                text: 'Buscar programas',
                icon: 'search',
                handler: () => {
                    console.log('Buscando un programa en concreto');
                    this.infiniteScroll = true;
                    this.buscando = true;
                }
            }, {
                text: 'Cancelar',
                icon: 'close',
                role: 'cancel',
                handler: () => {
                    console.log('Cancelado');
                }
            }]
          });
        await actionSheet.present();
    }

    procesaIonInput(entrada){
        console.log('[HOME.procesaIonInput] Buscando programas con el texto ' + this.textoBusqueda);
        this.buscando = false;
        this.despliegaProgramasBuscados();

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
            if (!this.events.unsubscribe('reproduccion:status')) {console.error('[HOME.creaControlEnNotificaciones] No me he dessuscrito del status de reproduccion.')};
            if (!this.events.unsubscribe('reproduccion:posicion')) {console.error('[HOME.creaControlEnNotificaciones] No me he dessuscrito de la posición de la reproduccion.')};
            if (!this.events.unsubscribe('reproduccion:descarga')) {console.error('[HOME.creaControlEnNotificaciones] No me he dessuscrito de los avisos de descarga.')};
        })
        .catch((error) => {console.error('[HOME.creaControlEnNotificaciones] ***** ERROR ***** Control remoto destruido KO ' + error) });

        console.log('[HOME.creaControlEnNotificaciones] Creando');
        this.mscControl.create(this.mscControlOpt)
        .then((data) => {
            console.log('[HOME.creaControlEnNotificaciones] Control remoto creado OK ' + JSON.stringify(data));
            if (!this.platform.is('ios')) {
                this.events.subscribe('reproduccion:status', (statusRep) => this.cambiamscControl(statusRep));
                this.events.subscribe('reproduccion:posicion', (posicion) => {
                    /*this.mscControl.updateElapsed({
                        elapsed: posicion,
                        isPlaying: true
                      });*/
                   // console.log('[HOME.creaControlEnNotificaciones] Recibido tiempo transcurrido: ' + posicion);
                });
                this.events.subscribe('reproduccion:descarga', (dato) => {
                    if (dato.descargar ) {
                        console.log('[HOME.creaControlEnNotificaciones] Solicitada descarga de capítulo ' + dato.datosEpisodio.episode_id);
                        this.descargaCafetera.descargaFichero(dato.datosEpisodio);
                    }
                    else {
                        console.log('[HOME.creaControlEnNotificaciones] Solicitado borrado de capítulo ' + dato.datosEpisodio.episode_id);
                        this.descargaCafetera.borrarDescarga(dato.datosEpisodio.episode_id);
                    }
                });
            }
        })
        .catch((error) => {console.error('[HOME.creaControlEnNotificaciones] ***** ERROR ***** Control remoto creado KO ' + error) });

        this.mscControl.subscribe()
        .subscribe((action) => {
            console.log('[HOME.creaControlEnNotificaciones] Recibido ' + JSON.stringify(action));
            const message = JSON.parse(action).message;
                switch(message) {
                    case 'music-controls-next':
                    case 'music-controls-skip-forward':
                    case 'music-controls-media-button-next':
                    case 'music-controls-media-button-fast-forward':
                    case 'music-controls-media-button-skip-forward':
                    case 'music-controls-media-button-step-forward':
                    case 'music-controls-media-button-meta-right':
                        //this.reproductor.adelantaRep();
                        this.events.publish('audio:peticion', 'NEXT');
                        console.log('[HOME.creaControlEnNotificaciones] music-controls-next');
                        break;
                    case 'music-controls-previous':
                    case 'music-controls-media-button-previous':
                    case 'music-controls-media-button-rewind':
                    case 'music-controls-media-button-skip-backward':
                    case 'music-controls-media-button-step-backward':
                    case 'music-controls-media-button-meta-left':
                        //this.reproductor.retrocedeRep();
                        this.events.publish('audio:peticion','PREV');
                        console.log('[HOME.creaControlEnNotificaciones] music-controls-previous');
                        break;
                    case 'music-controls-pause':
                    case 'music-controls-media-button-pause':
                        console.log('[HOME.creaControlEnNotificaciones] music-controls-pause');
                        //this.playPause(this._configuracion);
                        this.events.publish('audio:peticion','PAUSE');
                        this.reproductor.pause(this._configuracion);
                        break;
                    case 'music-controls-play':
                    case 'music-controls-media-button-play':
                        console.log('[HOME.creaControlEnNotificaciones] music-controls-play');
                        //this.events.publish('audio:peticion','PLAY');
                        //this.reproductor.justPlay(this._configuracion);
                        this.reproductor.resumePlay()
                        break;
                    case 'music-controls-destroy':
                        //this.reproductor.release(this._configuracion);
                        this.events.publish('audio:peticion','EXIT');
                        this.platform.exitApp();
                        break;
                    case 'music-controls-stop-listening':
                    case 'music-controls-media-button-stop':
                        //this.mscControl.destroy();
                        if (!this.entrandoEnRep){
                            console.log('[HOME.creaControlEnNotificaciones] music-controls-stop-listening  Cerrando por aquí ya que el NgOnDestroy no me tira');
                            this.events.unsubscribe('like:modificado');
                            this.events.unsubscribe('capitulo:fenecido');
                            this.events.unsubscribe('reproduccion:status');
                            this.events.unsubscribe('reproduccion:descarga');
                            //this.mscControl.destroy(); // <-- Revisar esto que no funciona.
                            this.reproductor.release(this._configuracion);
                        }
                        else {
                            console.log('[HOME.creaControlEnNotificaciones] music-controls-stop-listening  No cierro porque estoy entrando en el reproductor.');
                            this.entrandoEnRep = false;
                        }
                        break;
                    case 'music-controls-media-button' :
                // External controls (iOS only)
                    case 'music-controls-toggle-play-pause' :
                    case 'music-controls-media-button-play-pause':
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
            this.events.subscribe('reproduccion:posicion', (posicion) => {
                this.mscControl.updateElapsed({
                    elapsed: posicion,
                    isPlaying: this.statusPlay
                });
                console.log('[HOME.creaControlEnNotificaciones] Recibido tiempo transcurrido: ' + posicion);
            });
            this.events.subscribe('reproduccion:descarga', (dato) => {
                if (dato.descargar ) {
                    console.log('[HOME.constructor] Solicitada descarga de capítulo ' + dato.episodio_id);
                    this.descargaCafetera.descargaFichero(dato.datosEpisodio);
                }
                else {
                    console.log('[HOME.constructor] Solicitado borrado de capítulo ' + dato.episodio_id);
                    this.descargaCafetera.borrarDescarga(dato.episodio_id);
                }
            });
        }
    }

    cambiamscControl(statusRep: number){
        console.log('[HOME.cambiamscControl] ***** OJO ***** cambiado status de la reproducción a  ' + statusRep);
        this.statusPlay = !(statusRep == this.reproductor.dameStatusStop() || statusRep == this.reproductor.dameStatusPause());
        this.events.publish('reproduccionHome:status', statusRep);
        this.mscControl.updateIsPlaying(this.statusPlay);
        if (this.statusPlay){
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

    lanzarAutodestruccion(minutos:number){
        console.log('[HOME.lanzarAutodestruccion] Solicitada autodestrucción.');
        clearTimeout(this.relojArena); // Primero anulamos un posible anterior temporizador.
        this.events.unsubscribe('reproduccion:finCap');
        if (minutos != 0 && minutos != 666){
            this.relojArena = setTimeout (()=>{
                this.killingMeSoftly();
                this.mscControl.destroy()
                .then((data) => {
                    console.log('[HOME.autoDestruccion] Control remoto destruido OK ');
                })
                .catch((error) => {
                    console.error('[HOME.autoDestruccion] ***** ERROR ***** Control remoto destruido KO ')
                });
            }, minutos*60000);
        }
        if (minutos == 666)  {
            this.events.subscribe('reproduccion:finCap', (dato) => {
                console.log('[HOME.lanzarAutodestruccion] Recibido fin de capítulo. Cierro la app.');
                this.mscControl.destroy();
                this.killingMeSoftly();
            });
        }
    }

    killingMeSoftly () {
        console.log('[HOME.killingMeSoftly] Cerrando la app.');
        if (this.platform.is('ios')) {
            console.log('[HOME.killingMeSoftly] Detectada plataforma iOS. Parando reproducción');
            this.reproductor.stop();
            this.reproductor.release(this._configuracion);
            this.backgroundMode.moveToBackground();           
        }
        else {
            console.log('[HOME.killingMeSoftly] Detectada plataforma Android. Cerrando.');
            this.platform.exitApp();
        }
    }


    msgDescarga  (mensaje: string) {
        let toast = this.toastCtrl.create({
            message: mensaje,
            duration: 3000
        });
        toast.present();
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
