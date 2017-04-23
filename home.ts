import { Component } from "@angular/core";

import { NavController, Events, MenuController } from 'ionic-angular';
import { Dialogs } from '@ionic-native/dialogs';
import { BackgroundMode } from '@ionic-native/background-mode';
import { MusicControls } from '@ionic-native/music-controls';

import { EpisodiosService } from "../../providers/episodios-service";
//import { ConfiguracionService } from '../../providers/configuracion.service';

import { InfoFerPage } from "../info-fer/info-fer";
import { ReproductorPage } from "../reproductor/reproductor";
import { Player } from "../../app/player";


@Component({
  selector: "page-home",
  templateUrl: "home.html",
  providers: [EpisodiosService, BackgroundMode, Dialogs/*, ConfiguracionService*/]
})

export class HomePage {

    items: Array<any>;
   // reproductor = ReproductorPage;
    infoFer = InfoFerPage;
    reproductor: Player;
    capEnRep:string = "ninguno";
    soloWifi:boolean = false;
    mscControl:MusicControls;

    hashtag:string ="";



    constructor(public navCtrl: NavController, private episodiosService: EpisodiosService, public events: Events, public menuCtrl: MenuController, private backgroundMode: BackgroundMode, private dialogs: Dialogs/*, private _configuracion: ConfiguracionService*/) {
        this.items = new Array();
        events.subscribe("audio:modificado", (reproductorIn) => {
            // user and time are the same arguments passed in `events.publish(user, time)`
            if (reproductorIn != null){
                this.reproductor=reproductorIn.reproductor;
                this.mscControl = reproductorIn.controlador;
            }
            if( this.reproductor != null) {
                this.capEnRep = this.reproductor.dameCapitulo();
            }
        });
    }

    ionViewDidLoad() {
        //console.log("[HOME.ionViewDidLoad] Entrando" );
        this.backgroundMode.setDefaults({title: "La cAPPfetera",
                                  ticker: "Te estás tomando un cafetito de actualidad",
                                  text: "Bienvenido al bosque de Sherwood",
                                  silent: true});
        // BackgroundMode.enable();
        this.episodiosService.dameEpisodios().subscribe(
            data => {
                //this.items=data.response.items;
                //console.log("[HOME.ionViewDidLoad] Recibido " + JSON.stringify(data));
                if (this.items == null){
                    this.items = data.episode;
                }
                else {
                    this.items.push(data.episode);
                    let ordenado = this.items;
                    let mapped = ordenado.map((el, i) => {
                        return { index: i, value: el.episode_id };
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
                console.log(err);
                this.dialogs.alert ("[HOME.ionViewDidLoad] Error descargando episodios" + err, "Error");
            }
        );
    }

    ngOnDestroy(){
        this.reproductor.release();
        //this.mscControl.destroy(); <-- Revisar esto que no funciona.
        //.destroy(); // onSuccess, onError
    }

    pushPage(item){
        this.navCtrl.push(ReproductorPage, {episodio:   item,
                                            player:     this.reproductor,
                                            controlador:this.mscControl,
                                       //     soloWifi:this.soloWifi,
                                            enlaceTwitter: this.dameEnlace(item.title)});
  }

    recalentarCafe(event){
        this.episodiosService.dameMasEpisodios(this.items[this.items.length-1].episode_id).subscribe(
            data => {
                //this.items=this.items.concat(data.response.items);
                this.items.push(data.episode);
                // *******************************************************************       ESto hay que arreglarlo
                //if (data.response.items.length == 0) { // no quedan más capítulos
                //    event.enable(false);
                //}
                //console.log("[HOME.recalentarCafe] Recibidos "+data.response.items.length+" nuevos elementos. Ahora la lista tiene "+ this.items.length + " elementos");
                // event.complete();
            },
            err => {
                event.complete();
                console.log(err);
                this.dialogs.alert ("Error descargando episodios" + err, "Error");
            }
        );
    }

    lanzaTwitter(cap:string){
        window.open(this.dameEnlace(cap), '_system');
    }

    dameEnlace (cadena:string):string{
        return "https://twitter.com/hashtag/"+this.damehashtag(cadena)//+"/live";  //--> Versión 2
        //return "https://twitter.com/hashtag/"+this.damehashtag(cadena);
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

  hacerCafe(event){
      this.episodiosService.dameEpisodios().subscribe(
            data => {
                let longArray = data.response.items.length;
                let i:number=0;
                while (data.response.items[i].episode_id != this.items[0].episode_id && (i+1) < longArray) {
                    i++;
                }
                if (i>0){
                    this.items = data.response.items.slice(0,i).concat(this.items);
                    console.log("[HOME] Se han encontrado " + i + " nuevos capítulo");
                }
                else{
                    //Quitamos el primer elemento que tenemos y le ponemos el primero que acabamos de descargar, por si acaso éste se hubiera actualizado
                    this.items = data.response.items.slice(0,1).concat(this.items.slice(1));
                }
                event.complete();
            },
            err => {
                event.complete();
                console.log(err);
                this.dialogs.alert ("Error descargando episodios" + err, "Error");
            }
        );
    }

/*------------------------- salir -----------------
exit(){
      let alert = this.alert.create({
        title: "Confirm",
        message: "Do you want to exit?",
        buttons: [{
          text: "exit?",
          handler: () => { this.exitApp() }
        }, {
          text: "Cancel",
          role: "cancel"
        }]
      })
      alert.present();
  }
  exitApp(){
    this.platform.exitApp();
  }

  y por ahí:

  this.platform.registerBackButtonAction(this.exit)

  Más a mirar:
  http://cordova.apache.org/docs/en/latest/config_ref/index.html#preference ---> KeepRunning(boolean)
*/
}


// ojo a esto
// https://ionicframework.com/docs/v2/api/components/virtual-scroll/VirtualScroll/

// Y a esto:
// https://ionicframework.com/docs/v2/api/components/refresher/Refresher/
