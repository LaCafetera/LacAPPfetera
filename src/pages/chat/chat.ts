import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';
import { EpisodiosService } from '../../providers/episodios-service';
import { ConfiguracionService } from '../../providers/configuracion.service';
import { Dialogs } from '@ionic-native/dialogs';
import { Keyboard } from '@ionic-native/keyboard';
import { InfoUsuChatPage } from "../info-usu-chat/info-usu-chat";
// https://www.npmjs.com/package/ng2-emoji
//import { Ng2EmojiModule } from 'ng2-emoji';

/*
  Generated class for the Chat page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
  providers: [EpisodiosService, SocialSharing, ConfiguracionService, Dialogs, Keyboard]
})
export class ChatPage {
    episodio: string;
    hashtag: string;
    items: Array<any>;
    timer:any;
    mensajeTxt:string = "";
    usuario_id:string = "";

  constructor(public navCtrl: NavController, 
              public navParams: NavParams, 
              private episodiosService: EpisodiosService,
              private socialsharing: SocialSharing,
              private _configuracion: ConfiguracionService, 
              private toastCtrl: ToastController,
              private dialogs: Dialogs,
              private keyboard: Keyboard ) {
    this.episodio = this.navParams.get('episodioMsg');
    this.hashtag = this.navParams.get('hashtag');
    console.log("[CHAT]: Hashtag recibido: "+ this.hashtag);
    this._configuracion.dameUsuario()
    .then ((dataUsuario) => {
        this.usuario_id = dataUsuario;
        this.episodiosService.dameChatEpisodio(this.episodio).subscribe(
        data => {
            this.items=data.response.items;
        },
        err => {
            console.log("[CHAT.ionViewDidLoad] Error recuperando chat: " + err)
        })
    })
    .catch (() => {
        this.episodiosService.dameChatEpisodio(this.episodio).subscribe(
        data => {
            this.items=data.response.items;
        },
        err => {
            console.log("[CHAT.ionViewDidLoad] Error recuperando chat: " + err)
        })
        console.log("[CHAT.ionViewDidLoad] Error recuperando usuario.")
    });
/*    this.episodiosService.dameChatEpisodio(this.episodio).subscribe(
        data => {
            this.items=data.response.items;
        },
        err => {
            alert(err);
        }
    );       */
  }
  
      ngOnDestroy(){
        clearInterval(this.timer);
    }


  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatPage');
    this.timer = setInterval(() =>{
        console.log("[CHAT.dameComentarios] Actualizando Chat");
        this.episodiosService.dameChatEpisodio(this.episodio).subscribe(
            data => {
                if (this.items == null){
                    this.items=data.response.items;
                }
                else {
                    let longArray = data.response.items.length;
                    let i:number=0;
                    //console.log("[CHAT] LA nueva remesa de mensajes tiene de longitud " + longArray  ); 
                    while (data.response.items[i].message_id != this.items[0].message_id && (i+1) < longArray) {
                        i++;
                        console.log("[CHAT.dameComentarios] " + i );   
                    }
                    this.items = data.response.items.slice(0,i).concat(this.items);
                    console.log("[CHAT.dameComentarios] Se han encontrado " + i + " nuevos mensajes");
                }
            },
            err => {
                //Dialogs.alert('Error actualizando chat', 'Oh oh...');
                console.log ("[CHAT.dameComentarios] Error actualizando chat: " + err)
            }
        );       
    }, 5000);
  }
