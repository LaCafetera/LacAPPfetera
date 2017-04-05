import {Component, Input, Output, EventEmitter } from '@angular/core';
import { File, Transfer, Dialogs, Network } from 'ionic-native';
import { Events, ToastController } from 'ionic-angular';

import { ConfiguracionService } from '../providers/configuracion.service';

declare var cordova: any;

@Component({
    selector: 'descargaCafetera',
    template: ` <button ion-button clear large (click)="descargarFichero()">
                    <ion-icon icon-left name={{icono}}>
                        <div *ngIf="this.porcentajeDescargado != 0">
                            <h3>{{this.porcentajeDescargado}}%</h3>
                        </div>
                    </ion-icon>
                </button>`,
    providers: [File, Transfer, ConfiguracionService]
})

export class DescargaCafetera {

    @Input() fileDownload: string;
//@Input() fileExists: string;
   /* @Output() porcentajeDescarga = new EventEmitter();*/
    @Output() ficheroDescargado = new EventEmitter();


    fileTransfer = new Transfer();
    descargando:boolean = false;
    icono: string;

    UBICACIONHTTP: string = "https://api.spreaker.com/download/episode/";
    DIRDESTINO:string = cordova.file.dataDirectory;


    /***** Esto lo podrás borrar cuando ya controles esta parte ****************/
    //tamanyo:number;
    //descargado:number;
    porcentajeDescargado:number = 0;
    porcentajeAnterior:number = 0;
    /***** Hasta aquí ****************/

    constructor(public events: Events, public toastCtrl: ToastController, private _configuracion: ConfiguracionService) {};

    ngOnInit(){
       // this.porcentajeDescarga.emit({porcentaje: 0});
        if (this.fileDownload != null){
            File.checkFile(this.DIRDESTINO, this.fileDownload /*+ '.mp3'*/).then(()=>{
                console.log("[DescargaCafetera] El fichero " + this.fileDownload + ' existe.');
                this.icono = 'trash';
                this.ficheroDescargado.emit({existe: true});
            }, (err) => {
                this.icono = 'cloud-download';
                this.ficheroDescargado.emit({existe: false});
            });
        }
        else{
            this.icono = 'lock';
            this.ficheroDescargado.emit({existe: false});
        }
    }

    msgDescarga  (mensaje: string) {
        let toast = this.toastCtrl.create({
            message: mensaje,
            duration: 3000
        });
        toast.present();
    }

