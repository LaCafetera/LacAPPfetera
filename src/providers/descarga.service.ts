import { Injectable,Input, Output, EventEmitter, /*OnInit,*/ OnDestroy} from '@angular/core';
import { File } from '@ionic-native/file/ngx';
import { Dialogs } from '@ionic-native/dialogs/ngx';
import { Network } from '@ionic-native/network/ngx';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { Events, ToastController, Platform } from 'ionic-angular';
import { Downloader } from '@ionic-native/downloader/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { StoreProvider } from './store.service';

import { ConfiguracionService } from './configuracion.service';
import { EpisodiosGuardadosService } from "./episodios_guardados.service";


@Injectable()

export class DescargaCafetera implements /* OnInit,*/ OnDestroy {

   /* @Input() capDownload: string;*/
    @Output() ficheroDescargado = new EventEmitter();
    @Output() ficheroBorrado = new EventEmitter();

    descargando:boolean = false;
    icono: string;

    dirdestino:string;
    fileTransfer: FileTransferObject;

    porcentajeDescargado:number = 0;
    porcentajeCalculado:number = 0;

    capItem: any;
    fileDownload:string;
    enVivo: boolean;
	imagenDownload: string;
	pemitidoWIFI: boolean;

    constructor(public events: Events,
                public toastCtrl: ToastController,
                private _configuracion: ConfiguracionService,
                private file: File,
                private network: Network,
                private dialogs: Dialogs,
                private transfer: FileTransfer,
                private guardaDescargados: EpisodiosGuardadosService,
                public platform : Platform,
				private downloader: Downloader,
				private localNotifications: LocalNotifications, 
				private store: StoreProvider
				) {
					this.inicializa();
                };

