import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ToastController, Events, Content, PopoverController } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';
import { EpisodiosService } from '../../providers/episodios-service';
import { ConfiguracionService } from '../../providers/configuracion.service';
import { Dialogs } from '@ionic-native/dialogs';
import { Keyboard } from '@ionic-native/keyboard';
import { InfoUsuChatPage } from "../info-usu-chat/info-usu-chat";
import anchorme from "anchorme";
import emojis from "emojis";
import { MenuExtChatComponent } from '../../components/menuext_chat/menuext_chat';

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

    ordenChatAsc: boolean = true;

    @ViewChild(Content) content: Content;
    bajar: boolean = false;
    desactivado: boolean = true;
    textoTroceado: Array<Object>;

    descargandoMasMensajes: boolean = false;

    acaboDeEntrar: boolean = true; // Esto es porque si no lo pongo nada más entrar en la pantalla saca más registros.
    posicion:string = 'top'

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                private episodiosService: EpisodiosService,
                private socialsharing: SocialSharing,
                private _configuracion: ConfiguracionService,
                private toastCtrl: ToastController,
                private dialogs: Dialogs,
                private keyboard: Keyboard,
                public events: Events,
                public popoverCtrl: PopoverController) {
        this.episodio = this.navParams.get('episodioMsg');
        this.hashtag = this.navParams.get('hashtag');
        console.log("[CHAT]: Hashtag recibido: "+ this.hashtag);
    }

    ngOnDestroy(){
        clearInterval(this.timer);
        this.timer = 0;
    }


  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatPage');
    this._configuracion.getFechasAbsolutas()
        .then((dato)=>this.mostrarFechasAbsolutas = dato)
        .catch((error) => console.log("[HOME.ionViewDidLoad] Error descargando usuario:" + error));

    this.events.subscribe("fechasAbsolutas:status", (valor) => {
        console.log('[HOME.constructor] Cambiado valor fechas absolutas');
        this.mostrarFechasAbsolutas = valor;
    });
    
    this.events.subscribe("menuChat:orden", (ordenado) => {
        console.log('[CAPITULOS-DESCARGADOS.constructor] Recibido mensaje de cambiar el orden. (' + ordenado.valor + ')');
        clearInterval(this.timer);
        this.timer = 0;
        this.items = [];
        if (ordenado.valor) {
            this.acaboDeEntrar = false;
            this.posicion = 'top';
            this.vigilaMensajesAsc();
        }
        else {
            this.acaboDeEntrar = true;
            this.posicion = 'bottom';
            this.vigilaMensajesDesc();
        }
        this._configuracion.guardaValor("ordenChatAsc", ordenado.valor);
    });

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

    this._configuracion.dameValor("ordenChatAsc")
    .then ((dato) => {
        if (dato != null) {
            this.ordenChatAsc = dato;
        }
        if (this.ordenChatAsc) {
            this.vigilaMensajesAsc();
            this.posicion = 'top';
        }
        else {
            this.vigilaMensajesDesc();
            this.posicion = 'bottom';
        }
    })
    .catch (() => {
        this.msgDescarga ("Error extrayendo orden para mostrar el chat.");
        this.vigilaMensajesAsc();
        this.posicion = 'top';
    });
  }
  
  vigilaMensajesAsc (){
    this.ordenChatAsc = true;
    console.log("[CHAT.dameComentarios] ordenChatAsc a FALSE");
    this.timer = setInterval(() =>{
        //console.log("[CHAT.dameComentarios] Actualizando Chat");
        this.episodiosService.dameChatEpisodio(this.episodio).subscribe(
            data => {
                if (this.items.length == 0){
                    data.response.items.forEach(element => {
                        element.text = anchorme(emojis.html(element.text, 'assets/images/emoticonos/'));
                    });
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
                    data.response.items.slice(0,i).forEach(element => {
                        element.text = anchorme(emojis.html(element.text, 'assets/images/emoticonos/'));
                    });
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
    this.ordenChatAsc = false;
    console.log("[CHAT.dameComentarios] ordenChatAsc a false");
    this.timer = setInterval(() =>{
        //console.log("[CHAT.vigilaMensajesDesc] Actualizando Chat");
        this.episodiosService.dameChatEpisodio(this.episodio).subscribe(
            data => {
                if (this.items.length == 0){
                    data.response.items.forEach(element => {
                        //console.log("[CHAT.vigilaMensajesDesc] iniciando con " + element.message_id);
                        element.text = anchorme(emojis.html(element.text, 'assets/images/emoticonos/'));
                        this.items.splice(0, 0, element);
                        this.bajar = true;
                    });
                }
                else {
                    let longArray = data.response.items.length;
                    let i:number=0;
                    let itemsTmp: Array<any> = [];
                    //console.log("[CHAT.vigilaMensajesDesc] último: " + this.items[this.items.length - 1].message_id );
                    //while (data.response.items[i].message_id != this.items[this.items.length - 1].message_id && (i+1) < longArray) {
                    while (data.response.items[i].message_id != this.items[this.items.length - 1].message_id && (i+1) < longArray) {
                        console.log("[CHAT.vigilaMensajesDesc] " + data.response.items[i].message_id + " - " + this.items[this.items.length - 1].message_id + " - " + i );
                        i++;
                    }
                    console.log("[CHAT.vigilaMensajesDesc] Encontrados " + i + " mensajes nuevos ");
                    data.response.items.splice(i, data.response.items.length - i );
                    data.response.items.forEach(element => {
                        element.text = anchorme(emojis.html(element.text, 'assets/images/emoticonos/'));
                        //this.items.splice(0, 0, element);
                        itemsTmp.splice(0, 0, element);
                        this.bajar = true;
                    });
                    if (itemsTmp.length != 0){
                        this.items = this.items.concat(itemsTmp)
                    }
                    //console.log("[CHAT.vigilaMensajesDesc] " + JSON.stringify(this.items));
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

    quieroMas(event, ascendiendo){
        if (!this.acaboDeEntrar && ascendiendo === this.ordenChatAsc){
            console.log ("[CHAT.quieroMas] Solicitados más mensajes. DescargandoMasMensajes " + this.descargandoMasMensajes);
            let ultimoMensaje: string = '';
            if (!this.descargandoMasMensajes){
                this.descargandoMasMensajes = true;
                if (this.ordenChatAsc){
                    ultimoMensaje = this.items[this.items.length-1].message_id;
                }
                else {
                    ultimoMensaje = this.items[0].message_id;
                }
                this.episodiosService.dameMasComentarios(this.episodio, ultimoMensaje).subscribe(
                data => {
                    if (this.ordenChatAsc) {
                        data.response.items.forEach(element => {
                            element.text = anchorme(emojis.html(element.text, 'assets/images/emoticonos/'));
                        });
                        this.items=this.items.concat(data.response.items);
                        console.log ("[CHAT.quieroMas] Dejamos la cantidad de mensajes en " + this.items.length );
                    }
                    else {
                        let itemsTmp: Array<any> = [];
                        data.response.items.forEach(element => {
                            element.text = anchorme(emojis.html(element.text, 'assets/images/emoticonos/'));
                            itemsTmp.splice(0, 0, element);
                            //this.items.push(element);
                        });
                        this.items = itemsTmp.concat(this.items);
                        this.content.scrollToBottom();
                        console.log ("[CHAT.quieroMas] Dejamos la cantidad de mensajes en " + this.items.length );
                    }
                    //console.log("[HOME] Recibidos "+data.response.items.length+" nuevos elementos. Ahora la lista tiene "+ this.items.length + " elementos");
                    event.complete();
                    this.descargandoMasMensajes = false;
                },
                err => {
                    event.complete();
                    console.log(err);
                    this.descargandoMasMensajes = false;
                });
            }
            else {
                event.complete();
            }

        }
        else{
            this.acaboDeEntrar = false;
            event.complete();
        }
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
    
    muestraMenu(myEvent) {
        let datosObjeto = {ordenado: this.ordenChatAsc}
        let popover = this.popoverCtrl.create(MenuExtChatComponent, datosObjeto );
        popover.present({
            ev: myEvent
        });
    }

// Quitar scroll
// https://github.com/ionic-team/ionic/issues/7644    
}
