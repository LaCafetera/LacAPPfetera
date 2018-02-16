import { Injectable, Component, OnDestroy /*, Output, EventEmitter*/ } from '@angular/core';
import { File } from '@ionic-native/file';
import { Media, MediaObject } from '@ionic-native/media';
import { Events } from 'ionic-angular';
import { ConfiguracionService } from '../providers/configuracion.service';

//declare var cordova: any;

@Injectable()
@Component({
    providers: [File, Media, MediaObject]
})

export class PlayerIOS implements OnDestroy {

  //  private repPlugin: MediaPlugin;
    private repObject: MediaObject;
  //  private _configuracion: ConfiguracionService;

    private capitulo: string ="";
    private descargado:boolean = false;
    //private reproduciendo:boolean = false;
    private statusRep:number;
/*
    public MEDIA_NONE = 0; // MediaPlugin.MEDIA_NONE;
    public MEDIA_STARTING = 1; // this.media.MEDIA_STARTING;
    public MEDIA_RUNNING = 2; // this.media.MEDIA_RUNNING;
    public MEDIA_PAUSED = 3; // this.media.MEDIA_PAUSED;
    public MEDIA_STOPPED = 4; // this.media.MEDIA_STOPPED;

    public MEDIA_ERR_ABORTED = 1; // this.media.MEDIA_ERR_ABORTED;
    public MEDIA_ERR_DECODE = 3; // this.media.MEDIA_ERR_DECODE;
    public MEDIA_ERR_NETWORK =  2; //this.media.MEDIA_ERR_NETWORK;
    public MEDIA_ERR_NONE_SUPPORTED = 4; // this.media.MEDIA_ERR_NONE_SUPPORTED;
*/
    seekPdte:boolean = false;
    ubicacionAudio:string ="";
    //audioRecibido: string = "";
    // Cuando damos a pause / stop y la reproducción está en MEDIA_STARTING, no para la descarga del buffer, ni se lo guarda ni nada. Así que hay que hacer 
    // una guarrería.
    paradaEncolada: boolean = false;

    constructor(public media: Media, 
                private file: File, 
                private configuracion: ConfiguracionService, 
                public events: Events){

        file.resolveLocalFilesystemUrl(file.dataDirectory)
            .then((entry)=>{
                this.ubicacionAudio = entry.toInternalURL();
                //this.crearepPlugin (audio);
            })
            .catch((error)=>{console.log("[PLAYERIOS] ERROR RECUPERANDO UBICACIÓN DE AUDIO:" + error)});
//        this.repPlugin = new MediaPlugin ();
    }

    ngOnDestroy(){
        if (this.statusRep == this.media.MEDIA_PAUSED || this.statusRep == this.media.MEDIA_STOPPED ){
            console.log("[PLAYERIOS.ngOnDestroy] Reproducción parada; guardando posición. ")
            let capitulo = this.dameCapitulo();
            console.log("[PLAYERIOS.ngOnDestroy] Guardando posición para capítulo " + capitulo);
            this.repObject.getCurrentPosition()
            .then((pos)=>{
                console.log("[PLAYERIOS.ngOnDestroy] Recibida posición " + pos * 1000);
                if (pos > 0) {
                    this.configuracion.setTimeRep(capitulo, pos * 1000);
                }
            })
            .catch ((err)=> {
                console.log ("[PLAYERIOS.ngOnDestroy] Recibido error al pedir posición de reproducción: " + err);
            });
        }
        console.log("[PLAYERIOS.ngOnDestroy] Saliendo");
    }

    ionViewWillUnload() {
        console.log("[PLAYERIOS.ionViewWillUnload] Cerrandoooooooooooooooooooooooo");
    }