    //ngOnInit(){ 
	inicializa(){
        //this.fileDownload = this.capItem.episode_id;
        //this.enVivo = this.capItem.type=="LIVE";
        //this.imagenDownload = this.capItem.image_url;

		this.fileTransfer = this.transfer.create();
		
		this._configuracion.getWIFI()
		.then((val) => {
			this.pemitidoWIFI = val;
		})
		.catch((error) => {
			console.error("[descarga.components.ngOnInit] Error recuperando valor WIFI");
			this.pemitidoWIFI = true;
		});

		this.localNotifications.setDefaults({
			vibrate: false,
			sound: false
		});

        this.events.subscribe("capitulo:fenecido", (nuevoEstado) => {
            console.log('[Descarga.ngOnInit] Recibido mensaje de que ha terminado capítulo en vivo y en directo. Ahora es ' + nuevoEstado);
            this.icono = 'ios-cloud-download'; // Si justo acaba de morir el capítulo, no puede ser que está ya descargado.
            this.ficheroDescargado.emit({existe: false, direccion: null});
        });
        this.events.subscribe('descargaWIFI:status', (dato) => {
			console.log('[Descarga.ngOnInit] Cambiado posibilidad de descarga sin wifi a ' + dato.valor);
			this.pemitidoWIFI = dato.valor;
        });

        
        this.platform.ready().then(() => {
            if (this.enVivo){
                this.icono = 'lock';
                this.ficheroDescargado.emit({existe: false, direccion: null});
            }
            else {
                this.file.resolveLocalFilesystemUrl(this.store.andeLoDejo()) // --> Probar esto: externalDataDirectory
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
                                console.error("[Descarga.ngOnInit] ERROR en respuesta: "+ err.message +". Considero que no existe.");
                        });
                    }
                    else {
                        this.icono = 'lock';
                        this.ficheroDescargado.emit({existe: false, direccion: null});
                    }
                })
                .catch((error) => {
                    console.error("[Descarga.ngOnInit] Error recuperando carpeta de destino: " + error.body);
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
	
	descargaFichero (datosCapitulo: any){
		//this.descargarFicheroIOS (datosCapitulo);/*.episode_id);/
		if (this.platform.is("ios")){
			this.descargarFicheroIOS (datosCapitulo);
		}
		else {
            this.descargarFicheroAndroid(datosCapitulo);
		}
	}

    descargarFicheroAndroid(datosCapitulo: any){
		var descarga = {
			uri: "https://api.spreaker.com/v2/episodes/"+datosCapitulo.episode_id+"/download",
			//title: 'Descargando el cafecito del día ' + datosCapitulo.published_at.substring(8, 10) + '/' + datosCapitulo.published_at.substring(5, 7) + '/' + datosCapitulo.published_at.substring(0, 4),
			title: 'Descargando ' + datosCapitulo.published_at.substring(8, 10) + '/' + datosCapitulo.published_at.substring(5, 7) + '/' + datosCapitulo.published_at.substring(0, 4),
			description: '',
			mimeType: '',
			visibleInDownloadsUi: true,
			notificationVisibility: 0,
			destinationInExternalFilesDir: {
				dirType: '',
				subPath: datosCapitulo.episode_id +'.mp3'
			}
		}
		var descargaImg = {
			uri: datosCapitulo.image_url,
			title: 'Descargando imagen',
			description: '',
			mimeType: '',
			visibleInDownloadsUi: true,
			notificationVisibility: 0,
			destinationInExternalFilesDir: {
				dirType: '',
				subPath: datosCapitulo.episode_id +'.jpg'
			}
		}
		this.downloader.download(descarga)
		.then((location: string) => {
			//this.ficheroDescargado.emit({existe: true, direccion: this.dirdestino});
			this.events.publish('descarga.ficheroDescargado', {existe: true, direccion: this.dirdestino});
			console.log('[Descarga.components.descargarFicheroNG] Fichero descargado en la carpeta'+location);
			this.guardaDescargados.guardaProgramas(datosCapitulo);
			this.downloader.download(descargaImg)
			.then((location: string) => {
				//this.ficheroDescargado.emit({existe: true, direccion: this.dirdestino});
				//this.guardaDescargados.guardaProgramas(this.capItem);
			})
			.catch((error: any) => 
				console.error('[Descarga.components.descargarFicheroNG] imagen: ' + error)
			);
		})
		.catch((error: any) => console.error('[Descarga.components.descargarFicheroNG] ' + error));
    }

    descargarFicheroIOS(datosCapitulo: any/*, fecha: string*/) {
		let capitulo = datosCapitulo.episode_id;
		this.imagenDownload =  datosCapitulo.image_url;
		let audio_en_desc : string  = "https://api.spreaker.com/v2/episodes/"+capitulo+"/download";
		//this.file.resolveLocalFilesystemUrl(this.store.andeLoDejo()) // --> Probar esto: externalDataDirectory
		//.then((entry) => {
		//	this.dirdestino = entry.toInternalURL();
		let fileURL:string = this.dirdestino + capitulo + ".mp3" ;
		console.log ("[Descarga.components.descargarFichero] Descargando vale " + this.descargando + " e icono vale " + this.icono);
		console.log ("[Descarga.components.descargarFichero] Descargando " + fileURL);
		//const fileTransfer: FileTransferObject = this.transfer.create();
		if (!this.descargando){
			console.log ("[Descarga.components.descargarFichero] La conexión es " + this.network.type + " y la obligación de tener wifi es " + this.pemitidoWIFI);
			if(this.network.type === "wifi" || !this.pemitidoWIFI  ) {
				console.log("[descarga.components.descargarFichero] Comenzando la descarga del fichero "+ capitulo + " en la carpeta " + this.dirdestino );
				this.msgDescarga("Descargando audio.");
				this.localNotifications.schedule({
					id: 1,
					title: 'Descargando programa.',
					text: '',
					icon: this.imagenDownload,
					progressBar: { value: 0 }
				});
				this.fileTransfer.download( encodeURI(audio_en_desc), encodeURI(fileURL), true, {})
				.then(() => {
					console.log("[descarga.components.descargarFichero]  Descarga completa.");
					//this.ficheroDescargado.emit({existe: true, direccion: this.dirdestino});
					this.events.publish('descarga.ficheroDescargado', {existe: false, direccion: null});
					this.porcentajeDescargado = 0;
					this.descargando = false;
					this.msgDescarga('Descarga completa');
					this.localNotifications.clearAll();
					this.fileTransfer.download( encodeURI(this.imagenDownload), encodeURI(this.dirdestino + capitulo + '.jpg'), true, {})
					.then((entrada) => {
						console.log("[descarga.components.descargarFichero]  Descarga de imagen completa." + JSON.stringify(entrada));
						//this.capItem.image_url = entrada.nativeURL;              
						datosCapitulo.image_url = entrada.nativeURL;
						this.porcentajeDescargado = 0;
						//this.guardaDescargados.guardaProgramas(this.capItem);
						this.guardaDescargados.guardaProgramas(datosCapitulo);
						this.localNotifications.clearAll();
						this.file.checkFile(this.dirdestino, capitulo + '.jpg')// Confirmamos que existe. A ver si confirmando luego se ve.
						.then((resultado) => {
							if (resultado){
								console.log("[descarga.components.descargarFichero] Imagen " + capitulo + ".jpg encontrada en carpeta destino " + this.dirdestino);
								this.msgDescarga ("Imagen " + capitulo + ".jpg encontrada en carpeta destino " + this.dirdestino + " - " + resultado);
							}
							else {
								console.log("[descarga.components.descargarFichero] Imagen " + capitulo + ".jpg NO encontrada en carpeta destino " + this.dirdestino);
								this.msgDescarga ("Imagen " + capitulo + ".jpg NO encontrada en carpeta destino " + this.dirdestino + " - " + resultado);
							}
						})
						.catch((error) => {
							console.log("[descarga.components.descargarFichero] Se ha producido un error buscando la imagen en carpeta destinoo: " + JSON.stringify(error));
							this.localNotifications.clearAll();
						}); 
						this.file.readAsBinaryString(this.dirdestino, capitulo + '.jpg')// Confirmamos que existe. A ver si confirmando luego se ve.
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
							this.localNotifications.clearAll();
						}
					});
				})
				.catch((error) => {
					if (error.code != 4 /*this.fileTransferError.ABORT_ERR*/){
						console.log("[descarga.components.descargarFichero] Kagada " + error);
						console.log("[descarga.components.descargarFichero] download error source " + error.source);
						console.log("[descarga.components.descargarFichero] download error target " + error.target);
						console.log("[descarga.components.descargarFichero] " + error.body);
						this.msgDescarga("Error en Descargar capítulo " + capitulo + ". Código de error " + error.code);
					}
					this.descargando = false;
					this.icono = 'ios-cloud-download';

					this.porcentajeDescargado = 0;

					this.localNotifications.clearAll();

				});

				this.descargando = true;

				this.fileTransfer.onProgress((progress) => {

					this.porcentajeCalculado = Math.round(((progress.loaded / progress.total) * 100));

					if (this.porcentajeCalculado != this.porcentajeDescargado){
						console.log("[DESCARGA.descargarFichero] Cambiando porcentaje de " + this.porcentajeDescargado + " a " + this.porcentajeCalculado);
						this.porcentajeDescargado = this.porcentajeCalculado;
						this.localNotifications.update({
							id: 1,
							title: 'Descargando programa.',
							text: '',
							icon: this.imagenDownload,
							progressBar: { value: this.porcentajeDescargado }
						});
					}
				})                             
			}
			else {
				this.msgDescarga ("Sólo tiene permitidas descargas con la conexión WIFI activada.");
			}
		}
		else{
			this.fileTransfer.abort(); //se genera un error "abort", as� que es en la funci�n de error donde pongo el false a descargando.
			this.msgDescarga ("Cancelando descarga");
			this.localNotifications.clear(1);
			this.borrarDescarga(capitulo);
		}
		//})
		//.catch((error) => {
		//	console.error("[Descarga.descargarFichero] Error recuperando carpeta de destino: " + error.body);
		//	this.icono = 'bug';
		//	this.dialogs.alert("Se ha producido un error accediendo a sistema de ficheros", 'Error', 'Por rojerash')
		//});
    }

    borrarDescarga (capitulo: string) {
		//this.file.resolveLocalFilesystemUrl(this.store.andeLoDejo()) 
		//.then((entry) => {
		//	this.dirdestino = entry.toInternalURL();
		//this.file.removeFile(this.dirdestino, capitulo + '.mp3')
		this.file.removeFile(this.store.andeLoDejo(), capitulo + '.mp3')
		.then(() => {
			console.log("[Descarga.borrarDescarga] El fichero " + capitulo + '.mp3 se ha eliminado.');
			this.icono = 'cloud-download';
			this.ficheroDescargado.emit({existe: false, direccion: null});
			this.msgDescarga('Programa borrado');
			this.guardaDescargados.borraProgramas(this.capItem);
			this.events.publish('descarga.ficheroDescargado', {existe: false, direccion: this.dirdestino});
			this.file.removeFile(this.dirdestino, capitulo + '.jpg')
			.then(() => {
				console.log("[Descarga.borrarDescarga] Borrada imagen asociada.");
			})
			.catch((err) => {
				console.log("[Descarga.borrarDescarga] Error borrando imagen "+ this.dirdestino + capitulo + ".jpg . Error code: " + err.code + " message: " + err.message);
			});
		})
		.catch((err) => {
			console.log("[Descarga.borrarDescarga] Error borrando fichero "+ this.dirdestino + capitulo + ".mp3 . Error code: " + err.code + " message: " + err.message);
		});
		//})
		//.catch((error) => {
		//	console.log("[Descarga.borrarDescarga] Error recuperando carpeta de destino: " + error.body);
		//	this.dialogs.alert("Se ha producido un error accediendo a sistema de ficheros", 'Error', 'Por rojerash')
		//});
    }
}