import { Component } from '@angular/core';

import { NavController, Events } from 'ionic-angular';
import { MediaPlugin, Dialogs } from 'ionic-native';

import { EpisodiosService } from '../../providers/episodios-service';
import { InfoFerPage } from '../info-fer/info-fer';
import { ReproductorPage } from '../reproductor/reproductor';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [EpisodiosService]
})

export class HomePage {
    
    items: Array<any>;
   // reproductor = ReproductorPage;
    infoFer = InfoFerPage;
    reproductor: MediaPlugin;
    capEnRep:string = "ninguno";

    constructor(public navCtrl: NavController, private episodiosService: EpisodiosService, public events: Events) {
        events.subscribe('audio:modificado', (reproductorIn) => {
            // user and time are the same arguments passed in `events.publish(user, time)`
            if (reproductorIn != null){
                this.reproductor=reproductorIn;
                this.capEnRep = reproductorIn.dameCapitulo();
            }
        });
    }    
    
    ionViewDidLoad() {
        this.episodiosService.dameEpisodios().subscribe(
            data => {
                this.items=data.response.items;
                //console.log('ok');
            },
            err => {
                console.log(err);
                Dialogs.alert ('Error descargando episodios' + err, 'Error');
            }
        );
    }

      pushPage(item){
        // push another page on to the navigation stack
        // causing the nav controller to transition to the new page
        // optional data can also be passed to the pushed page.
        this.navCtrl.push(ReproductorPage, {episodio: item,player:this.reproductor});
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
                Dialogs.alert ('Error descargando episodios' + err, 'Error');
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
                Dialogs.alert ('Error descargando episodios' + err, 'Error');
            }
        );
    }

}

// ojo a esto
// https://ionicframework.com/docs/v2/api/components/virtual-scroll/VirtualScroll/

// Y a esto:
// https://ionicframework.com/docs/v2/api/components/refresher/Refresher/