    public crearepPlugin (audio:string, configuracion: ConfiguracionService): MediaObject { //Promise<any>{
        console.log("[PLAYERIOS.crearepPlugin] recibida petición de audio: " + audio);
        //this._configuracion = configuracion;
        //this.audioRecibido = audio;
        this.capitulo = this.traduceAudio(audio);
        this.seekPdte = true;
        const onStatusUpdate = ((status) =>{
            console.log("[PLAYERIOS.crearepPlugin] actualizado status de la reproducción a " + status + " - " + this.media.MEDIA_RUNNING);
            this.statusRep = status;
            this.events.publish('reproduccion:status', {status:this.statusRep});
            if (this.seekPdte && status == this.media.MEDIA_RUNNING){
                let capitulo = this.dameCapitulo();
                configuracion.getTimeRep(capitulo)
                .then((val)=> {
                    console.log("[PLAYERIOS.crearepPlugin] recibida posición de reproducción " + val + " para el capítulo " + capitulo );
                    if (val != null && Number(val) > 0){
                        this.seekTo (Number(val));
                    }
                }).catch(()=>{
                    console.log("[PLAYERIOS.crearepPlugin] Error recuperando posición de la reproducción.");
                });
                this.seekPdte = false;
            }
            if (this.paradaEncolada && status == this.media.MEDIA_RUNNING){
                this.pause(configuracion);
                this.paradaEncolada = false;
            }
        });
        const onSuccess = () => console.log('[PLAYERIOS.crearepPlugin] Reproduciendo OK');
        const onError = (error) => {
            this.events.publish('errorReproduccion:status', {status:error.code});
            console.error("[PLAYERIOS.crearepPlugin] Error en reproducción código " + error.code + " - " + error.message);
        }
        console.log("[PLAYERIOS.crearepPlugin] Tratando de reproducir:" + this.capitulo);
        this.repObject = this.media.create (this.capitulo);
        this.repObject.onStatusUpdate.subscribe(onStatusUpdate);
        this.repObject.onSuccess.subscribe(onSuccess);
        this.repObject.onError.subscribe(onError);
        return (this.repObject);
    }

    public dameStatus(){
        return this.statusRep;
    }

    public dameStatusRep(){
        return this.media.MEDIA_RUNNING;
    }

    public dameStatusPause(){
        return this.media.MEDIA_PAUSED;
    }

    public dameStatusStop(){
        return this.media.MEDIA_STOPPED;
    }

    public dameStatusStarting(){
        return this.media.MEDIA_STARTING;
    }

    traduceAudio(audio):string{
        return (audio.includes('mp3')?this.ubicacionAudio + this.extraeCapitulo(audio) + ".mp3":audio);
    }

    public dameCapitulo():string{
        return (this.extraeCapitulo(this.capitulo));
    }

    extraeCapitulo(capituloEntrada):string{
        let inicio:number;
        let fin:number;
        console.log("[PLAYERIOS.extraeCapitulo] Extrayendo capítulo de la cadena "+ capituloEntrada);
        if (capituloEntrada != null){
            if (capituloEntrada.includes('play')){
                fin = capituloEntrada.length-5;
            }
            else if (capituloEntrada.includes('stream')){
                fin = capituloEntrada.length-7;
            }
            else {
                fin = capituloEntrada.length-4;
            }
            inicio = capituloEntrada.substring(0, fin).lastIndexOf("/")+1;
            console.log("[PLAYERIOS.extraeCapitulo] Devolviendo "+ capituloEntrada.substring(inicio, fin));
            return (capituloEntrada.substring(inicio, fin));
        }
        else {
            console.log("[PLAYERIOS.extraeCapitulo] Devolviendo cadena vacía");
            return ("");
        }
    }

    capDescargado (idDescargado){
        this.descargado = idDescargado;
    }
    
    getCurrentPosition(){
        return this.repObject.getCurrentPosition();
    }
    
    getDuration(){
        return this.repObject.getDuration();
    }

    getCurrentAmplitude(){
        return this.repObject.getCurrentAmplitude();
    }

    reproduciendoEste(audio):boolean{
        console.log ("[PLAYERIOS.reproduciendoEste] que dicen que si es el mismo audio este: "+ audio + " y este: "+ this.capitulo );
        return (/*audio == this.capitulo || */this.capitulo.includes(audio));
    }
/*
    continuaPlayStreaming (tiempoSeek: number){
        console.log ("[PLAYERIOS.continuaPlayStreaming] Play rápido posicionando en " + tiempoSeek );
        // this.repObject.stop(); YA está parado, así que parar lo parado da error.
        this.repObject.play();
        this.repObject.seekTo(tiempoSeek);
    }
*/
    play(audioIn: string, configuracion: ConfiguracionService):boolean{
        /*console.log ("[PLAYERIOS.play] Recibida petición de reproducción de "+ audioIn );
		let capitulo = this.dameCapitulo();
        let audio = this.traduceAudio(audioIn);
        console.log ("[PLAYERIOS.play] traducimos audio a reproducir a "+ audio );
        if (this.reproduciendoEste(audio))
        {*/
            console.log ("[PLAYERIOS.play] Play normal");
            this.repObject.play(); //this.repPlugin.play([repeticiones, sonarBloqueado]);
            return (false);
        /*}
        else{
            console.log ("[PLAYERIOS.play] Modificado audio");
            if (this.repObject != null) {
                this.repObject.getCurrentPosition()
                    .then((pos)=>{
                        console.log("[PLAYERIOS.play] Recibida posición " + pos * 1000 + " para el capítulo "+ capitulo+ ". Guardando posición.");
                        if (pos > 0 && capitulo != ""){
                            configuracion.setTimeRep(capitulo, pos * 1000);
                            console.log ("[PLAYERIOS.play] Guardando la posición en la configuración");
                        }
                    })
                    .catch ((err)=> {
                        console.log ("[PLAYERIOS.play] Recibido error al pedir posición de reproducción: " + err);
                    });
                this.repObject.stop();
                this.repObject.release();
            }
            this.capitulo = audio;
            this.seekPdte = true;
            this.repObject = this.crearepPlugin (audio, configuracion);
            console.log("[PLAYERIOS.play] Objeto reproductor creado."); 
            this.repObject.play();
            return (true);
        }*/
    }

