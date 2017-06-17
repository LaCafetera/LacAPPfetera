import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';
import { File } from '@ionic-native/file';

import { MusicControls } from '@ionic-native/music-controls';

import { EpisodiosService } from "../../providers/episodios-service";
import { ConfiguracionService } from '../../providers/configuracion.service';
import { Player } from '../../app/player';
import { ReproductorPage } from "../reproductor/reproductor";

/**
 * Generated class for the CapitulosDescargadosPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-capitulos-descargados',
  templateUrl: 'capitulos-descargados.html',
  providers: [File, EpisodiosService, ConfiguracionService]
})
export class CapitulosDescargadosPage {

    dirdestino:string;
    datosDestino: Array<any>
    items: Array<any>;
    mscControl: MusicControls;
    reproductor: Player;
    capEnRep:string = "ninguno";

    constructor(public navCtrl: NavController, 
                public navParams: NavParams, 
                private file: File, 
                private episodiosService: EpisodiosService, 
                private _configuracion: ConfiguracionService, 
                public events: Events) {
        this.items = new Array();
        this.reproductor = this.navParams.get('player');
        this.mscControl = this.navParams.get('controlador');
        events.subscribe("audio:modificado", (reproductorIn) => {
            console.log('[CAPITULOS-DESCARGADOS.constructor] Recibido mensaje Audio Modificado');
            if (reproductorIn != null){
                this.reproductor=reproductorIn.reproductor;
                this.mscControl = reproductorIn.controlador;
            }
            if( this.reproductor != null) {
                this.capEnRep = this.reproductor.dameCapitulo();
            }
        });
        events.subscribe("like:modificado", (valoresLike) => {
            console.log('[HOME.constructor] Recibido mensaje Like Modificado');
            this.actualizaLike (valoresLike.valorLike, valoresLike.episodio)
        });
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad CapitulosDescargadosPage');
        this.file.resolveLocalFilesystemUrl(this.file.dataDirectory) // --> Probar esto: externalDataDirectory
        .then((entry) => {
            this.dirdestino = entry.toInternalURL();
            console.log('[CAPITULOS-DESCARGADOS.ionViewDidLoad] Vamos a revisar los archivos que hay en la carpeta ' +this.dirdestino  );
            this.file.listDir(this.dirdestino,'' )
            .then((listado)=>{
                console.log("[CAPITULOS-DESCARGADOS.ionViewDidLoad] Los capitulos descargados son " + JSON.stringify(listado));
                this.datosDestino = listado
    
                this._configuracion.dameUsuario()
                .then ((Usuario) => {
                    if (Usuario != null){
                        console.log ("[CAPITULOS-DESCARGADOS.ionViewDidLoad] recibido usuario " + Usuario );
                        this._configuracion.dameToken()
                        .then ((token) => {
                            this.creaListaCapitulos (listado, Usuario, token);
                        })
                        .catch ((error) => {
                            console.log ("[CAPITULOS-DESCARGADOS.ionViewDidLoad] Error extrayendo usuario de Spreaker:" + error);
                            this.creaListaCapitulos (listado, null, null);
                        });
                    }
                    else {
                        console.log ("[CAPITULOS-DESCARGADOS.ionViewDidLoad] Error extrayendo usuario de Spreaker.");
                        this.creaListaCapitulos (listado, null, null);
                    } //  if (Usuario != null)
                }) // .then ((Usuario) => {
                .catch (() => {
                    console.log ("[CAPITULOS-DESCARGADOS.ionViewDidLoad] Debe estar conectado a Spreaker para poder realizar esa acción.");
                    this.creaListaCapitulos (listado, null, null);
                });
            }) //  .then((listado)=>{
            .catch ((error)=>{
            console.log("[CAPITULOS-DESCARGADOS.ionViewDidLoad] Se ha producido un errrrorrrr listando episodios" + error.body);
        })
        }) // .then((entry) => {
        .catch ((error)=>{
            console.log("[CAPITULOS-DESCARGADOS.ionViewDidLoad] Error recuperando carpeta de destino: " + error.body);
        });
    }

    creaListaCapitulos (listado: Array<any>, usuario: string, token:string){
        listado.forEach((capitulo, elemento, array) => {
        //    console.log("[CAPITULOS-DESCARGADOS.creaListaCapitulos] REcorriendo capítulos " + JSON.stringify(capitulo) + " - " + JSON.stringify(elemento) + " - " + JSON.stringify(array) + " - " );
            if (capitulo["isFile"]){
                this.episodiosService.dameDetalleEpisodio(capitulo["name"].replace('.mp3', '')).subscribe(
                data => {
                    if (token != null && usuario != null){
                        this.episodiosService.episodioDimeSiLike(capitulo["name"].replace('.mp3', ''), usuario, token)
                        .subscribe (
                            espureo=>{
                                console.log("[CAPITULOS-DESCARGADOS.creaListaCapitulos] Devuelve datos --> Me gusta el capítulo " + capitulo["name"].replace('.mp3', '') );
                                if (this.items == null){
                                    this.items = [{objeto:data.response.episode, like: true}];
                                }
                                else {
                                    this.items.push({objeto:data.response.episode, like: true});
                                    this.tidyYourRoom();
                                }
                            },
                            error=>{
                                console.log("[CAPITULOS-DESCARGADOS.creaListaCapitulos] No me gusta el capítulo " + capitulo["name"].replace('.mp3', ''));
                                if (this.items == null){
                                    this.items = [{objeto:data.response.episode, like: false}];
                                }
                                else {
                                    this.items.push({objeto:data.response.episode, like: false});
                                    this.tidyYourRoom();
                                }
                            })
                    }
                    else {
                        if (this.items == null){
                            this.items = [{objeto:data.response.episode, like: false}];
                        }
                        else {
                            this.items.push({objeto:data.response.episode, like: false});
                            this.tidyYourRoom();
                        }
                    }
                }, // data => {
                err => {
                    console.log("[CAPITULOS-DESCARGADOS.creaListaCapitulos] Error en detalle:" + err);
                })
            } // if (elemento["isFile"]){
        }) // listado.forEach((capitulo, elemento, array) => {
    }

    dameEnlace (cadena:string):string{
        return "https://twitter.com/hashtag/"+this.damehashtag(cadena)
    }

    tidyYourRoom(){
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

    damehashtag(cadena:string):string{
        let hashtag:string ="";
        let posHT = cadena.indexOf('#');
        if (posHT != -1){
            let espacio = cadena.indexOf(' ', posHT);
            if (espacio == -1) {
                espacio = cadena.length;
            }
            hashtag = cadena.substring(posHT+1, espacio) + " ";
        }
        return (hashtag);
    }

    pushPage(item){
    this.navCtrl.push(ReproductorPage, {episodio:   item,
                                        player:     this.reproductor,
                                        controlador:this.mscControl,
                                    //     soloWifi:this.soloWifi,
                                        enlaceTwitter: this.dameEnlace(item.objeto.title)});
    }

    borrarElemento(episodio){
        var encontrado = false;
        for (var i = 0; i < this.items.length && !encontrado; i+=1) {
        // console.log("En el índice '" + i + "' hay este valor: " + miArray[i]);
            if (this.items[i].objeto.episode_id == episodio) {
                this.items.splice(i, 1);
                encontrado = true;
                console.log("[HOME.actualizaLike] Encontrado capítulo en posición " + i);
            }
        }
        if (!encontrado){
            console.log("[HOME.actualizaLike] Capítulo no Encontrado");
        }
    }

    actualizaLike (valorLike, episodio){
        var encontrado = false;
        for (var i = 0; i < this.items.length && !encontrado; i+=1) {
        // console.log("En el índice '" + i + "' hay este valor: " + miArray[i]);
            if (this.items[i].objeto.episode_id == episodio) {
                this.items[i].like = valorLike;
                encontrado = true;
                console.log("[HOME.actualizaLike] Encontrado capítulo");
            }
        }
        if (!encontrado){
            console.log("[HOME.actualizaLike] Capítulo no Encontrado");
        }
    }
}