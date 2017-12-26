import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file';
import { Events } from 'ionic-angular';
import { Transfer, TransferObject} from '@ionic-native/transfer';


@Injectable()


export class StreamingAudioService {

    carpetaDestino: string = "";
    descargando: boolean = false;
    transfer: Transfer;
    fileTransfer: TransferObject;
      //file: File;

    constructor(public file :File,
                public events: Events ) {
        //this.file = new File();
        this.transfer = new Transfer();
        this.fileTransfer = this.transfer.create();
        this.file.resolveLocalFilesystemUrl(this.file.dataDirectory) // --> Probar esto: externalCacheDirectory
        .then((entry) => {
            this.carpetaDestino = entry.toInternalURL();
        })
        .catch((error) => {
            console.log("[StreamingAudio.constructor] Error recuperando carpeta de destino: " + error.body);
        });
    }

    capturarStreaming(capitulo: string) {
        let flujoStreaming : string  = "https://api.spreaker.com/v2/episodes/"+capitulo+"/stream";
        let yasta :boolean = false;
        let promesa = new Promise((resolve, reject) => {
            let fileURL:string = this.carpetaDestino + capitulo + "str.mp3" ;
            console.log ("[StreamingAudio.capturarStreaming] Descargando " + fileURL);
            if (!this.descargando){
                console.log("[StreamingAudio.capturarStreaming] Comenzando la descarga del fichero "+ capitulo + "str.mp3 en la carpeta " + this.carpetaDestino );
                this.fileTransfer.download( encodeURI(flujoStreaming), encodeURI(fileURL), true, {})
                .then(() => {
                    console.log("[StreamingAudio.capturarStreaming] El flujo de streaming ha terminado.");
                    this.descargando = false;
                    this.events.publish('streaming:descargado', {valor:true});
                })
                .catch((error) => {
                    if (error.code != 4){
                        console.log("[StreamingAudio.capturarStreaming] Kagada " + error);
                        console.log("[StreamingAudio.capturarStreaming] Error " + error.code + " en descarga de streaming." + error.exception);
                        this.descargando = false;
                        this.events.publish('streaming:descargado', {valor:false});
                    }
                    this.descargando = false;
                    reject ("Error " + error.code + " en descarga de streaming." + error.exception);
                });
                this.descargando = true;
                //setTimeout (()=> {resolve(true); console.log("[StreamingAudio.capturarStreaming] Mandamos true. ")}, 1000);
                //resolve(true);
                this.fileTransfer.onProgress((progress) => {
                    if (progress.loaded > 200000 && !yasta) {
                        resolve (true);
                        yasta = true;
                        console.log("[StreamingAudio.capturarStreaming] Enviado OK a la reproducción. " + progress.loaded);
                    }
                    //console.log("[StreamingAudio.capturarStreaming] Recibido " + progress.loaded);
                })
            }
            else{
                console.log("[StreamingAudio.capturarStreaming] COSA EXTRAÑA. ME HAN SOLICITADO DESCARGAR STREAMING CUANDO YA LO ESTABA HACIENDO..." );
                resolve(true);
            }
        });
        return promesa;
    }

    nombreFicheroStreaming (capitulo: string):string{
        return (this.carpetaDestino + capitulo + "str.mp3");
    }

    borrarStreaming (flujo:string) {
        this.fileTransfer.abort();
        this.descargando = false;
        let promesa = new Promise((resolve, reject) => {
            this.file.removeFile(this.carpetaDestino, flujo + 'str.mp3')
            .then(() => {
                console.log("[streamingAudio.borrarStreaming] El fichero " + flujo + '.se ha eliminado.');
                resolve(true);
            })  
            .catch((err) => {
                console.log("[streamingAudio.borrarStreaming] Error " + err.code + " borrando fichero "+ this.carpetaDestino + flujo + "str.mp3: " + err.message);
            });
        })
        return promesa;
    } 
}    