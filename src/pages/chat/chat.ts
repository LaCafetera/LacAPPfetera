import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { EpisodiosService } from '../../providers/episodios-service';

/*
  Generated class for the Chat page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
  providers: [EpisodiosService]
})
export class ChatPage {
    episodio: string;
    items: Array<any>;

  constructor(public navCtrl: NavController, public navParams: NavParams, private episodiosService: EpisodiosService) {
    console.log("[ChatPage] entrando en el chat... Espero...")
    this.episodio = this.navParams.get('episodioMsg');
    this.episodiosService.dameChatEpisodio(this.episodio).subscribe(
            data => {
                this.items=data.response.items;
                console.log ("[ChatPage] OK");
            },
            err => {
                alert(err);
            }
        );       

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatPage');
  }

}
