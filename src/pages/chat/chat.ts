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
    iconoEnvioTotal: string = "unlock";

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
//                    console.log("[CHAT.dameComentarios] Se han encontrado " + i + " nuevos mensajes");
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

    enviarComentario(mensaje: any, donde:string){
        if (this.mensajeTxt != null){
            if (this.iconoEnvioTotal == 'lock') {
                console.log ("[CHAT.enviarComentario] Mandar texto a todas partes" );
                this.sprikearComentario(this.mensajeTxt);
                this.twittearComentario(this.mensajeTxt);
            }
            else {
                    console.log ("[CHAT.enviarComentario] Mandar texto a " + donde );
                if (donde == 'spreaker'){
                    this.sprikearComentario(this.mensajeTxt);
                }
                else {
                    this.twittearComentario(this.mensajeTxt);
                }
            }
            this.mensajeTxt = null;
        }
    }

    sprikearComentario(texto: string){
        if ( this.usuario_id != "" && this.token_id != "") {
            this.episodiosService.enviaComentarios(this.episodio, this.usuario_id, this.token_id,  texto).subscribe(
                data => {
                    console.log("[CHAT.enviarComensprikearComentariotario] Mensaje enviado");
                },
                err => {
                    console.log("[CHAT.sprikearComentario] Error enviando mensaje:" + err);
                    this.msgDescarga ("Se ha producido un error al tratar de enviar el mensaje.");
                }
            );
        }
    }

    twittearComentario(texto: string){
        this.socialsharing.shareViaTwitter(this.hashtag + " " + texto)
        .then((respuesta) => {
            console.log ("[CHAT.twittearComentario] Twitteo OK: " + respuesta);
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
                this.episodiosService.borraComentarios(this.episodio, this.usuario_id, this.token_id, item.message_id).subscribe(
                data =>{
                    console.log("[CHAT.borraComentario] Comentario " + item.message_id + " borrado");
                    this.borraItemComentario(item);
                }, 
                err =>{
                    console.log("[CHAT.borraComentario] Error borrando comentario " + item.message_id);
                })
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
        this.keyboard.hide(); 
    }

    muestraDatosUsuario(user_id){
        console.log("[CHAT.muestraDatosUser] Usuario " + user_id);
        this.navCtrl.push(InfoUsuChatPage, {usuario: user_id});
    }

    cambiaEnviaDos(){
        if (this.iconoEnvioTotal == 'lock') {
            this.iconoEnvioTotal = 'unlock';
            this.msgDescarga('Enviando a Spreaker y a Twitter indistintamente.')
        }
        else {
            this.iconoEnvioTotal = 'lock';
            this.msgDescarga('Enviando a los canales por separado.')
        }
    }

}

