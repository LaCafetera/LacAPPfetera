import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

import { EpisodiosService } from '../../providers/episodios-service';
import { ConfiguracionService } from '../../providers/configuracion.service';

/**
 * Generated class for the InfoUsuarioPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-info-usuario',
  templateUrl: 'info-usuario.html',
  providers: [EpisodiosService, ConfiguracionService]
})
export class InfoUsuarioPage {

//  private formulario: FormGroup;
  datosUsu:Array<any>;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams, 
              private formBuilder: FormBuilder,
              private episodiosService: EpisodiosService, 
              private _configuracion: ConfiguracionService ) {    
    this.datosUsu = this.navParams.get('datos');
  /*  this.formulario = this.formBuilder.group({
      nombreCompleto: ['']
    });*/
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad InfoUsuarioPage');
  }

  actualizarDatosUsu(formulario){
    console.log ("[INFO-USUARIO.actualizarDatosUsu] recibido usuario " + formulario.value.nombreCompleto );
    /*if (formulario.value.nombre != this.datosUsu["nombreCompleto"]){
        this._configuracion.dameUsuario()
        .then ((dataUsuario) => {
            if (dataUsuario != null){
                console.log ("[INFO-USUARIO.actualizarDatosUsu] recibido usuario " + dataUsuario );
                this._configuracion.dameToken()
                .then ((dataToken) => {
                    console.log ("[INFO-USUARIO.actualizarDatosUsu] recibido token " + dataToken );
                    if (dataToken != null) {
                        console.log("[INFO-USUARIO.actualizarDatosUsu] solicitado envío para usuario " + dataUsuario);
                        this.episodiosService.actualizaDatosUsuario(dataUsuario, dataToken,  [{"nombre": formulario.value.nombreCompleto}]).subscribe(
                            data => {
                                console.log("[INFO-USUARIO.actualizarDatosUsu] Mensaje enviado" + JSON.stringify(data));
                            },
                            err => {
                                console.log("[INFO-USUARIO.actualizarDatosUsu] Error enviando mensaje:" + err);
                            }
                        );
                    }
                    else {
                        console.log ("[INFO-USUARIO.actualizarDatosUsu] Debe estar conectado a Spreaker para poder realizar esa acción.");
                    }
                })
                .catch ((error) => {
                    console.log ("[INFO-USUARIO.actualizarDatosUsu] Error extrayendo usuario de Spreaker:" + error);
                });
            }
            else {
                console.log ("[INFO-USUARIO.actualizarDatosUsu] Error extrayendo usuario de Spreaker.");
            }
        })
        .catch (() => {
            console.log ("[INFO-USUARIO.actualizarDatosUsu] Debe estar conectado a Spreaker para poder realizar esa acción.");
        });
    }
    */
  }


}