    cerrarAudio (){
        console.log ("[PLAYERIOS.play] Modificado audio");
        let capitulo = this.dameCapitulo();
        if (this.repObject != null) {
            this.repObject.getCurrentPosition()
                .then((pos)=>{
                    console.log("[PLAYERIOS.play] Recibida posición " + pos * 1000 + " para el capítulo "+ capitulo+ ". Guardando posición.");
                    if (pos > 0 && capitulo != ""){
                        this.configuracion.setTimeRep(capitulo, pos * 1000);
                        console.log ("[PLAYERIOS.play] Guardando la posición en la configuración");
                    }
                })
                .catch ((err)=> {
                    console.log ("[PLAYERIOS.play] Recibido error al pedir posición de reproducción: " + err);
                });
            this.repObject.stop();
            this.repObject.release();
        }
    }

    resume(){
        this.repObject.play();
    }

    guardaPos(configuracion: ConfiguracionService){
        this.repObject.getCurrentPosition()
            .then((pos)=>{
                console.log("[PLAYERIOS.guardaPos] Recibida posición " + pos * 1000);
                if (pos > 0) {
                    configuracion.setTimeRep(this.dameCapitulo(), pos * 1000);
                }
                else { // Cuando la reproducción está parada, la posición es -1
                    configuracion.setTimeRep(this.dameCapitulo(), 0);
                }
            })
            .catch ((err)=> {
                console.log ("[PLAYERIOS.guardaPos] Recibido error al pedir posición de reproducción: " + err);
            });
    }

    pause(configuracion: ConfiguracionService){
        if (this.repObject != null){
            console.log ("[PLAYERIOS.pause] repObject no es nulo " + this.statusRep + " - " + this.media.MEDIA_RUNNING);
            this.guardaPos(configuracion);
            if (this.statusRep != this.media.MEDIA_RUNNING){
                this.repObject.stop();    
            }
            else {
                this.repObject.pause();
            }
            if (this.statusRep == this.media.MEDIA_STARTING)
                {
                    //Hay un fallo en este plugin. Si damos a pause / stop cuando está en "MEDIA_STARTING no nos hace ni caso. ASí que hay que parchear."
                    console.log ("[PLAYERIOS.pause] Dejando parada en espera");
                    this.paradaEncolada = true;
                    this.events.publish('reproduccion:status', {status:this.media.MEDIA_PAUSED});
                }
        }
        else {
            console.log ("[PLAYERIOS.pause] repObject es nulo ");
        }
    }

    release(configuracion: ConfiguracionService){
        if (this.repObject != null){
            this.guardaPos(configuracion);
            this.repObject.release();
            console.log ("[PLAYERIOS.release] EJECUTADO RELEASE");
        }
        //this.reproduciendo = false;
    }

    adelantaRep(){
        this.getCurrentPosition()
            .then((position)=>{
                this.seekTo((position+15)*1000);
            })
            .catch(() =>{
                console.log("[PLAYERIOS.retrocedeRep] Error retrocediendo.")
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
                console.log("[PLAYERIOS.retrocedeRep] Error retrocediendo.")
            });
    }

    seekTo(milisegundos:number){
        if (milisegundos == 0){
            // Hay un bug; si es cero no hace ni caso,así que lo pondremos a 1 milisegundo, que para el caso...
            this.repObject.seekTo(1);    
        }
        else {
            this.repObject.seekTo(milisegundos);
        }
    }

    setVolume(volumen){
        this.repObject.setVolume(volumen);
    }

    stop(){
        this.repObject.stop();
        //this.reproduciendo = false;
    }

}

 