import { Component } from '@angular/core';
import { /*IonicPage,*/ NavController, NavParams, ToastController } from 'ionic-angular';
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
  enlaceTwitter: string = "";
  enlaceMail: string = "";

  constructor(public navCtrl: NavController, public navParams: NavParams, private episodioSrvc: EpisodiosService, private toastCtrl: ToastController, ) {
    this.user = new Array();
    this.user_id = navParams.get("usuario");
    console.log("[InfoUsuChatPage] Recibido usuario " + this.user_id);
      this.episodioSrvc.yTuDeQuienEres(this.user_id).subscribe(
        data => {
          this.user = data.response.user;
          console.log("[InfoUsuChatPage] Recibido " + JSON.stringify(this.user));

          if (this.user['image_url'] == null){
            this.user['image_url'] = 'assets/icon/icon.png';
          }

          if (this.user['twitter_username'] != null){
            this.enlaceTwitter = "https://twitter.com/"+this.user['twitter_username'];
          }

          if (this.user['contact_email'] != null){
            this.enlaceMail = "mailto:"+this.user['contact_email'];
          }

          if (this.user['description'] == null) {
            this.user['description'] = 'Descripción no disponible';
            if (this.user_id == '9794942') {
              this.user['description'] = this.user['description'] + '. Escrito desde mi iPhone';
            }
          }
          else if (this.user_id == '9794942') {
            this.user['description'] = this.user['description'] + '. Escrito desde mi iPhone';
          }
        },
        err => {
          console.log("[InfoUsuChatPage] Error descargando datos usuario.")
        }
      )
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad InfoUsuChat');
  }

    msgDescarga  (mensaje: string) {
        let toast = this.toastCtrl.create({
            message: mensaje,
            duration: 3000,
            cssClass: 'msgDescarga'
        });
        toast.present();
    }

  sinEnlaceTwitter(){
    this.msgDescarga("El usuario no tiene almacenado su usuario de Twitter");
    console.log("[InfoUsuChatPage.sinEnlaceTwitter] El usuario no tiene almacenado su usuario de Twitter " + this.user['twitter_username']);
  }

  sinEnlaceFacebook(){
    this.msgDescarga("El usuario no tiene almacenada su pagina de Facebook");
    console.log("[InfoUsuChatPage.sinEnlaceFacebook] El usuario no tiene almacenado su usuario de Facebook " + this.user['facebook_permalink']);
  }


  sinEnlaceMail(){
    this.msgDescarga("El usuario no tiene almacenado su dirección de correo");
    console.log("[InfoUsuChatPage.sinEnlaceMail] El usuario no tiene almacenado su dirección de correo " + this.user['contact_email']);
  }


  sinEnlaceWeb(){
    this.msgDescarga("El usuario no tiene almacenada su página web");
    console.log("[InfoUsuChatPage.sinEnlaceWeb] El usuario no tiene almacenado su página web " + this.user['website_url']);
  }

}
