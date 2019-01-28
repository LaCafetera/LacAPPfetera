import { Component,  OnDestroy } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, ToastController, normalizeURL, PopoverController } from 'ionic-angular';

import { EpisodiosGuardadosService } from "../../providers/episodios_guardados.service";

import { MenuExtDescComponent } from '../../components/menuext_descargados/menuext_descargados';

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
  providers: [EpisodiosService, ConfiguracionService, EpisodiosGuardadosService]
})
export class CapitulosDescargadosPage implements OnDestroy {

    dirdestino:string;
    datosDestino: Array<any>
    items: Array<any>;
    //mscControl: MusicControls;
    reproductor: Player;
    capEnRep:string = "ninguno";
    ordenarCapitulos: boolean = true;
    usuario:string = "";
    token: string = "";

    constructor(public navCtrl: NavController, 
                public navParams: NavParams, 
                private episodiosService: EpisodiosService, 
                private _configuracion: ConfiguracionService, 
                public events: Events,
                private dameDescargados: EpisodiosGuardadosService, 
                public toastCtrl: ToastController,
                public popoverCtrl: PopoverController) {
        this.items = new Array();
        this.reproductor = this.navParams.get('player');
        if( this.reproductor != null) {
            this.capEnRep = this.reproductor.dameCapitulo();
            console.log('[CAPITULOS-DESCARGADOS.constructor] El capítulo que se está reproduciendo es ' + this.capEnRep);
        }
        else {
            console.log('[CAPITULOS-DESCARGADOS.constructor] Reproductor es nulo.');
        }
        events.subscribe("audio:modificado", (reproductorIn) => {
            console.log('[CAPITULOS-DESCARGADOS.constructor] Recibido mensaje Audio Modificado');
            if (reproductorIn != null){
                this.reproductor=reproductorIn.reproductor;
            }
        });
        events.subscribe("like:modificado", (valoresLike) => {
            console.log('[CAPITULOS-DESCARGADOS.constructor] Recibido mensaje Like Modificado');
            this.actualizaLike (valoresLike.valorLike, valoresLike.episodio)
        });
        events.subscribe("menuDescargas:orden", (ordenado) => {
            console.log('[CAPITULOS-DESCARGADOS.constructor] Recibido mensaje de cambiar el orden. (' + ordenado + ')');
            this.ordenarCapitulos = ordenado.valor;
            this.creaListaCapitulos (this.usuario, this.token)
        });
    }

    ionViewDidLoad() {
        this._configuracion.dameUsuario()
        .then ((Usuario) => {
            if (Usuario != null){
                console.log ("[CAPITULOS-DESCARGADOS.ionViewDidLoad] recibido usuario " + Usuario );
                this.usuario = Usuario;
                this._configuracion.dameToken()
                .then ((token) => {
                    this.creaListaCapitulos (Usuario, token);
                    this.token = token;
                })
                .catch ((error) => {
                    console.log ("[CAPITULOS-DESCARGADOS.ionViewDidLoad] Error extrayendo usuario de Spreaker:" + error);
                    this.creaListaCapitulos (null, null);
                });
            }
            else {
                console.log ("[CAPITULOS-DESCARGADOS.ionViewDidLoad] Error extrayendo usuario de Spreaker.");
                this.creaListaCapitulos (null, null);
            } 
        })
        .catch (() => {
            console.log ("[CAPITULOS-DESCARGADOS.ionViewDidLoad] Debe estar conectado a Spreaker para poder realizar esa acción.");
            this.creaListaCapitulos (null, null);
        });
    }

    ngOnDestroy(){
        console.log('[CAPITULOS-DESCARGADOS.ngOnDestroy] Cerrandoooooooooooooooooooooooo');
        this.events.unsubscribe('like:modificado');
        this.events.unsubscribe('reproduccion:status');
        this.events.unsubscribe('audio:modificado');
    }

