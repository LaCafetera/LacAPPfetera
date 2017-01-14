import {Component, Input, Output, EventEmitter } from '@angular/core';
import { File, Transfer } from 'ionic-native';

declare var cordova: any

@Component({
    selector: 'descargaCafetera',
    template: ` <button ion-button clear small icon-left (click)="descargarFichero()">
                    <ion-icon name={{icono}}></ion-icon>
                </button>`,
    providers: [File, Transfer]
})

export class DescargaCafetera {

    @Input() fileDownload: string;
    @Input() fileExists: string;
    @Output() porcentajeDescarga = new EventEmitter();
    @Output() ficheroDescargado = new EventEmitter();


    fileTransfer = new Transfer();
    descargando:boolean = false;
    icono: string;

    UBICACIONHTTP: string = "https://api.spreaker.com/download/episode/";
    DIRDESTINO:string = cordova.file.dataDirectory;
    
    /***** Esto lo podrás borrar cuando ya controles esta parte ****************/
    tamanyo:number;
    descargado:number;
    porcentajeDescargado:number = 0;
    porcentajeAnterior:number = 0;
    /***** Hasta aquí ****************/
    
    constructor() {
        this.porcentajeDescarga.emit({porcentaje: 0});
        File.checkFile(this.DIRDESTINO, this.fileDownload + '.mp3').then(()=>{
            this.ficheroDescargado.emit({existe: true});
            console.log("[DescargaCafetera] El fichero " + this.fileDownload + '.mp3 existe.');
            this.icono = 'trash';
        }, (err) => {
            this.ficheroDescargado.emit({existe: false});
            console.log('[DescargaCafetera] somthing went wrong! error code: ' + err.code + ' message: ' + err.message);
            console.log("[DescargaCafetera] El fichero " + this.fileDownload + '.mp3 NO existe.');
            this.icono = 'cloud-download';
        });
    };

    descargarFichero(evento){
        let audio_en_desc : string  = this.UBICACIONHTTP+this.fileDownload+".mp3";
        let uri : string = encodeURI(audio_en_desc);
        let fileURL:string = this.DIRDESTINO + this.fileDownload + ".mp3";
        if (this.icono == 'cloud-download'){
            if (!this.descargando){
                console.log("Comenzando la descarga del fichero "+ this.fileDownload + " en la carpeta " + this.DIRDESTINO );
                this.fileTransfer.download( uri, fileURL, true, {}).then(() => {
                        alert("Descarga completa.");
                        this.porcentajeDescarga.emit({porcentaje: 0});
                        this.ficheroDescargado.emit({existe: true});
                        this.porcentajeDescargado = 0;
                        this.icono = 'trash';
                    }, (error) => {
                        if (error.code != 4 /*FileTransferError.ABORT_ERR*/){
                            alert("Error en Descargarga. Código de error " + error.code);
                            console.log("download error source " + error.source);
                            console.log("download error target " + error.target);
                            console.log("download error code" + error.code);
                        }
                        this.descargando = false;
                    });
                    this.descargando = true;
                this.fileTransfer.onProgress((progress) => {
                    this.tamanyo = progress.total;
                    this.descargado = progress.loaded;
                    this.porcentajeDescargado = Math.round(((progress.loaded / progress.total) * 100));
                    if (this.porcentajeDescargado != this.porcentajeAnterior){
                        this.porcentajeAnterior = this.porcentajeDescargado;
                        //console.log(this.porcentajeDescargado);
                        this.porcentajeDescarga.emit({porcentaje: this.porcentajeDescargado});
                    }
                })  
            }
            else{
                this.fileTransfer.abort(); //se genera un error "abort", así que es en la función de error donde pongo el false a descargando.
                alert ("Cancelando descarga");
            }
        }
        else {
            if (confirm('El fichero ya ha sido descargado. \n ¿Desea borrarlo?')) {
                //reproductor.stop();
                this.borrarDescarga(this.fileDownload + ".mp3");
            //inicializaReproductor (episodio_id + ".mp3");
        } else {
            console.log("Rechazada opción de borrado.")
        }
        }
    }

    borrarDescarga (fichero:string) {
        File.removeFile(this.DIRDESTINO, this.fileDownload + '.mp3').then(()=>{
            console.log("[DescargaCafetera] El fichero " + fichero + '.se ha eliminado.');
            this.icono = 'cloud-download';
            this.ficheroDescargado.emit({existe: false});
        }, (err) => {
            console.log('[DescargaCafetera] Error borrando fichero. Error code: ' + err.code + ' message: ' + err.message);
        });
    }
}


// Pensar en usar esto cuando la descarga termine:
// https://ionicframework.com/docs/v2/components/#toast