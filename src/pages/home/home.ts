import { Component } from "@angular/core";

import { NavController, Events, MenuController } from "ionic-angular";
import { Dialogs, BackgroundMode, MusicControls } from "ionic-native";

import { EpisodiosService } from "../../providers/episodios-service";
import { ConfiguracionService } from '../../providers/configuracion.service';

import { InfoFerPage } from "../info-fer/info-fer";
import { ReproductorPage } from "../reproductor/reproductor";
import { Player } from "../../app/player";


@Component({
  selector: "page-home",
  templateUrl: "home.html",
  providers: [EpisodiosService, ConfiguracionService]
})

export class HomePage {

    items: Array<any>;
   // reproductor = ReproductorPage;
    infoFer = InfoFerPage;
    reproductor: Player;
    capEnRep:string = "ninguno";
    soloWifi:boolean = false;
    mscControl:MusicControls;



    constructor(public navCtrl: NavController, private episodiosService: EpisodiosService, public events: Events, public menuCtrl: MenuController, private _configuracion: ConfiguracionService) {

        events.subscribe("audio:modificado", (reproductorIn) => {
            // user and time are the same arguments passed in `events.publish(user, time)`
            if (reproductorIn != null){
                this.reproductor=reproductorIn.reproductor;
                this.capEnRep = this.reproductor.dameCapitulo();
                this.mscControl = reproductorIn.controlador;
            }
        });
    }

    ionViewDidLoad() {
        BackgroundMode.setDefaults({title: "La cAPPfetera",
                                  ticker: "Te estás tomando un cafetito de actualidad",
                                  text: "Bienvenido al bosque de Sherwood",
                                  silent: true});
        BackgroundMode.enable();
        this.episodiosService.dameEpisodios().subscribe(
            data => {
                this.items=data.response.items;
                //console.log("ok");
            },
            err => {
                console.log(err);
                Dialogs.alert ("Error descargando episodios" + err, "Error");
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
                                            soloWifi:this.soloWifi});
  }

    recalentarCafe(event){
        this.episodiosService.dameMasEpisodios(this.items[this.items.length-1].episode_id).subscribe(
            data => {
                this.items=this.items.concat(data.response.items);
                if (data.response.items.length == 0) { // no quedan más capítulos
                    event.enable(false);
                }
                //console.log("[HOME] Recibidos "+data.response.items.length+" nuevos elementos. Ahora la lista tiene "+ this.items.length + " elementos");
                event.complete();
            },
            err => {
                event.complete();
                console.log(err);
                Dialogs.alert ("Error descargando episodios" + err, "Error");
            }
        );
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
                Dialogs.alert ("Error descargando episodios" + err, "Error");
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
