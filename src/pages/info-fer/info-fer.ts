import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { MediaPlugin } from 'ionic-native';
import { Platform } from 'ionic-angular';
import { Dialogs } from 'ionic-native';

/*
  Generated class for the InfoFer page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-info-fer',
  templateUrl: 'info-fer.html'
})
export class InfoFerPage {
    
    dirJingle = new MediaPlugin ('http://www.xpress.es/radiocable/audio/jingle-cafetera-tennesse.mp3');
    reproduciendo: boolean = false;
    esAndroid:boolean;
    
    constructor(public navCtrl: NavController, public navParams: NavParams, public platform : Platform) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad InfoFerPage');
     //   this.esAndroid = this.platform.is('android');
     //   if(this.esAndroid){
            this.dirJingle.init.then(() => {
                console.log('[INFO_FER.ionViewDidLoad] Audio terminado');
            }, (err) => {
                console.log('[INFO_FER.ionViewDidLoad] Algo falló. Código de error: ' + err.code + '; mensaje: ' + err.message);
            });
     //   }
    }
    
    reproduceJingle (){
        if (this.dirJingle != null){
            if (this.reproduciendo) {
         //       if (this.esAndroid){
                    this.dirJingle.pause();
         //       }
                this.reproduciendo=!this.reproduciendo;
            }
            else {
         //       if (this.esAndroid){
                    this.dirJingle.play();
         //       }
                Dialogs.alert("El grupo JAVA no se hace responsable de la reproducción de este jingle", 'Super-Gurú.');
                this.reproduciendo=!this.reproduciendo;
            }
        }
        else alert("Es nulo");
    }
}
