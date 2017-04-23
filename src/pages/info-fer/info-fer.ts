import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { MediaPlugin, MediaObject } from '@ionic-native/media';
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
export class InfoFerPage {
    
    repPlugin = new MediaPlugin ();
    dirJingle:MediaObject;
    reproduciendo: boolean = false;
    esAndroid:boolean;
    
    constructor(public navCtrl: NavController, public navParams: NavParams, public platform : Platform, private mensaje: Dialogs) {
        this.repPlugin.create ('http://www.xpress.es/radiocable/audio/jingle-cafetera-tennesse.mp3')
            .then((objeto)=> {
                this.dirJingle = objeto;
            })
            .catch((error)=> {
                console.log("[PLAYER.crearepPlugin] Error creando reproductor:"+ error); 
            });
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad InfoFerPage');
     /*   this.esAndroid = this.platform.is('android');
     //   if(this.esAndroid){
            this.dirJingle.init.then(() => {
                console.log('[INFO_FER.ionViewDidLoad] Audio terminado');
            }, (err) => {
                console.log('[INFO_FER.ionViewDidLoad] Algo falló. Código de error: ' + err.code + '; mensaje: ' + err.message);
            });
        }*/
    }

    ngOnDestroy(){
        if (this.dirJingle != null) {
            this.dirJingle.play();
        }
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
                this.mensaje.alert("El grupo JAVA no se hace responsable de la reproducción de este jingle", 'Super-Gurú.');
                this.reproduciendo=!this.reproduciendo;
            }
        }
        else alert("Es nulo");
    }
}