    descargarFichero(evento){
        let audio_en_desc : string  = "https://api.spreaker.com/v2/episodes/"+this.fileDownload+"/download";
      /////  let audio_en_desc : string  = "https://api.spreaker.com/download/episode/"+this.fileDownload+".mp3";
        //let uri : string = encodeURI(audio_en_desc);
        let fileURL:string = this.DIRDESTINO + this.fileDownload /* + ".mp3" */;
        console.log ("[Descarga.components.descargarFichero] Descargando vale " + this.descargando + " e icono vale " + this.icono);
        if (this.icono == 'cloud-download' || this.icono == 'ios-archive'){
            console.log ("[Descarga.components.descargarFichero] Solicitada descarga.");
            if (!this.descargando){
                this._configuracion.getWIFI()
                .then((val)=> {
                    console.log ("[Descarga.components.descargarFichero] La conexión es " + Network.type + " y la obligación de tener wifi es " + val);
                    if(Network.type === "wifi" || !val  ) {
                        console.log("[descarga.components.descargarFichero] Comenzando la descarga del fichero "+ this.fileDownload + " en la carpeta " + this.DIRDESTINO );
                        this.fileTransfer.download( encodeURI(audio_en_desc), encodeURI(fileURL), true, {}).then(() => {
                            console.log("[descarga.components.descargarFichero]  Descarga completa.");
                          //  this.porcentajeDescarga.emit({porcentaje: 0});
                            /*if (this.platform.is("ios")){
                            File.moveFile(this.DIRDESTINO, this.fileDownload,this.DIRDESTINO, this.fileDownload+".mp3" )
                            .then(()=>{
                                console.log ("[Descarga.components.descargarFichero] Fichero renombrado correctamente");
                            })
                            .catch((error) =>{
                                console.log ("[Descarga.components.descargarFichero] error renombrando fichero: " + error.code);
                            });*/
                            this.ficheroDescargado.emit({existe: true});
                            this.porcentajeDescargado = 0;
                            this.icono = 'trash';
                            this.msgDescarga('Descarga completa');
                            this.descargando = false;
                            //}
                        }, (error) => {
                            if (error.code != 4 /*FileTransferError.ABORT_ERR*/){
                                Dialogs.alert("Error en Descargarga. Código de error " + error.code, 'Error');
                                console.log("[descarga.components.descargarFichero] download error source " + error.source);
                                console.log("[descarga.components.descargarFichero] download error target " + error.target);
                                console.log("[descarga.components.descargarFichero] " + error.body);
                          //      this.porcentajeDescarga.emit({porcentaje: 0});
                            }
                            this.descargando = false;
                        });
                        this.descargando = true;
                    }
                    else {
                        this.msgDescarga ("Sólo tiene permitidas descargas con la conexión WIFI activada.");
                    }
                }).catch(()=>{
                    console.log("[descarga.components.descargarFichero] Error recuperando valor WIFI");
                });
                this.fileTransfer.onProgress((progress) => {
                    //this.tamanyo = progress.total;
                    //this.descargado = progress.loaded;
                    this.porcentajeDescargado = Math.round(((progress.loaded / progress.total) * 100));
                    //console.log("[DESCARGA.COMPONENT] Descargado " + (progress.loaded / progress.total) * 100 + "% - " +this.porcentajeDescargado + " - " + this.porcentajeAnterior);
                    if (this.porcentajeAnterior != this.porcentajeDescargado){
                        this.porcentajeAnterior = this.porcentajeDescargado;
                   //     this.porcentajeDescarga.emit({porcentaje: this.porcentajeDescargado});
                       // console.log("[DESCARGA.COMPONENT] porcentajeDescargado vale " + this.porcentajeDescargado);
                    }
                })
            }
            else{
                this.fileTransfer.abort(); //se genera un error "abort", así que es en la función de error donde pongo el false a descargando.
                this.msgDescarga ("Cancelando descarga");
          //      this.porcentajeDescarga.emit({porcentaje: 0});
                this.borrarDescarga(this.fileDownload /* + ".mp3"*/);
            }
        }
        else if (this.icono == 'trash') {
            console.log("[descarga.components.descargarFichero] Solicitado borrado.")
            if (confirm('El fichero ya ha sido descargado. \n ¿Desea borrarlo?')) {
                //reproductor.stop();
                console.log("[descarga.components.descargarFichero] Confirmado borrado.")
                this.borrarDescarga(this.fileDownload /*+ ".mp3"*/);
            //inicializaReproductor (episodio_id + ".mp3");
            } else {
                console.log("[descarga.components.descargarFichero] Rechazado borrado.")
                console.log("[descarga.components.descargarFichero] Rechazada opción de borrado.")
            }
        }
        else {
            this.msgDescarga("No se permite descargar una emisión en vivo.");
        }
    }

    borrarDescarga (fichero:string) {
        File.removeFile(this.DIRDESTINO, this.fileDownload /*+ '.mp3'*/).then(()=>{
            console.log("[DescargaCafetera] El fichero " + fichero + '.se ha eliminado.');
            this.icono = 'cloud-download';
            this.ficheroDescargado.emit({existe: false});
            this.msgDescarga('Programa borrado');
        }, (err) => {
            console.log("[DescargaCafetera] Error borrando fichero "+ this.DIRDESTINO + this.fileDownload + " . Error code: " + err.code + " message: " + err.message);
        });
    }
}


// Pensar en usar esto cuando la descarga termine:
// https://ionicframework.com/docs/v2/components/#toast
