import { Component, OnDestroy } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Media, MediaObject } from '@ionic-native/media';
import { Platform } from 'ionic-angular';
import { Dialogs } from '@ionic-native/dialogs';

/*
  Generated class for the InfoFer page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-info-fer',
  templateUrl: 'info-fer.html',
  providers: [Dialogs]
})
export class InfoFerPage implements OnDestroy{
    
    repPlugin = new Media ();
    dirJingle: MediaObject;
    reproduciendo: boolean = false;
    esAndroid:boolean;
    
    constructor(public navCtrl: NavController, public navParams: NavParams, public platform : Platform, private mensaje: Dialogs) {
        //this.dirJingle = this.repPlugin.create ('http://www.xpress.es/radiocable/audio/jingle-cafetera-tennesse.mp3');
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad InfoFerPage');
    }

    ngOnDestroy(){
        if (this.dirJingle != null) {
            this.dirJingle.stop();
            this.dirJingle.release();
        }
    }
    
    reproduceJingle (){
        if (this.dirJingle == null){
            this.dirJingle = this.repPlugin.create ('http://www.xpress.es/radiocable/audio/jingle-cafetera-tennesse.mp3');
        }
        if (this.reproduciendo) {
            this.dirJingle.pause();
            this.reproduciendo=!this.reproduciendo;
        }
        else {
            this.dirJingle.play();
            this.mensaje.alert("El grupo JAVA no se hace responsable de la reproducción de este jingle", 'Super-Gurú.');
            this.reproduciendo=!this.reproduciendo;
        }
    }
}