    creaListaCapitulos (usuario: string, token:string){
        this.items = [];
        this.dameDescargados.daListaProgramas(this.ordenarCapitulos).subscribe(
            data => {
                if (token != null && usuario != null){
                    this.episodiosService.episodioDimeSiLike(data["episode_id"], usuario, token)
                    .subscribe (
                        espureo=>{
                            console.log("[CAPITULOS-DESCARGADOS.creaListaCapitulos] Devuelve datos --> Me gusta el capítulo " + data['episode_id'] );
                            if (this.items == null){
                                this.items = [{objeto:data, like: true, objetoTxt: JSON.stringify(data)}];
                            }
                            else {
                                this.items.push({objeto:data, like: true, objetoTxt: JSON.stringify(data)});
                            }
                        },
                        error=>{
                            console.log("[CAPITULOS-DESCARGADOS.creaListaCapitulos] No me gusta el capítulo " + data['episode_id'] );
                            if (this.items == null){
                                this.items = [{objeto:data, like: false, objetoTxt: JSON.stringify(data)}];
                            }
                            else {
                                this.items.push({objeto:data, like: false, objetoTxt: JSON.stringify(data)});
                            }
                        })
                }
                else {
                    if (this.items == null){
                        this.items = [{objeto:data, like: false, objetoTxt: JSON.stringify(data)}];
                    }
                    else {
                        this.items.push({objeto:data, like: false, objetoTxt: JSON.stringify(data)});
                    }
                }
                /*console.log("[CAPITULOS-DESCARGADOS.creaListaCapitulos] La imagen de este item es:" + data.image_url);  
                if (this.ordenarCapitulos) {
                    this.items = this.tidyYourRoom(this.items);
                }*/
            },
            err => {
                console.log("[CAPITULOS-DESCARGADOS.creaListaCapitulos] Error en detalle:" + err);
            }
        );
    }

    dameEnlace (cadena:string):string{
        return "https://twitter.com/hashtag/"+this.damehashtag(cadena)
    }

    tidyYourRoom(listaProgramas: Array<any>) :Array<object>{
        //let ordenado = listaProgramas;
        let mapped = listaProgramas.map((el, i) => {
            return { index: i, value: el.episode_id };
        });

        // ordenando el array mapeado conteniendo los valores reducidos
        mapped.sort((a, b) => {
            return (b.value - a.value);
        });

        // contenedor para el orden resultante
        return( mapped.map((el) =>{
            return listaProgramas[el.index];
        }));
    }

/*
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
*/
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
                                            //controlador:this.mscControl,
                                        //     soloWifi:this.soloWifi,
                                            enlaceTwitter: this.dameEnlace(item.objeto.title)});
        this.events.subscribe('reproduccion:status', (statusRep) => this.cambiamscControl(statusRep));
    }

    cambiamscControl(statusRep: number){
        console.log('[capitulos-descargados.cambiamscControl] ***** OJO ***** cambiado status de la reproducción a  ' + statusRep)
        this.events.publish('reproduccionHome:status', statusRep);
        //this.mscControl.updateIsPlaying(!(statusRep == this.reproductor.dameStatusStop() || statusRep == this.reproductor.dameStatusPause()));
    }

    borrarElemento(episodio){
        console.log("[capitulos-descargados.borrarElemento] recibido " +episodio.episodio_id );
        var encontrado = false;
        for (var i = 0; i < this.items.length && !encontrado; i+=1) {
        // console.log("En el índice '" + i + "' hay este valor: " + miArray[i]);
            if (this.items[i].objeto.episode_id == episodio.episodio_id) {
                this.items.splice(i, 1);
                encontrado = true;
                console.log("[capitulos-descargados.borrarElemento] Encontrado capítulo en posición " + i);
            }
        }
        if (!encontrado){
            console.log("[capitulos-descargados.borrarElemento] Capítulo no Encontrado");
        }
    }

    actualizaLike (valorLike, episodio){
        var encontrado = false;
        for (var i = 0; i < this.items.length && !encontrado; i+=1) {
        // console.log("En el índice '" + i + "' hay este valor: " + miArray[i]);
            if (this.items[i].objeto.episode_id == episodio) {
                this.items[i].like = valorLike;
                encontrado = true;
                console.log("[capitulos-descargados.actualizaLike] Encontrado capítulo");
            }
        }
        if (!encontrado){
            console.log("[capitulos-descargados.actualizaLike] Capítulo no Encontrado");
        }
    }

    normalizaUbicacion (ubicacion: string ):string {
        return (normalizeURL(ubicacion));
    }

    msgDescarga  (mensaje: string) {
        let toast = this.toastCtrl.create({
            message: mensaje,
            duration: 3000,
            cssClass: 'msgDescarga'
        });
        toast.present();
    }
    
    muestraMenu(myEvent) {
        let datosObjeto = {ordenado: this.ordenarCapitulos}
        let popover = this.popoverCtrl.create(MenuExtDescComponent, datosObjeto );
        popover.present({
            ev: myEvent
        });
    }
}