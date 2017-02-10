/*npm install -g typings
typings install dt~cordova --save --global

ionic plugin add cordova-plugin-file-transfer*/

import { Component/*, Output, EventEmitter*/ } from '@angular/core';
import { NavController, NavParams, Platform, PopoverController, Events } from 'ionic-angular';
import { SocialSharing, Dialogs } from 'ionic-native';
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

    //onStatusUpdate: any;


    /*** compartir */


    constructor(public navCtrl: NavController, public navParams: NavParams, public platform : Platform, private episodiosService: EpisodiosService, public popoverCtrl: PopoverController, public events: Events) {

        this.capItem = this.navParams.get('episodio');
        this.episodio = this.capItem.episode_id;
        this.imagen = this.capItem.image_url;
        this.enVivo = this.capItem.type=="LIVE";
        this.reproductor = this.navParams.get('player');
        this.episodioDescarga = (this.enVivo?null:this.episodio);
        console.log("[reproductor] Enviado como episodio: " + this.episodioDescarga + "(" + this.episodio +")  porque enVivo vale " + this.enVivo);
        //this.episodiosService.dameDetalleEpisodio(this.episodio).subscribe(
        //    data => {
        this.titulo = this.capItem.title;
        this.descripcion = this.capItem.description;
        this.totDurPlay =  this.capItem.duration;
        this.tamanyoStr = this.dameTiempo(this.totDurPlay/1000);
        this.events.subscribe('pctjeDescarga:cambiado', (pctjeDescarga) => {
            // user and time are the same arguments passed in `events.publish(user, time)`
            this.porcentajeDescargado=pctjeDescarga;
            //alert('Recibido');
        });
    }

    ionViewDidLoad() {
        //console.log('ionViewDidLoad ReproductorPage');

    }

    ngOnDestroy(){
        //this.salidaPagina.emit({reproductor: this.reproductor});
        this.events.publish('audio:modificado', this.reproductor);
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
                //console.log("Posición: "+ position*1000 + ". Status: "+ this.statusRep + " - " + this.reproductor.MEDIA_RUNNING);
                if (position > -1 && this.reproductor.dameStatus() == this.reproductor.MEDIA_RUNNING) {
                    this.posicionRep = position*1000;
                    this.posicionRepStr = this.dameTiempo(Math.round(position));
                    console.log ("Reproductor por " + this.posicionRep + " (" + Math.round(position) + ")");
                }
            }).catch ((e) =>{
                console.log("Error getting pos=" + e);
            });
        }, 1000);
    }

    playPause(){
        if (this.reproductor != null){
            if (this.reproduciendo) {
                this.reproductor.pause();
                clearInterval(this.timer);
                this.iconoPlayPause = 'play';
                console.log("pause.");
                this.reproduciendo=!this.reproduciendo;
            }
            else {
                    //this.reproductor.resume();
                    console.log("[REPRODUCTOR] 1");
                this.reproductor.play(this.audioEnRep);
                    console.log("[REPRODUCTOR] 2");
                this.iconoPlayPause = 'pause';
                    console.log("[REPRODUCTOR] 3");
                this.iniciaContadorRep();
                    console.log("[REPRODUCTOR] 4");
                /*this.timer = setInterval(() =>{
                    this.reproductor.getCurrentPosition().then((position)=>{
                        //console.log("Posición: "+ position*1000 + ". Status: "+ this.statusRep + " - " + this.reproductor.MEDIA_RUNNING);
                        if (position > -1 && this.statusRep == this.reproductor.MEDIA_RUNNING) {
                            this.posicionRep = position*1000;
                            this.posicionRepStr = this.dameTiempo(Math.round(position));
                                    //console.log ("Reproductor por " + this.posicionRep + " (" + Math.round(position) + ")");
                        }
                    },
                    function (e) {
                        console.log("Error getting pos=" + e);
                    });
                }, 1000);*/
                //console.log("play");
                this.reproduciendo=!this.reproduciendo;
            }
        }
        else Dialogs.alert("Es nulo. (Error reproduciendo)", 'Error');
    }

    actualizaPosicion(){
        this.reproductor.seekTo(this.posicionRep);
        //console.log("Ha cambiado la posición del slider: " + this.posicionRep);
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
/*

                console.log("[ficheroDescargado] reproductor no es nulo. "+ this.audioEnRep +" - " + this.episodio);
                this.reproduciendo = (this.reproductor.dameStatus()==this.reproductor.MEDIA_RUNNING);
                if (this.reproduciendo){
                    if (this.reproductor.reproduciendoEste(nombrerep)){
                        console.log("[ficheroDescargado] Estaba reproduciendo el mismo audio.");
                        //this.reproductor.play(this.audioEnRep);
                        this.iconoPlayPause = 'pause';
                        this.iniciaContadorRep();
                    }
                    else{
                        console.log("[ficheroDescargado] Estaba reproduciendo distinto audio.");
                        //this.reproductor.play(this.audioEnRep);
                        this.iconoPlayPause = 'play';
                        //this.iniciaContadorRep();
                    }

                }
            }*/
        }
    }
}
