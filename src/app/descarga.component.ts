import {Component, Input, Output, EventEmitter } from '@angular/core';
import { File } from '@ionic-native/file';
import { Dialogs } from '@ionic-native/dialogs';
import { Network } from '@ionic-native/network';
import { Transfer, TransferObject} from '@ionic-native/transfer';
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


    //fileTransfer = new Transfer();
    descargando:boolean = false;
    icono: string;

    UBICACIONHTTP: string = "https://api.spreaker.com/download/episode/";
    //DIRDESTINO:string = cordova.file.dataDirectory;
    dirdestino:string;



    /***** Esto lo podrás borrar cuando ya controles esta parte ****************/
    //tamanyo:number;
    //descargado:number;
    porcentajeDescargado:number = 0;
    porcentajeAnterior:number = 0;
    /***** Hasta aquí ****************/

    constructor(public events: Events, 
                public toastCtrl: ToastController, 
                private _configuracion: ConfiguracionService, 
                private file: File, 
                private network: Network, 
                private dialogs: Dialogs, 
                private transfer: Transfer ) {};

    ngOnInit(){
       // this.porcentajeDescarga.emit({porcentaje: 0});
       this.file.resolveLocalFilesystemUrl(cordova.file.dataDirectory)
            .then((entry)=>{this.dirdestino = entry.toInternalURL();
                    if (this.fileDownload != null){
                        this.file.checkFile(this.dirdestino, this.fileDownload + '.mp3').then(()=>{
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
            })
            .catch((error)=>{console.log("[Descarga.components.descargarFichero] Error recuperando carpeta de destino" + error)});
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
        const fileTransfer: TransferObject = this.transfer.create();
      /////  let audio_en_desc : string  = "https://api.spreaker.com/download/episode/"+this.fileDownload+".mp3";
        //let uri : string = encodeURI(audio_en_desc);
        let fileURL:string = this.dirdestino + this.fileDownload + ".mp3" ;
        console.log ("[Descarga.components.descargarFichero] Descargando vale " + this.descargando + " e icono vale " + this.icono);
        if (this.icono == 'cloud-download' || this.icono == 'ios-archive'){
            console.log ("[Descarga.components.descargarFichero] Solicitada descarga.");
            if (!this.descargando){
                this._configuracion.getWIFI()
                .then((val)=> {
                    console.log ("[Descarga.components.descargarFichero] La conexión es " + this.network.type + " y la obligación de tener wifi es " + val);
                    if(this.network.type === "wifi" || !val  ) {
                        console.log("[descarga.components.descargarFichero] Comenzando la descarga del fichero "+ this.fileDownload + " en la carpeta " + this.dirdestino );
                        fileTransfer.download( encodeURI(audio_en_desc), encodeURI(fileURL), true, {}).then(() => {
                            console.log("[descarga.components.descargarFichero]  Descarga completa.");
                            this.ficheroDescargado.emit({existe: true});
                            this.porcentajeDescargado = 0;
                            this.icono = 'trash';
                            this.msgDescarga('Descarga completa');
                            this.descargando = false;
                        }, (error) => {
                            if (error.code != 4 /*FileTransferError.ABORT_ERR*/){
                                this.dialogs.alert("Error en Descargarga. Código de error " + error.code, 'Error');
                                console.log("[descarga.components.descargarFichero] download error source " + error.source);
                                console.log("[descarga.components.descargarFichero] download error target " + error.target);
                                console.log("[descarga.components.descargarFichero] " + error.body);
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
                fileTransfer.onProgress((progress) => {
                    this.porcentajeDescargado = Math.round(((progress.loaded / progress.total) * 100));
                    if (this.porcentajeAnterior != this.porcentajeDescargado){
                        this.porcentajeAnterior = this.porcentajeDescargado;
                    }
                })
            }
            else{
                fileTransfer.abort(); //se genera un error "abort", así que es en la función de error donde pongo el false a descargando.
                this.msgDescarga ("Cancelando descarga");
                this.borrarDescarga(this.fileDownload  + ".mp3");
            }
        }
        else if (this.icono == 'trash') {
            console.log("[descarga.components.descargarFichero] Solicitado borrado.")
            if (confirm('El fichero ya ha sido descargado. \n ¿Desea borrarlo?')) {
                //reproductor.stop();
                console.log("[descarga.components.descargarFichero] Confirmado borrado.")
                this.borrarDescarga(this.fileDownload + ".mp3");
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
        this.file.removeFile(this.dirdestino, this.fileDownload + '.mp3').then(()=>{
            console.log("[DescargaCafetera] El fichero " + fichero + '.se ha eliminado.');
            this.icono = 'cloud-download';
            this.ficheroDescargado.emit({existe: false});
            this.msgDescarga('Programa borrado');
        }, (err) => {
            console.log("[DescargaCafetera] Error borrando fichero "+ this.dirdestino + this.fileDownload + " . Error code: " + err.code + " message: " + err.message);
        });
    }
}
