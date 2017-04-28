import { Injectable, Component/*, Output, EventEmitter*/ } from '@angular/core';
import { File } from '@ionic-native/file';
import { MediaPlugin, MediaObject } from '@ionic-native/media';
import { ConfiguracionService } from '../providers/configuracion.service';

//declare var cordova: any;

@Injectable()
@Component({
    providers: [File, MediaPlugin]
})

export class Player {

  //  private repPlugin: MediaPlugin;
    private repObject: MediaObject;
    private _configuracion: ConfiguracionService;

    private capitulo: string ="";
    private descargado:boolean = false;
    //private reproduciendo:boolean = false;
    private statusRep:number;
/*
    public MEDIA_RUNNING = 0; // this.repPlugin.MEDIA_RUNNING;
    public MEDIA_PAUSED = 0; // this.repPlugin.MEDIA_PAUSED;
    public MEDIA_STARTING = 0; // this.repPlugin.MEDIA_STARTING;
    public MEDIA_STOPPED = 0; // this.repPlugin.MEDIA_STOPPED;

    public MEDIA_ERR_ABORTED = 0; // this.repPlugin.MEDIA_ERR_ABORTED;
    public MEDIA_ERR_DECODE = 0; // this.repPlugin.MEDIA_ERR_DECODE;
    public MEDIA_ERR_NETWORK =  0; //this.repPlugin.MEDIA_ERR_NETWORK;
    public MEDIA_ERR_NONE_SUPPORTED = 0; // this.repPlugin.MEDIA_ERR_NONE_SUPPORTED;
    public MEDIA_NONE = 0; // this.repPlugin.MEDIA_NONE;
*/
    seekPdte:boolean = false;
    ubicacionAudio:string ="";

    constructor(/*private repObject: MediaObject, */public repPlugin: MediaPlugin, private file: File){

        file.resolveLocalFilesystemUrl(file.dataDirectory)
            .then((entry)=>{
                this.ubicacionAudio = entry.toInternalURL();
                //this.crearepPlugin (audio);
            })
            .catch((error)=>{console.log("[PLAYER] ERROR RECUPERANDO UBICACIÓN DE AUDIO:" + error)});
//        this.repPlugin = new MediaPlugin ();
    }

    public crearepPlugin (audio:string, configuracion: ConfiguracionService): MediaObject { //Promise<any>{
        console.log("[PLAYER.crearepPlugin] recibida petición de audio: " + audio);
        this._configuracion = configuracion;
        const onStatusUpdate = ((status) =>{
            this.statusRep = status
            console.log("[PLAYER.crearepPlugin] actualizado status de la reproducción a " + status + " - " + this.repPlugin.MEDIA_RUNNING);
            if (this.seekPdte && status == this.repPlugin.MEDIA_RUNNING){
                let capitulo = this.dameCapitulo();
                this._configuracion.getTimeRep(this.dameCapitulo())
                .then((val)=> {
                    console.log("[PLAYER.crearepPlugin] recibida posición de reproducción "+val + "para el capítulo" + capitulo );
                    if (val != null && Number(val) > 0){
                        this.seekTo (Number(val));
                    }
                }).catch(()=>{
                    console.log("[PLAYER.crearepPlugin] Error recuperando posición de la reproducción.");
                });
                this.seekPdte = false;
            }
        });
        if (audio.includes('mp3')){
            console.log("[PLAYER.crearepPlugin] Tratando de reproducir:"+ this.ubicacionAudio + this.extraeCapitulo(audio) + ".mp3");
            return(this.repPlugin.create (this.ubicacionAudio + this.extraeCapitulo(audio) + ".mp3", onStatusUpdate));
        }
        else {
            console.log("[PLAYER.crearepPlugin] Tratando de reproducir:"+ audio);
            return(this.repPlugin.create (audio, onStatusUpdate));
        }
    }

    dameStatus(){
        return this.statusRep;
    }

    dameStatusRep(){
        return this.repPlugin.MEDIA_RUNNING;
    }

    dameStatusPause(){
        return this.repPlugin.MEDIA_PAUSED;
    }

    dameStatusStop(){
        return this.repPlugin.MEDIA_STOPPED;
    }

    traduceAudio(audio):string{
        return (audio.includes('mp3')?this.ubicacionAudio + this.extraeCapitulo(audio) + ".mp3":audio);
    }

    dameCapitulo():string{
        return (this.extraeCapitulo(this.capitulo));
    }

