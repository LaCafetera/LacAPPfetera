import { Component, OnDestroy } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { Platform } from 'ionic-angular';
import { Dialogs } from '@ionic-native/dialogs/ngx';
import { Vibration } from '@ionic-native/vibration/ngx';


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
    vibrando: boolean = false;
    timer: number = 0;
    imagenFer: string = "https://d1bm3dmew779uf.cloudfront.net/large/85c07fc70ab7c568dc559432042148c3.jpg";
    
    constructor(public navCtrl: NavController, public navParams: NavParams, public platform : Platform, private mensaje: Dialogs, private vibration: Vibration) {
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

    goodVibrations(){
        if (!this.vibrando) {
			this.vibrando = true;
            this.imagenFer = "assets/images/Vibracion_ON.jpg";
            this.timer = setInterval(() =>{
                // Duration is ignored on iOS.
                this.vibration.vibrate(1000);
            }, 2000); // que vibre un segundo sí y otro no
        }
        else {
            clearInterval (this.timer);
            this.timer = 0;
            //this.vibration.vibrate(0); Esto sobra; cuando termine de vibrar, ha terminado.
            this.vibrando = false;
            this.imagenFer = "https://d1bm3dmew779uf.cloudfront.net/large/85c07fc70ab7c568dc559432042148c3.jpg";
        }
    }
}

