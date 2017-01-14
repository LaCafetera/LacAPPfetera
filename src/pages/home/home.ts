import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { Splashscreen } from 'ionic-native';

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
    reproductor = ReproductorPage;
    infoFer = InfoFerPage;

    constructor(public navCtrl: NavController, private episodiosService: EpisodiosService) {
        console.log("Entrando en constructor HomePage - w");
        this.episodiosService.dameEpisodios().subscribe(
            data => {
                this.items=data.response.items;
                console.log('ok');
            },
            err => {
                console.log(err);
            }
        );
        Splashscreen.hide();
    }

}

// ojo a esto
// https://ionicframework.com/docs/v2/api/components/virtual-scroll/VirtualScroll/

// Y a esto:
// https://ionicframework.com/docs/v2/api/components/refresher/Refresher/