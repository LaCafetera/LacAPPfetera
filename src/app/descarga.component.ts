import { Component, Input, Output, EventEmitter, ChangeDetectorRef} from '@angular/core';
import { File } from '@ionic-native/file';
import { Dialogs } from '@ionic-native/dialogs';
import { Network } from '@ionic-native/network';
import { Transfer, TransferObject} from '@ionic-native/transfer';
import { Events, ToastController } from 'ionic-angular';

import { ConfiguracionService } from '../providers/configuracion.service';

//declare var cordova: any;

@Component({
    selector: 'descargaCafetera',
    template: `<button ion-button clear (click)="descargarFichero()">
                    <ion-icon icon-left [name]="icono">

                    </ion-icon>
                </button>
                <div class="porcentaje" *ngIf="porcentajeDescargado != 0" (click)="descargarFichero()">
                    <p>{{porcentajeDescargado}}%</p>
                </div>
                `,
    providers: [File, Transfer, ConfiguracionService, Dialogs, Network]
})

export class DescargaCafetera {

    @Input() fileDownload: string;
    @Input() enVivo: boolean;
    @Output() ficheroDescargado = new EventEmitter();
   /*@Input() fileExists: string;
    @Output() porcentajeDescarga = new EventEmitter();

    }*/

    //fileTransfer = new Transfer();
    descargando:boolean = false;
    icono: string;

    //UBICACIONHTTP: string = "https://api.spreaker.com/download/episode/";
    //DIRDESTINO:string = cordova.file.dataDirectory;
    dirdestino:string;

    porcentajeDescargado:number = 0;
    porcentajeCalculado:number = 0;

    constructor(public events: Events,
                public toastCtrl: ToastController,
                private _configuracion: ConfiguracionService,
                private file: File,
                private network: Network,
                private dialogs: Dialogs,
                private transfer: Transfer,
                private chngDetector: ChangeDetectorRef ) {};

    ngOnInit(){
       // this.porcentajeDescarga.emit({porcentaje: 0});
       console.log("[Descarga.ngOnInit] ******************* La carpeta externa de descarga sería " + this.file.resolveLocalFilesystemUrl(this.file.externalDataDirectory));
       if (this.enVivo){
            this.icono = 'lock';
            this.ficheroDescargado.emit({existe: false})
       }
       else {
        this.file.resolveLocalFilesystemUrl(this.file.dataDirectory) // --> Probar esto: externalDataDirectory
                .then((entry) => {
                    this.dirdestino = entry.toInternalURL();
                    if (this.fileDownload != null) {
                        console.log("[Descarga.ngOnInit] this.dirdestino "+ this.dirdestino+" this.fileDownload " + this.fileDownload)
                        this.file.checkFile(this.dirdestino, this.fileDownload + '.mp3')
                        .then((value)=>{
                            if(value == true) { //Aquí hay que ver si VALUE se considera boolean y podemos quitar el " == true"
                                console.log("[Descarga.ngOnInit] El fichero " + this.fileDownload + ' existe.');
                                this.icono = 'trash';
                                this.ficheroDescargado.emit({existe: true}); //Aquí hay que ver si VALUE se considera boolean y dejar sólo un "emit existe:value"
                            }
                            else {
                                console.log("[Descarga.ngOnInit] El fichero " + this.fileDownload + ' no existe.');
                                this.icono = 'ios-cloud-download'; // Fuerzo a que salga el icono de iOS que mola más :b
                                this.ficheroDescargado.emit({existe: false});
                            }
                        })
                        .catch((err) => {
                            this.icono = 'cloud-download';
                            this.ficheroDescargado.emit({existe: false});
                                console.log("[Descarga.ngOnInit] ERROR en respuesta: "+ err.message +". Considero que no existe.");
                        });
                    }
                    else {
                        this.icono = 'lock';
                        this.ficheroDescargado.emit({existe: false});
                    }
                })
                .catch((error) => {
                    console.log("[Descarga.ngOnInit] Error recuperando carpeta de destino: " + error.body);
                    this.icono = 'bug';
                    this.dialogs.alert("Se ha producido un error accediendo a sistema de ficheros", 'Error', 'Por rojerash')
                });
       }
    }

    msgDescarga  (mensaje: string) {
        let toast = this.toastCtrl.create({
            message: mensaje,
            duration: 3000
        });
        toast.present();
    }

