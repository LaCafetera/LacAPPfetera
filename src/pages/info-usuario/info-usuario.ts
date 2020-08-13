import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, Events, IonicPage } from 'ionic-angular';
//import { FormBuilder } from '@angular/forms';

import { EpisodiosService } from '../../providers/episodios-service';
import { ConfiguracionService } from '../../providers/configuracion.service';

/**
 * Generated class for the InfoUsuarioPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-info-usuario',
  templateUrl: 'info-usuario.html',
  providers: [EpisodiosService, ConfiguracionService]
})
export class InfoUsuarioPage {

//  private formulario: FormGroup;
    datosUsu:Array<any>;

    imgItem: string = "assets/icon/icon.png";
    nombreUsu: string = "";
    descripcion: string = "";
    emilio: string = "";
    dirWeb: string = "";
    dirFacebook: string = "";
    usuTwitter: string = "";

    dataUsuario: string = ''; //7985950';
    dataToken: string = '';   // 35d6ea9f4b968e0af47560bda9d95ff417e30df6';

    detallesLink : string = ""; 

    constructor(public navCtrl: NavController, 
                public navParams: NavParams, 
    //            private formBuilder: FormBuilder,
                private episodiosService: EpisodiosService, 
                private _configuracion: ConfiguracionService, 
                public toastCtrl: ToastController, 
                public events: Events) {    
        //this.datosUsu = this.navParams.get('datos');
    /*  this.formulario = this.formBuilder.group({
        nombreCompleto: ['']
        });*/

        //Como no hay manera de hacer que me lleguen los parámetros, he dejado la conexión en el componente app.components.ts Comento esto.
        //this.detallesLink = navParams.get('detalles');
        //console.log('[INFO-USUARIO.constructor] Los parámetros que hemos recibido (o no) son:' + JSON.stringify(navParams.get('detalles')));
        //console.log('[INFO-USUARIO.constructor] Los parámetros que hemos recibido (o no) son:' + this.detallesLink);
        //if (this.detallesLink != "" && this.detallesLink != null){
        //    this.procesaDatosConexion();
        //}
        events.subscribe("conexion:status", () => this.actualizaDatosUsuario());
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad InfoUsuarioPage');
        this.actualizaDatosUsuario();

    }

    actualizaDatosUsuario(){
        this._configuracion.dameUsuario()
        .then ((Usuario) => {
            if (Usuario != null){
                console.log ("[INFO-USUARIO.actualizaDatosUsuario] recibido usuario " + Usuario );
                this.dataUsuario = Usuario;
                this._configuracion.dameToken()
                .then ((Token) => {
                    console.log ("[INFO-USUARIO.actualizaDatosUsuario] recibido token " + Token );
                    if (Token != null) {
                        console.log("[INFO-USUARIO.actualizaDatosUsuario] solicitado envío para usuario " + Usuario);
                        this.dataToken = Token;
                        this.cargaDatosUsu();
                    }
                    else {
                        console.log ("[INFO-USUARIO.actualizaDatosUsuario] Debe estar conectado a Spreaker para poder realizar esa acción.");
                    }
                })
                .catch ((error) => {
                    console.log ("[INFO-USUARIO.actualizaDatosUsuario] Error extrayendo usuario de Spreaker:" + error);
                });
            }
            else {
                console.log ("[INFO-USUARIO.actualizaDatosUsuario] El usuario no está loggeado en Spreaker.");
                this.dataUsuario = '';
                this.msgDescarga ("No estás conectado a Spreaker. Para ver tus datos, haz login a través de la opción del menú principal")
            }
        })
        .catch (() => {
            console.log ("[INFO-USUARIO.actualizaDatosUsuario] Debe estar conectado a Spreaker para poder realizar esa acción.");
        });
    }


    procesaDatosConexion(){
        let responseParameters;
        let parsedResponse = {};
        console.log ("[INFO-USUARIO.procesaDatosConexion] ");

        responseParameters = (this.detallesLink).split("&");
        for (let i = 0; i < responseParameters.length; i++) {
            parsedResponse[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
        }
        if (parsedResponse["code"] !== undefined && parsedResponse["code"] !== null) { //conexión vía spreaker
            this.episodiosService.solicitaTokenViaCode(parsedResponse["code"]).subscribe(
                data => {
                    //this.msgDescarga  (JSON.stringify(data));
                    console.log("[INFO-USUARIO.procesaDatosConexion] Descargados datos de conexión: " + JSON.stringify(data));
                    console.log("[INFO-USUARIO.procesaDatosConexion] Recibido token: " + data["access_token"]);
                    this._configuracion.setTokenSpreaker(data["access_token"]);
                    this.actualizaDatosUsuario();
                },
                err => {
                    console.error("[INFO-USUARIO.procesaDatosConexion] Error solicitando datos de usuario " + err.message);
                }
            );
        } 

    }

// 7985950 - 35d6ea9f4b968e0af47560bda9d95ff417e30df6
// {"user_id":7985950,"fullname":"José Carlos","site_url":"https://www.spreaker.com/user/7985950","image_url":"https://d1bm3dmew779uf.cloudfront.net/large/83bcbf78c22246180ea746a6393a7ae8.jpg","image_original_url":"https://d3wo5wojvuv7l.cloudfront.net/images.spreaker.com/original/83bcbf78c22246180ea746a6393a7ae8.jpg","username":null,"description":null,"kind":"listener","plan":"basic","email":"josecarlos.santosruiz@gmail.com","verified":true,"plan_ends_at":null,"gender":"MALE","birthday":null,"occupation":null,"timezone":"Europe/Paris","user_timezone":null,"detected_timezone":"Europe/Paris","followers_count":0,"followings_count":1,"contact_email":null,"website_url":null,"facebook_permalink":null,"twitter_username":"a930334","features":{"audio_storage_used":0,"audio_storage_limit":18000000,"broadcast_time_limit":900000,"broadcast_nonstop_enabled":false,"show_cover_enabled":false,"show_preroll_enabled":false,"dev_tools_enabled":true,"rss_customization_enabled":false,"stats_export_csv_enabled":false,"stats_export_csv_required_plan":"broadcaster","stats_plays_enabled":true,"stats_plays_required_plan":"basic","stats_likes_enabled":false,"stats_likes_required_plan":"broadcaster","stats_sources_enabled":false,"stats_sources_required_plan":"broadcaster","stats_geographic_enabled":false,"stats_geographic_required_plan":"broadcaster","stats_demographic_enabled":false,"stats_demographic_required_plan":"anchorman","stats_devices_enabled":false,"stats_devices_required_plan":"anchorman","stats_os_enabled":false,"stats_os_required_plan":"anchorman"},"epidemicsound":{"enabled":false,"yt_channels":[]},"fb_connected":true,"fb_user_id":"100006866584865","fb_permissions":["email","user_friends"],"fb_auth_token_expires_at":"2017-07-10 18:15:06","tw_connected":false,"tw_user_id":null,"tw_username":null,"yt_connected":false,"yt_user_id":null,"sc_connected":false,"sc_user_id":null,"tb_connected":false,"tb_blog_name":null}
    cargaDatosUsu(){
        this.episodiosService.whoAMi(this.dataToken).subscribe(
            data => {
              //  console.log ("[INFO-USUARIO.actualizarDatosUsu] recibidos datos " + JSON.stringify(data) );
                this.datosUsu = data.response.user;
                this.imgItem = this.datosUsu["image_original_url"];
                this.nombreUsu = this.datosUsu["fullname"];
                this.descripcion = this.datosUsu["description"];
                this.emilio = this.datosUsu["email"];

                this.dirWeb = this.datosUsu["website_url"];
                this.dirFacebook = this.datosUsu["facebook_permalink"];
                this.usuTwitter = this.datosUsu["twitter_username"];
                
            },
            err => {
                console.log("[INFO-USUARIO.cargaDatosUsu] Error descargando datos de usuario: " + err.message);
            }
        );        
    }


    actualizarDatosUsu(){
        let camposCabiar: Array<any> = new Array;
        if ( this.imgItem != "assets/icon/icon.png"){
            if (this.nombreUsu == "")
            {
                this.msgDescarga ("Lo siento. El nombre de usuario no puede estar vacío.");
                this.nombreUsu = this.datosUsu["fullname"];
            }
            else {
                if (this.nombreUsu != this.datosUsu["fullname"]) {
                    camposCabiar.push ({"nombre":"fullname","valor":this.nombreUsu});
                };

                if (this.descripcion != this.datosUsu["description"]) {
                    camposCabiar.push ({"nombre":"description","valor":this.descripcion});
                };

                if (this.emilio != this.datosUsu["email"]) {
                    camposCabiar.push ({"nombre":"email","valor":this.emilio});
                };

                if (this.dirWeb != this.datosUsu["website_url"]) {
                    camposCabiar.push ({"nombre":"website_url","valor":this.dirWeb});
                };

                if (this.dirFacebook != this.datosUsu["facebook_permalink"]) {
                    camposCabiar.push ({"nombre":"facebook_permalink","valor":this.dirFacebook});
                };

                if (this.usuTwitter != this.datosUsu["twitter_username"]) {
                    camposCabiar.push ({"nombre":"twitter_username","valor":this.usuTwitter});
                };

                this.episodiosService.actualizaDatosUsuario(this.dataUsuario, this.dataToken, camposCabiar).subscribe(
                    data => {
                        console.log("[INFO-USUARIO.actualizarDatosUsu] Mensaje enviado" + JSON.stringify(data));
                        this.msgDescarga ("Datos actualizados.");
                    },
                    err => {
                        console.log("[INFO-USUARIO.actualizarDatosUsu] Error enviando mensaje:" + err);
                    }
                );
            }
        }  
        else {
            this.msgDescarga ("Para actualizar sus datos de Spreaker primero debe loguearse.");
            this.nombreUsu = "";
            this.descripcion = "";
            this.emilio = "";
            this.dirWeb = "";
            this.dirFacebook = "";
            this.usuTwitter = "";
        }
    }

    msgDescarga  (mensaje: string) {
        let toast = this.toastCtrl.create({
            message: mensaje,
            duration: 7000,
            cssClass: 'msgDescarga'
        });
        toast.present();
    }

}
