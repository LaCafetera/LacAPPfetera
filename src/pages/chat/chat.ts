import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, Events } from 'ionic-angular';
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
    timer:number = 0;
    mensajeTxt:string = "";
    usuario_id:string = "";
    token_id:string = "";
    mostrarFechasAbsolutas : boolean = false;

    constructor(public navCtrl: NavController, 
                public navParams: NavParams, 
                private episodiosService: EpisodiosService,
                private socialsharing: SocialSharing,
                private _configuracion: ConfiguracionService, 
                private toastCtrl: ToastController,
                private dialogs: Dialogs,
                private keyboard: Keyboard, 
                public events: Events ) {
        this.episodio = this.navParams.get('episodioMsg');
        this.hashtag = this.navParams.get('hashtag');
        console.log("[CHAT]: Hashtag recibido: "+ this.hashtag);
        this._configuracion.dameUsuario()
        .then ((dataUsuario) => {
            this.usuario_id = dataUsuario;
        })
        .catch (() => {
            console.log("[CHAT.ionViewDidLoad] Error recuperando usuario.")
        });
        events.subscribe("fechasAbsolutas:status", (valor) => {
            console.log('[HOME.constructor] Cambiado valor fechas absolutas');
            this.mostrarFechasAbsolutas = valor;
        });                                  
    }
  
    ngOnDestroy(){
        clearInterval(this.timer);
    }


  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatPage');
    this._configuracion.getFechasAbsolutas()
        .then((dato)=>this.mostrarFechasAbsolutas = dato)
        .catch((error) => console.log("[HOME.ionViewDidLoad] Error descargando usuario:" + error));

    this.episodiosService.dameChatEpisodio(this.episodio).subscribe(
    data => {
        this.items=data.response.items;
        console.log("[CHAT.ionViewDidLoad]: chat recibido");
    },
    err => {
        console.log("[CHAT.ionViewDidLoad] Error recuperando chat: " + err)
    })

    this._configuracion.dameUsuario()
    .then ((dataUsuario) => {
        if (dataUsuario != null){
            console.log ("[CHAT.ionViewDidLoad] recibido usuario " + dataUsuario );
            this.usuario_id = dataUsuario;
            this._configuracion.dameToken()
            .then ((dataToken) => {
                console.log ("[CHAT.ionViewDidLoad] recibido token " + dataToken );
                this.token_id = dataToken;
            })
            .catch ((error) => {
                console.log("[CHAT.ionViewDidLoad] Error descargando token:" + error);
                this.msgDescarga ("Error extrayendo token de Spreaker.");
                this.token_id = "";
            });
        }
        else {
            this.msgDescarga ("No podrá enviar mensajes por no estar conectado a Spreaker.");
            this.usuario_id = "";
        }
    })
    .catch (() => {
        this.msgDescarga ("Error extrayendo usuario de Spreaker.");
    });

    this.timer = setInterval(() =>{
        console.log("[CHAT.dameComentarios] Actualizando Chat " + this.items.length + "  " + this.items);
        this.episodiosService.dameChatEpisodio(this.episodio).subscribe(
            data => {
                if (this.items.length == 0){
                    this.items=data.response.items;
                }
                else {
                    let longArray = data.response.items.length;
                    if (longArray > 0) {
                        let i:number=0;
                        //console.log("[CHAT] LA nueva remesa de mensajes tiene de longitud " + longArray  ); 
                        while (data.response.items[i].message_id != this.items[0].message_id && (i+1) < longArray) {
                            i++;
                            console.log("[CHAT.dameComentarios] " + i );   
                        }
                        this.items = data.response.items.slice(0,i).concat(this.items);
    //                    console.log("[CHAT.dameComentarios] Se han encontrado " + i + " nuevos mensajes");
                    }
                    else {
                        this.items = []; // Ya, ya sé que es la segunda vez que pongo esto... :-(
                    }
                }
            },
            err => {
                //Dialogs.alert('Error actualizando chat', 'Oh oh...');
                console.log ("[CHAT.dameComentarios] Error actualizando chat: " + err)
            }
        );       
    }, 200);
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
        let cadena = this.mensajeTxt.replace("#","%23");
        console.log ("[CHAT.enviarComentario] Solicitado envío " + cadena );

        if ( this.usuario_id != "" && this.token_id != "" && cadena != null) {
            this.episodiosService.enviaComentarios(this.episodio, this.usuario_id, this.token_id,  cadena).subscribe(
                data => {
                    console.log("[[CHAT.enviarComentario] Mensaje enviado" /* + JSON.stringify(data)*/);
                    this.mensajeTxt = null;
                },
                err => {
                    console.log("[[CHAT.enviarComentario] Error enviando mensaje:" + err);
                    this.msgDescarga ("Se ha producido un error al tratar de enviar el mensaje.");
                }
            );
        }
    }

    twittearComentario(){
        console.log ("[CHAT.twittearComentario] Solicitado envío");
        if (this.mensajeTxt != null){
            this.socialsharing.shareViaTwitter(this.hashtag + " " + this.mensajeTxt)
            .then((respuesta) => {
                console.log ("[CHAT.twittearComentario] Twitteo OK: " + respuesta);
                this.mensajeTxt = null;
            })
            .catch((error) => {
                console.log ("[CHAT.twittearComentario] Twitteo KO: " + error);
            });
        }
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
/*                this._configuracion.dameUsuario()
                .then ((dataUsuario) => {
                    if (dataUsuario != null){
                        this._configuracion.dameToken()
                        .then ((dataToken) => {*/
                            this.episodiosService.borraComentarios(this.episodio, this.usuario_id, this.token_id, item.message_id).subscribe(
                            data =>{
                                console.log("[CHAT.borraComentario] Comentario " + item.message_id + " borrado");
                                this.borraItemComentario(item);
                            }, 
                            err =>{
                                console.log("[CHAT.borraComentario] Error borrando comentario " + item.message_id);
                            })
/*                        })
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
                });*/
            }
        })
        .catch (() => {
            console.log("[descarga.components.descargarFichero] Rechazada opción de borrado.")
        })
    }

    borraItemComentario(item){
        if (this.items.length == 1){
            this.items = []; //si borramos el único comentario que hay puede dar problemas.
        }
        else {
            this.items.splice(this.items.indexOf(item) ,1);
        }
    }

    muestraTeclado(){
        this.keyboard.show();
    }

    ocultaTeclado(){
        this.keyboard.hide(); 
    }

    muestraDatosUsuario(user_id){
        console.log("[CHAT.muestraDatosUser] Usuario " + user_id);
        this.navCtrl.push(InfoUsuChatPage, {usuario: user_id});
    }
}