/*
  concatenaChat (arrayChat, nuevoArray){
    if (arrayChat[0].message_id == nuevoArray[0].message_id){
        return arrayChat;
    }
    else{
        return nuevoArray[0].concat(this.concatenaChat(arrayChat, nuevoArray.slice(1)));
    }
  }
  */
  
  quieroMas(event){
      this.episodiosService.dameMasComentarios(this.episodio, this.items[this.items.length-1].message_id).subscribe(
            data => {
                this.items=this.items.concat(data.response.items);
                //console.log("[HOME] Recibidos "+data.response.items.length+" nuevos elementos. Ahora la lista tiene "+ this.items.length + " elementos");
                event.complete();
            },
            err => {
                event.complete();
                console.log(err);
            }
        );
    }

    enviarComentario(){
        console.log ("[CHAT.enviarComentario] Solicitado envío " + this.mensajeTxt );

        this._configuracion.dameUsuario()
        .then ((dataUsuario) => {
            if (dataUsuario != null){
                console.log ("[CHAT.enviarComentario] recibido usuario " + dataUsuario );
                this._configuracion.dameToken()
                .then ((dataToken) => {
                    console.log ("[CHAT.enviarComentario] recibido token " + dataToken );
                    if (dataToken != null) {
                        console.log("[CHAT.enviarComentario] solicitado envío para usuario " + dataUsuario);
                        this.episodiosService.enviaComentarios(this.episodio, dataUsuario, dataToken,  this.mensajeTxt).subscribe(
                            data => {
                                console.log("[[CHAT.enviarComentario] Mensaje enviado" + JSON.stringify(data));
                                this.mensajeTxt = null;
                            },
                            err => {
                                console.log("[[CHAT.enviarComentario] Error enviando mensaje:" + err);
                            }
                        );
                    }
                    else {
                        this.msgDescarga ("Debe estar conectado a Spreaker para poder realizar esa acción.");
                    }
                })
                .catch ((error) => {
                    console.log("[CHAT.enviarComentario] Error descargando token:" + error);
                    this.msgDescarga ("Error extrayendo usuario de Spreaker.");
                });
            }
            else {
                this.msgDescarga ("Error extrayendo usuario de Spreaker.");
            }
        })
        .catch (() => {
            this.msgDescarga ("Debe estar conectado a Spreaker para poder realizar esa acción.");
        });
    }

    twittearComentario(){
        console.log ("[CHAT.twittearComentario] Solicitado envío");
        this.socialsharing.shareViaTwitter(this.hashtag + " " + this.mensajeTxt)
        .then((respuesta) => {
            console.log ("[CHAT.twittearComentario] Twitteo OK: " + respuesta);
            this.mensajeTxt = null;
        })
        .catch((error) => {
            console.log ("[CHAT.twittearComentario] Twitteo KO: " + error);
        });
    }
    
    msgDescarga  (mensaje: string) {
        let toast = this.toastCtrl.create({
            message: mensaje,
            duration: 3000,
            cssClass: 'msgDescarga'
        });
        toast.present();
    }

    borrarComentario(item:any){
        console.log("[CHAT.borraComentario] Entrando");
        this.dialogs.confirm('¿Desea borrar el mesaje?')
        .then ((respuesta)=> {
            //reproductor.stop();
            console.log("[CHAT.borraComentario] Confirmación de borrado:" + respuesta);
            if (respuesta == 1){                    
                this._configuracion.dameUsuario()
                .then ((dataUsuario) => {
                    if (dataUsuario != null){
                        this._configuracion.dameToken()
                        .then ((dataToken) => {
                            this.episodiosService.borraComentarios(this.episodio, dataUsuario, dataToken, item.message_id).subscribe(
                            data =>{
                                console.log("[CHAT.borraComentario] Comentario " + item.message_id + " borrado");
                                this.borraItemComentario(item);
                            }, 
                            err =>{
                                console.log("[CHAT.borraComentario] Error borrando comentario " + item.message_id);
                            })
                        })
                        .catch ((error) => {
                            this.msgDescarga ("Error borrando mensaje.");
                            console.log("[CHAT.borraComentario] Error extrayendo token " + error);
                        });
                    }
                    else {
                        this.msgDescarga ("Error extrayendo usuario de Spreaker.");
                    }
                })
                .catch (() => {
                    this.msgDescarga ("Debe estar conectado a Spreaker para poder realizar esa acción.");
                });
            }
        })
        .catch (() => {
            console.log("[descarga.components.descargarFichero] Rechazada opción de borrado.")
        })
    }

    borraItemComentario(item){
        this.items.splice(this.items.indexOf(item) ,1);
    }

    muestraTeclado(){
        this.keyboard.show();
    }

    ocultaTeclado(){
        this.keyboard.close(); 
    }

    muestraDatosUsuario(user_id){
        console.log("[CHAT.muestraDatosUser] Usuario " + user_id);
        this.navCtrl.push(InfoUsuChatPage, {usuario: user_id});
    }
}

