import { Component } from '@angular/core';

import { NavController, Events } from 'ionic-angular';
import { MediaPlugin, Splashscreen } from 'ionic-native';

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
            this.reproductor=reproductorIn;
            this.capEnRep = reproductorIn.dameCapitulo();
        });
    }    
    
    ionViewDidLoad() {
        console.log('ionViewDidLoad HomePage');
        console.log("Entrando en constructor HomePage - w");
        this.episodiosService.dameEpisodios().subscribe(
            data => {
                this.items=data.response.items;
                //console.log('ok');
            },
            err => {
                console.log(err);
            }
        );
        Splashscreen.hide();
    }

      pushPage(item){
        // push another page on to the navigation stack
        // causing the nav controller to transition to the new page
        // optional data can also be passed to the pushed page.
        this.navCtrl.push(ReproductorPage, {episodio: item,player:this.reproductor});
  }

}

// ojo a esto
// https://ionicframework.com/docs/v2/api/components/virtual-scroll/VirtualScroll/

// Y a esto:
// https://ionicframework.com/docs/v2/api/components/refresher/Refresher/