    extraeCapitulo(capituloEntrada):string{
        let inicio:number;
        let fin:number;
        console.log("[PLAYER.extraeCapitulo] Extrayendo capítulo de la cadena "+ this.capitulo);
        if (capituloEntrada != null){
            if (capituloEntrada.includes('play')){
                fin = capituloEntrada.length-5;
            }
            else {
                fin = capituloEntrada.length-4;
            }
            inicio = capituloEntrada.substring(0, fin).lastIndexOf("/")+1;
            console.log("[PLAYER.extraeCapitulo] Devolviendo "+ capituloEntrada.substring(inicio, fin));
            return (capituloEntrada.substring(inicio, fin));
        }
        else {
            console.log("[PLAYER.extraeCapitulo] Devolviendo cadena vacía");
            return ("");
        }
    }

    capDescargado (idDescargado){
        this.descargado = idDescargado;
    }

    getCurrentPosition(){
        return this.repObject.getCurrentPosition();
    }

    getCurrentAmplitude(){
        return this.repObject.getCurrentAmplitude();
    }

    reproduciendoEste(audio):boolean{
        return (audio == this.capitulo);
    }

    play(audio){
        console.log ("[PLAYER.play] Recibida petición de reproducción de "+ audio );
		let capitulo = this.dameCapitulo();
        audio = this.traduceAudio(audio);
        console.log ("[PLAYER.play] traducimos audio a reproducir a "+ audio );
        if (this.reproduciendoEste(audio))
        {
            console.log ("[PLAYER.play] Play normal");
            this.repObject.play(); //this.repPlugin.play([repeticiones, sonarBloqueado]);
        }
        else{
            console.log ("[PLAYER.play] Modificado audio");
            if (this.repObject != null) {
                this.repObject.getCurrentPosition()
                    .then((pos)=>{
                        console.log("[PLAYER.play] Recibida posición " + pos * 1000 + " para el capítulo "+ capitulo+ ". Guardando posición.");
                        if (pos > 0 && capitulo != ""){
                            this._configuracion.setTimeRep(capitulo, pos * 1000);
                        }
                    })
                    .catch ((err)=> {
                        console.log ("[PLAYER.play] Recibido error al pedir posición de reproducción: " + err);
                    });
                this.repObject.stop();
                this.repObject.release();
            }
            this.capitulo = audio;
            this.seekPdte = true;
            this.repObject = this.crearepPlugin (audio, this._configuracion);
/*            .then((objeto)=> {*/
                console.log("[PLAYER.play] Objeto reproductor creado."); 
/*                this.repObject = objeto;*/
			    this.repObject.play();
/*            })
            .catch((error)=> {
                console.log("[PLAYER.crearepPlugin] Error creando reproductor: "+ error); 
            })*/
        }
    }

    resume(){
        this.repObject.play();
    }

    pause(){
        this.repObject.pause();
    }

    release(){
		this.repObject.getCurrentPosition()
			.then((pos)=>{
				console.log("[PLAYER.release] Recibida posición " + pos * 1000);
                if (pos > 0) {
				    this._configuracion.setTimeRep(this.dameCapitulo(), pos * 1000);
                }
			})
			.catch ((err)=> {
				console.log ("[PLAYER.release] Recibido error al pedir posición de reproducción: " + err);
			});
        this.repObject.release();
        //this.reproduciendo = false;
    }

    adelantaRep(){
        this.getCurrentPosition()
            .then((position)=>{
                this.seekTo((position+15)*1000);
            })
            .catch(() =>{
                console.log("[PLAYER.retrocedeRep] Error retrocediendo.")
            });
    }

    retrocedeRep(){
        this.getCurrentPosition()
            .then((position)=>{
                if (position>15){
                    this.seekTo((position-15)*1000);
                }
                else{
                    this.seekTo(0);
                }
            })
            .catch(() =>{
                console.log("[PLAYER.retrocedeRep] Error retrocediendo.")
            });
    }

    seekTo(milisegundos:number){
        this.repObject.seekTo(milisegundos);
    }

    setVolume(volumen){
        this.repObject.setVolume(volumen);
    }

    stop(){
        this.repObject.stop();
        //this.reproduciendo = false;
    }

    dimeCapitulo():string{
        return ('**************** El capítulo es:' + this.capitulo==null?'Sin capítulo definido':this.capitulo);
    }

}

 