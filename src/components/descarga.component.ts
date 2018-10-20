import { Component, Input, Output, EventEmitter, ChangeDetectorRef, OnInit, OnDestroy} from '@angular/core';
import { File } from '@ionic-native/file';
import { Dialogs } from '@ionic-native/dialogs';
import { Network } from '@ionic-native/network';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
import { Events, ToastController, Platform } from 'ionic-angular';

import { ConfiguracionService } from '../providers/configuracion.service';
import { EpisodiosGuardadosService } from "../providers/episodios_guardados.service";

//declare var cordova: any;
@Component({
    selector: 'descargaCafetera',
    template: `<button ion-button clear (click)="descargarFichero()">
                    <ion-icon icon-left [name]="icono">
                    </ion-icon>
                </button>
                <div class="porcentaje" [hidden]="porcentajeDescargado == 0" (click)="descargarFichero()">
                    <p>{{porcentajeDescargado}}%</p>
                </div>
                `,
    providers: [FileTransfer, FileTransferObject, ConfiguracionService, Dialogs, Network, EpisodiosGuardadosService]
})

export class DescargaCafetera implements OnInit, OnDestroy {

    @Input() capDownload: string;
    @Output() ficheroDescargado = new EventEmitter();
    @Output() ficheroBorrado = new EventEmitter();
   /*@Input() fileExists: string;
    @Output() porcentajeDescarga = new EventEmitter();
    }*/

    descargando:boolean = false;
    icono: string;

    //UBICACIONHTTP: string = "https://api.spreaker.com/download/episode/";
    //DIRDESTINO:string = cordova.file.dataDirectory;
    dirdestino:string;
    fileTransfer: FileTransferObject;

    porcentajeDescargado:number = 0;
    porcentajeCalculado:number = 0;

    capItem: any;
    fileDownload:string;
    enVivo: boolean;
    imagenDownload: string;

    constructor(public events: Events,
                public toastCtrl: ToastController,
                private _configuracion: ConfiguracionService,
                private file: File,
                private network: Network,
                private dialogs: Dialogs,
                private transfer: FileTransfer,
                private chngDetector: ChangeDetectorRef,
                private guardaDescargados: EpisodiosGuardadosService,
                public platform : Platform ) {
                };

    ngOnInit(){ 
        // externalDataDirectory --> cdvfile://localhost/files-external/
        // dataDirectory --> cdvfile://localhost/files/
        if (typeof this.capDownload == 'object'){
            this.capItem = this.capDownload;
        }
        else {
            this.capItem = JSON.parse(this.capDownload);
        }
        this.fileDownload = this.capItem.episode_id;
        this.enVivo = this.capItem.type=="LIVE";
        this.imagenDownload = this.capItem.image_url;

        this.fileTransfer = this.transfer.create();

        this.events.subscribe("capitulo:fenecido", (nuevoEstado) => {
            console.log('[Descarga.ngOnInit] Recibido mensaje de que ha terminado capítulo en vivo y en directo. Ahora es ' + nuevoEstado);
            this.icono = 'ios-cloud-download'; // Si justo acaba de morir el capítulo, no puede ser que está ya descargado.
            this.ficheroDescargado.emit({existe: false});
        });

        
        this.platform.ready().then(() => {

            if (this.enVivo){
                this.icono = 'lock';
                this.ficheroDescargado.emit({existe: false});
            }
            else {
                this.file.resolveLocalFilesystemUrl(this.file.dataDirectory) // --> Probar esto: externalDataDirectory
                .then((entry) => {
                    this.dirdestino = entry.toInternalURL();
                    if (this.fileDownload != null) {
                        console.log("[Descarga.ngOnInit] this.dirdestino "+ this.dirdestino+" this.fileDownload " + this.fileDownload)
                        this.file.checkFile(this.dirdestino, this.fileDownload + '.mp3')
                        .then((value)=>{
                            if(value == true) { //Aqu� hay que ver si VALUE se considera boolean y podemos quitar el " == true"
                                console.log("[Descarga.ngOnInit] El fichero " + this.fileDownload + ' existe.');
                                this.icono = 'trash';
                                this.ficheroDescargado.emit({existe: true, direccion: this.dirdestino}); //Aqu� hay que ver si VALUE se considera boolean y dejar s�lo un "emit existe:value"
                            }
                            else {
                                console.log("[Descarga.ngOnInit] El fichero " + this.fileDownload + ' no existe.');
                                this.icono = 'ios-cloud-download'; // Fuerzo a que salga el icono de iOS que mola m�s :b
                                this.ficheroDescargado.emit({existe: false, direccion: null});
                            }
                        })
                        .catch((err) => {
                            this.icono = 'ios-cloud-download';
                            this.ficheroDescargado.emit({existe: false, direccion: null});
                                console.log("[Descarga.ngOnInit] ERROR en respuesta: "+ err.message +". Considero que no existe.");
                        });
                    }
                    else {
                        this.icono = 'lock';
                        this.ficheroDescargado.emit({existe: false, direccion: null});
                    }
                })
                .catch((error) => {
                    console.log("[Descarga.ngOnInit] Error recuperando carpeta de destino: " + error.body);
                    this.icono = 'bug';
                    this.dialogs.alert("Se ha producido un error accediendo a sistema de ficheros", 'Error', 'Por rojerash')
                });
            }
        });
    }