    descargarFichero(evento) {
       if (this.enVivo){
            this.msgDescarga('No es posible descargar reproducciones en vivo');
       }
       else {
            let audio_en_desc : string  = "https://api.spreaker.com/v2/episodes/"+this.fileDownload+"/download";
            const fileTransfer: TransferObject = this.transfer.create();
        /////  let audio_en_desc : string  = "https://api.spreaker.com/download/episode/"+this.fileDownload+".mp3";
            //let uri : string = encodeURI(audio_en_desc);
            let fileURL:string = this.dirdestino + this.fileDownload + ".mp3" ;
            console.log ("[Descarga.components.descargarFichero] Descargando vale " + this.descargando + " e icono vale " + this.icono);
            console.log ("[Descarga.components.descargarFichero] Descargando " + fileURL);
            if (this.icono == 'cloud-download' || this.icono == 'ios-archive'){
                console.log ("[Descarga.components.descargarFichero] Solicitada descarga.");
                if (!this.descargando){
                    this._configuracion.getWIFI()
                        .then((val) => {
                            console.log ("[Descarga.components.descargarFichero] La conexión es " + this.network.type + " y la obligación de tener wifi es " + val);
                            if(this.network.type === "wifi" || !val  ) {
                                console.log("[descarga.components.descargarFichero] Comenzando la descarga del fichero "+ this.fileDownload + " en la carpeta " + this.dirdestino );
                                this.msgDescarga("Descargando audio.")
                                fileTransfer.download( encodeURI(audio_en_desc), encodeURI(fileURL), true, {}).then(() => {
                                    console.log("[descarga.components.descargarFichero]  Descarga completa.");
                                    this.icono = 'trash';
                                    this.ficheroDescargado.emit({existe: true});
                                    this.porcentajeDescargado = 0;
                                    this.descargando = false;
                                    this.msgDescarga('Descarga completa');
                                })
                                .catch((error) => {
                                    if (error.code != 4 /*FileTransferError.ABORT_ERR*/){
                                        console.log("[descarga.components.descargarFichero] Kagada " + error);
                                        console.log("[descarga.components.descargarFichero] download error source " + error.source);
                                        console.log("[descarga.components.descargarFichero] download error target " + error.target);
                                        console.log("[descarga.components.descargarFichero] " + error.body);
                                        this.msgDescarga("Error en Descargar. Código de error " + error.code);
                                    }
                                    this.descargando = false;
                                });
                                this.descargando = true;
                            }
                            else {
                                this.msgDescarga ("Sólo tiene permitidas descargas con la conexión WIFI activada.");
                            }
                        }).catch(() => {
                            console.log("[descarga.components.descargarFichero] Error recuperando valor WIFI");
                        });
                    fileTransfer.onProgress((progress) => {
                        this.porcentajeCalculado = Math.round(((progress.loaded / progress.total) * 100));
                        if (this.porcentajeCalculado != this.porcentajeDescargado){
                            console.log("[DESCARGA.descargarFichero] Cambiando porcentaje de " + this.porcentajeDescargado + " a " + this.porcentajeCalculado);
                            this.porcentajeDescargado = this.porcentajeCalculado;
                            this.chngDetector.detectChanges();
                //         this.porcentajeDescarga.emit({porcentaje: this.porcentajeDescargado});
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
                this.dialogs.confirm('El fichero ya ha sido descargado. \n ¿Desea borrarlo?')
                .then ((respuesta)=> {
                    //reproductor.stop();
                    console.log("[descarga.components.descargarFichero] Confirmación de borrado:" + respuesta);
                    if (respuesta == 1){
                        this.borrarDescarga(this.fileDownload + ".mp3");
                    }
                })
                .catch (() => {
                    console.log("[descarga.components.descargarFichero] Rechazada opción de borrado.")
                })
            }
            else if (this.icono == 'bug') {
                this.msgDescarga("No se puede realizar la descarga.");
            }
            else {
                this.msgDescarga("No se permite descargar una emisión en vivo.");
            }
       }
    }

    borrarDescarga (fichero:string) {
        this.file.removeFile(this.dirdestino, this.fileDownload + '.mp3')
            .then(() => {
                console.log("[Descarga.borrarDescarga] El fichero " + fichero + '.se ha eliminado.');
                this.icono = 'cloud-download';
                this.ficheroDescargado.emit({existe: false});
                this.msgDescarga('Programa borrado');
            })
            .catch((err) => {
                console.log("[Descarga.borrarDescarga] Error borrando fichero "+ this.dirdestino + this.fileDownload + " . Error code: " + err.code + " message: " + err.message);
            });
    }
}
