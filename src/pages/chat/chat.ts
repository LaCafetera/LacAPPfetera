import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ToastController, Events, Content } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';
import { EpisodiosService } from '../../providers/episodios-service';
import { ConfiguracionService } from '../../providers/configuracion.service';
import { Dialogs } from '@ionic-native/dialogs';
import { Keyboard } from '@ionic-native/keyboard';
import { InfoUsuChatPage } from "../info-usu-chat/info-usu-chat";
import anchorme from "anchorme";

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
    items: Array<any> = [];
    timer:number = 0;
    mensajeTxt:string = "";
    usuario_id:string = "";
    token_id:string = "";
    mostrarFechasAbsolutas : boolean = false;
    iconoEnvioTotal: string = "fas fa-unlink";

    @ViewChild(Content) content: Content;
    bajar: boolean = false;
    desactivado: boolean = true;
    textoTroceado: Array<Object>;

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                private episodiosService: EpisodiosService,
                private socialsharing: SocialSharing,
                private _configuracion: ConfiguracionService,
                private toastCtrl: ToastController,
                private dialogs: Dialogs,
                private keyboard: Keyboard,
                public events: Events) {
        this.episodio = this.navParams.get('episodioMsg');
        this.hashtag = this.navParams.get('hashtag');
        console.log("[CHAT]: Hashtag recibido: "+ this.hashtag);
        /*this._configuracion.dameUsuario()
        .then ((dataUsuario) => {
            this.usuario_id = dataUsuario;
        })
        .catch (() => {
            console.log("[CHAT.ionViewDidLoad] Error recuperando usuario.")
        });*/
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

    /*this.episodiosService.dameChatEpisodio(this.episodio).subscribe(
    data => {
        this.items=data.response.items;
        console.log("[CHAT.ionViewDidLoad]: chat recibido");
    },
    err => {
        console.log("[CHAT.ionViewDidLoad] Error recuperando chat: " + err)
    })*/

    this._configuracion.dameUsuario()
    .then ((dataUsuario) => {
        if (dataUsuario != null){
            console.log ("[CHAT.ionViewDidLoad] recibido usuario " + dataUsuario );
            this.usuario_id = dataUsuario;
            this._configuracion.dameToken()
            .then ((dataToken) => {
                console.log ("[CHAT.ionViewDidLoad] recibido token " + dataToken );
                this.token_id = dataToken;
                this.desactivado = false;
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
    //this.vigilaMensajesAsc();
    this.vigilaMensajesDesc();
  }
  
  vigilaMensajesAsc (){
    this.timer = setInterval(() =>{
        //console.log("[CHAT.dameComentarios] Actualizando Chat");
        this.episodiosService.dameChatEpisodio(this.episodio).subscribe(
            data => {
                if (this.items == []){
                    this.items=data.response.items;
                }
                else {
                    let longArray = data.response.items.length;
                    let i:number=0;
                    //console.log("[CHAT] LA nueva remesa de mensajes tiene de longitud " + longArray  );
                    while (data.response.items[i].message_id != this.items[0].message_id && (i+1) < longArray) {
                        i++;
                        //console.log("[CHAT.dameComentarios] " + i );
                    }
                    this.items = data.response.items.slice(0,i).concat(this.items);
                }
            },
            err => {
                console.error ("[CHAT.dameComentarios] Error actualizando chat: " + err)
            }
        );
    }, 1000);
}

  vigilaMensajesDesc (){
    this.timer = setInterval(() =>{
        //console.log("[CHAT.vigilaMensajesDesc] Actualizando Chat");
        this.episodiosService.dameChatEpisodio(this.episodio).subscribe(
            data => {
                if (this.items.length == 0){
                    data.response.items.forEach(element => {
                        //console.log("[CHAT.vigilaMensajesDesc] iniciando con " + element.message_id);
                        //this.textoTroceado = this.cadenaTwitter.troceaCadena(element.text);
                        element.text = anchorme(element.text);
                        //element.textoTroceado= this.cadenaTwitter.troceaCadena(element.text);
                        this.items.unshift(element);
                        this.bajar = true;
                    });
                }
                else {
                    let longArray = data.response.items.length;
                    let i:number=0;
                    //console.log("[CHAT.vigilaMensajesDesc] último: " + this.items[this.items.length - 1].message_id );
                    while (data.response.items[i].message_id != this.items[this.items.length - 1].message_id && (i+1) < longArray) {
                        i++;
                        //console.log("[CHAT.vigilaMensajesDesc] " + i );
                    }
                    data.response.items.splice(i, data.response.items.length - i );
                    data.response.items.forEach(element => {
                        element.text = anchorme(element.text);
                        this.items = this.items.concat(element);
                        this.bajar = true;
                    });
                }
            },
            err => {
                console.error ("[CHAT.vigilaMensajesDesc] Error actualizando chat: " + err)
            }
        );
        if (this.bajar) {
            this.content.scrollToBottom();
            this.bajar = false;
        }
    }, 1000);
  }

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
            if (this.iconoEnvioTotal == 'fas fa-link') {
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
        if (!this.desactivado) { //( this.usuario_id != "" && this.token_id != "") {
            this.episodiosService.enviaComentarios(this.episodio, this.usuario_id, this.token_id,  texto).subscribe(
                data => {
                    console.log("[CHAT.enviarComensprikearComentariotario] Mensaje enviado");
                },
                err => {
                    console.error("[CHAT.sprikearComentario] Error enviando mensaje:" + err);
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
            console.error ("[CHAT.twittearComentario] Twitteo KO: " + error);
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
                    console.error("[CHAT.borraComentario] Error borrando comentario " + item.message_id);
                })
            }
        })
        .catch (() => {
            console.error("[descarga.components.descargarFichero] Rechazada opción de borrado.")
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
        if (!this.desactivado) {
            if (this.iconoEnvioTotal == 'fas fa-link') {
                this.iconoEnvioTotal = 'fas fa-unlink';
                this.msgDescarga('Enviando a Spreaker y a Twitter por separado.')
            }
            else {
                this.iconoEnvioTotal = 'fas fa-link';
                this.msgDescarga('Enviando a los canales simultáneamente.')
            }
        }
    }

    activaDesactiva(){
        console.log("[CHAT.activaDesactiva] activaDesactiva ");
        this.desactivado = !(this.mensajeTxt.length != 0 && this.token_id != "");
    }

    
}