    ngOnDestroy(){
        if (!this.events.unsubscribe("capitulo:fenecido")) {console.error('[Descarga.ngOnDestroy] No me he dessuscrito de capitulo.')};
        console.log("[descarga.componentes.ngOnDestroy] Saliendo");
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
            //const this.fileTransfer: TransferObject = this.transfer.create();
        /////  let audio_en_desc : string  = "https://api.spreaker.com/download/episode/"+this.fileDownload+".mp3";
            //let uri : string = encodeURI(audio_en_desc);
            this.file.resolveLocalFilesystemUrl(this.file.dataDirectory) // --> Probar esto: externalDataDirectory
            .then((entry) => {
                this.dirdestino = entry.toInternalURL();
                let fileURL:string = this.dirdestino + this.fileDownload + ".mp3" ;
                console.log ("[Descarga.components.descargarFichero] Descargando vale " + this.descargando + " e icono vale " + this.icono);
                console.log ("[Descarga.components.descargarFichero] Descargando " + fileURL);
                if (this.icono == 'ios-cloud-download' || this.icono == 'ios-archive'){
                    console.log ("[Descarga.components.descargarFichero] Solicitada descarga.");
                    if (!this.descargando){
                        this._configuracion.getWIFI()
                        .then((val) => {
                            console.log ("[Descarga.components.descargarFichero] La conexión es " + this.network.type + " y la obligación de tener wifi es " + val);
                            if(this.network.type === "wifi" || !val  ) {
                                console.log("[descarga.components.descargarFichero] Comenzando la descarga del fichero "+ this.fileDownload + " en la carpeta " + this.dirdestino );
                                this.msgDescarga("Descargando audio.")
                                this.fileTransfer.download( encodeURI(audio_en_desc), encodeURI(fileURL), true, {})
                                .then(() => {
                                    console.log("[descarga.components.descargarFichero]  Descarga completa.");
                                    this.icono = 'trash';
                                    this.ficheroDescargado.emit({existe: true});
                                    this.porcentajeDescargado = 0;
                                    this.descargando = false;
                                    this.msgDescarga('Descarga completa');
                                    //let inicioNombreImagen : number = this.imagenDownload.lastIndexOf('\/')+1;
                                    //let nombreImagen : string = this.imagenDownload.substr(inicioNombreImagen,this.imagenDownload.lastIndexOf('.') - inicioNombreImagen);
                                    //this.fileTransfer.download( encodeURI(this.imagenDownload), encodeURI(this.dirdestino + nombreImagen + '.jpg'), true, {})
                                    this.fileTransfer.download( encodeURI(this.imagenDownload), encodeURI(this.dirdestino + this.fileDownload + '.jpg'), true, {})
                                    .then((entrada) => {
                                        console.log("[descarga.components.descargarFichero]  Descarga de imagen completa." + JSON.stringify(entrada));
                                        this.capItem.image_url = entrada.nativeURL;              
                                        this.porcentajeDescargado = 0;
                                        this.guardaDescargados.guardaProgramas(this.capItem);
                                        this.file.checkFile(this.dirdestino, this.fileDownload + '.jpg')// Confirmamos que existe. A ver si confirmando luego se ve.
                                        .then((resultado) => {
                                            if (resultado){
                                                console.log("[descarga.components.descargarFichero] Imagen " + this.fileDownload + ".jpg encontrada en carpeta destino " + this.dirdestino);
                                            }
                                            else {
                                                console.log("[descarga.components.descargarFichero] Imagen " + this.fileDownload + ".jpg NO encontrada en carpeta destino " + this.dirdestino);
                                            }
                                        })
                                        .catch((error) => {
                                            console.log("[descarga.components.descargarFichero] Se ha producido un error buscando la imagen en carpeta destinoo: " + JSON.stringify(error));
                                        }); 
                                        this.file.readAsBinaryString(this.dirdestino, this.fileDownload + '.jpg')// Confirmamos que existe. A ver si confirmando luego se ve.
                                        .then((resultado) => {
                                            console.log("[descarga.components.descargarFichero] Imagen abierta en carpeta destino");
                                        })
                                        .catch((error) => {
                                            console.log("[descarga.components.descargarFichero] Se ha producido un error abriendo imagen en carpeta destino: " + JSON.stringify(error));
                                        });
                                    })
                                    .catch((error) => {
                                        if (error.code != 4){
                                            console.log("[descarga.components.descargarFichero] Error descargando imagen " + JSON.stringify(error));
                                        }
                                    });
                                })
                                .catch((error) => {
                                    if (error.code != 4 /*this.fileTransferError.ABORT_ERR*/){
                                        console.log("[descarga.components.descargarFichero] Kagada " + error);
                                        console.log("[descarga.components.descargarFichero] download error source " + error.source);
                                        console.log("[descarga.components.descargarFichero] download error target " + error.target);
                                        console.log("[descarga.components.descargarFichero] " + error.body);
                                        this.msgDescarga("Error en Descargar capítulo " + this.fileDownload + ". Código de error " + error.code);
                                    }
                                    this.descargando = false;
                                    this.icono = 'ios-cloud-download';
                                    this.porcentajeDescargado = 0;
                                });
                                this.descargando = true;                                
                            }
                            else {
                                this.msgDescarga ("Sólo tiene permitidas descargas con la conexión WIFI activada.");
                            }
                        }).catch(() => {
                            console.log("[descarga.components.descargarFichero] Error recuperando valor WIFI");
                        });
                        this.fileTransfer.onProgress((progress) => {
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
                        this.fileTransfer.abort(); //se genera un error "abort", as� que es en la funci�n de error donde pongo el false a descargando.
                        this.msgDescarga ("Cancelando descarga");
                        this.borrarDescarga();
                    }
                }
                else if (this.icono == 'trash') {
                    console.log("[descarga.components.descargarFichero] Solicitado borrado.")
                    this.dialogs.confirm('¿Está seguro de que desea borrar el programa?', 'Super-Gurú')
                    .then ((respuesta)=> {
                        //reproductor.stop();
                        console.log("[descarga.components.descargarFichero] Confirmación de borrado:" + respuesta);
                        if (respuesta == 1){
                            this.borrarDescarga();
                            this.ficheroBorrado.emit({episodio_id: this.fileDownload});
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
            })
            .catch((error) => {
                console.log("[Descarga.descargarFichero] Error recuperando carpeta de destino: " + error.body);
                this.icono = 'bug';
                this.dialogs.alert("Se ha producido un error accediendo a sistema de ficheros", 'Error', 'Por rojerash')
            });
        }
    }

    borrarDescarga () {
        this.file.removeFile(this.dirdestino, this.fileDownload + '.mp3')
            .then(() => {
                console.log("[Descarga.borrarDescarga] El fichero " + this.fileDownload + '.se ha eliminado.');
                this.icono = 'ios-cloud-download';
                this.ficheroDescargado.emit({existe: false});
                this.msgDescarga('Programa borrado');
                this.guardaDescargados.borraProgramas(this.capItem);
				this.file.removeFile(this.dirdestino, this.fileDownload + '.jpg')
				.then(() => {
					console.log("[Descarga.borrarDescarga] Borrada imagen asociada.");
				})
				.catch((err) => {
					console.log("[Descarga.borrarDescarga] Error borrando imagen "+ this.dirdestino + this.fileDownload + ".jpg . Error code: " + err.code + " message: " + err.message);
				});
            })
            .catch((err) => {
                console.log("[Descarga.borrarDescarga] Error borrando fichero "+ this.dirdestino + this.fileDownload + ".mp3 . Error code: " + err.code + " message: " + err.message);
            });
    }
}