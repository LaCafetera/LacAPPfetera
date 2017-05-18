import { Component } from '@angular/core';
import { /*IonicPage,*/ NavController, NavParams } from 'ionic-angular';
import { EpisodiosService } from '../../providers/episodios-service';

/**
 * Generated class for the InfoUsuChat page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
//@IonicPage()
@Component({
  selector: 'page-info-usu-chat',
  templateUrl: 'info-usu-chat.html',
  providers: [EpisodiosService]
})
export class InfoUsuChatPage {

  user_id: string = "";
  user: Array<any>;

  constructor(public navCtrl: NavController, public navParams: NavParams, private episodioSrvc: EpisodiosService) {
    this.user = new Array();
    this.user_id = navParams.get("usuario");
    console.log("[InfoUsuChatPage] Recibido usuario " + this.user_id);
      this.episodioSrvc.yTuDeQuienEres(this.user_id).subscribe(
        data => {
          this.user = data.response.user;
          console.log("[InfoUsuChatPage] Recibido " + JSON.stringify(this.user));
        },
        err => {
          console.log("[InfoUsuChatPage] Error descargando datos usuario.")
        }
      )
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad InfoUsuChat');
  }

}
