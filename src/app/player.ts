import { Injectable, Component, OnDestroy /*, Output, EventEmitter*/ } from '@angular/core';
import { File } from '@ionic-native/file';
import { MediaPlugin, MediaObject } from '@ionic-native/media';
import { Events } from 'ionic-angular';
import { ConfiguracionService } from '../providers/configuracion.service';

//declare var cordova: any;

@Injectable()
@Component({
    providers: [File, MediaPlugin]
})

export class Player implements OnDestroy {

  //  private repPlugin: MediaPlugin;
    private repObject: MediaObject;
  //  private _configuracion: ConfiguracionService;

    private capitulo: string ="";
    private descargado:boolean = false;
    //private reproduciendo:boolean = false;
    private statusRep:number;
/*
    public MEDIA_NONE = 0; // MediaPlugin.MEDIA_NONE;
    public MEDIA_STARTING = 1; // this.repPlugin.MEDIA_STARTING;
    public MEDIA_RUNNING = 2; // this.repPlugin.MEDIA_RUNNING;
    public MEDIA_PAUSED = 3; // this.repPlugin.MEDIA_PAUSED;
    public MEDIA_STOPPED = 4; // this.repPlugin.MEDIA_STOPPED;

    public MEDIA_ERR_ABORTED = 1; // this.repPlugin.MEDIA_ERR_ABORTED;
    public MEDIA_ERR_DECODE = 3; // this.repPlugin.MEDIA_ERR_DECODE;
    public MEDIA_ERR_NETWORK =  2; //this.repPlugin.MEDIA_ERR_NETWORK;
    public MEDIA_ERR_NONE_SUPPORTED = 4; // this.repPlugin.MEDIA_ERR_NONE_SUPPORTED;
*/
    seekPdte:boolean = false;
    ubicacionAudio:string ="";
    audioRecibido: string = "";
    // Cuando damos a pause / stop y la reproducción está en MEDIA_STARTING, no para la descarga del buffer, ni se lo guarda ni nada. Así que hay que hacer 
    // una guarrería.
    paradaEncolada: boolean = false;

    constructor(public repPlugin: MediaPlugin, 
                private file: File, 
                private configuracion: ConfiguracionService, 
                public events: Events){

        file.resolveLocalFilesystemUrl(file.dataDirectory)
            .then((entry)=>{
                this.ubicacionAudio = entry.toInternalURL();
                //this.crearepPlugin (audio);
            })
            .catch((error)=>{console.log("[PLAYER] ERROR RECUPERANDO UBICACIÓN DE AUDIO:" + error)});
//        this.repPlugin = new MediaPlugin ();
    }

    ngOnDestroy(){
        if (this.statusRep == this.repPlugin.MEDIA_PAUSED || this.statusRep == this.repPlugin.MEDIA_STOPPED ){
            console.log("[PLAYER.ngOnDestroy] Reproducción parada; guardando posición. ")
            let capitulo = this.dameCapitulo();
            console.log("[PLAYER.ngOnDestroy] Guardando posición para capítulo " + capitulo);
            this.repObject.getCurrentPosition()
            .then((pos)=>{
                console.log("[PLAYER.ngOnDestroy] Recibida posición " + pos * 1000);
                if (pos > 0) {
                    this.configuracion.setTimeRep(capitulo, pos * 1000);
                }
            })
            .catch ((err)=> {
                console.log ("[PLAYER.ngOnDestroy] Recibido error al pedir posición de reproducción: " + err);
            });
        }
        console.log("[PLAYER.ngOnDestroy] Saliendo");
    }

    ionViewWillUnload() {
        console.log("[PLAYER.ionViewWillUnload] Cerrandoooooooooooooooooooooooo");
    }

    public crearepPlugin (audio:string, configuracion: ConfiguracionService): MediaObject { //Promise<any>{
        console.log("[PLAYER.crearepPlugin] recibida petición de audio: " + audio);
        //this._configuracion = configuracion;
        this.audioRecibido = audio;
        const onStatusUpdate = ((status) =>{
            console.log("[PLAYER.crearepPlugin] actualizado status de la reproducción a " + status + " - " + this.repPlugin.MEDIA_RUNNING);
            this.statusRep = status;
            this.events.publish('reproduccion:status', {status:this.statusRep});
            if (this.seekPdte && status == this.repPlugin.MEDIA_RUNNING){
                let capitulo = this.dameCapitulo();
                configuracion.getTimeRep(this.dameCapitulo())
                .then((val)=> {
                    console.log("[PLAYER.crearepPlugin] recibida posición de reproducción " + val + " para el capítulo " + capitulo );
                    if (val != null && Number(val) > 0){
                        this.seekTo (Number(val));
                    }
                }).catch(()=>{
                    console.log("[PLAYER.crearepPlugin] Error recuperando posición de la reproducción.");
                });
                this.seekPdte = false;
            }
            if (this.paradaEncolada && status == this.repPlugin.MEDIA_RUNNING){
                this.pause(configuracion);
                this.paradaEncolada = false;
            }
        });
        const onSuccess = () => console.log('[PLAYER.crearepPlugin] Reproduciendo OK');
        const onError = (error) => {
            console.error("[PLAYER.crearepPlugin] Error en reproducción código " + error.code + " - " + error.message);
        }
        if (audio.includes('mp3')){
            console.log("[PLAYER.crearepPlugin] Tratando de reproducir:"+ this.ubicacionAudio + this.extraeCapitulo(audio) + ".mp3");
            return(this.repPlugin.create (this.ubicacionAudio + this.extraeCapitulo(audio) + ".mp3", onStatusUpdate, onSuccess, onError));
        }
        else {
            console.log("[PLAYER.crearepPlugin] Tratando de reproducir:"+ audio);
            //return(this.repPlugin.create (audio+".mp3?application_id=cG9J6z16F2qHtZFr3w79sdf1aYqzK6ST", onStatusUpdate));
            //return(this.repPlugin.create (audio+".mp3", onStatusUpdate, onSuccess, onError));
            return(this.repPlugin.create (audio, onStatusUpdate, onSuccess, onError));
        }
    }

    public dameStatus(){
        return this.statusRep;
    }

    public dameStatusRep(){
        return this.repPlugin.MEDIA_RUNNING;
    }

    public dameStatusPause(){
        return this.repPlugin.MEDIA_PAUSED;
    }

    public dameStatusStop(){
        return this.repPlugin.MEDIA_STOPPED;
    }

    public dameStatusStarting(){
        return this.repPlugin.MEDIA_STARTING;
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
    
    getDuration(){
        return this.repObject.getDuration();
    }

    getCurrentAmplitude(){
        return this.repObject.getCurrentAmplitude();
    }

    reproduciendoEste(audio):boolean{
        console.log ("[PLAYER.reproduciendoEste] que dicen que si es el mismo audio este: "+ audio + " y este: "+ this.capitulo );
        return (/*audio == this.capitulo || */this.capitulo.includes(audio));
    }

    continuaPlayStreaming (tiempoSeek: number){
        console.log ("[PLAYER.continuaPlayStreaming] Play rápido posicionando en " + tiempoSeek );
        this.repObject.stop();
        this.repObject.play();
        this.repObject.seekTo(tiempoSeek);
    }

    play(audio: string, configuracion: ConfiguracionService):boolean{
        console.log ("[PLAYER.play] Recibida petición de reproducción de "+ audio );
		let capitulo = this.dameCapitulo();
        audio = this.traduceAudio(audio);
        console.log ("[PLAYER.play] traducimos audio a reproducir a "+ audio );
        if (this.reproduciendoEste(audio))
        {
            console.log ("[PLAYER.play] Play normal");
            this.repObject.play(); //this.repPlugin.play([repeticiones, sonarBloqueado]);
            return (false);
        }
        else{
            console.log ("[PLAYER.play] Modificado audio");
            if (this.repObject != null) {
                this.repObject.getCurrentPosition()
                    .then((pos)=>{
                        console.log("[PLAYER.play] Recibida posición " + pos * 1000 + " para el capítulo "+ capitulo+ ". Guardando posición.");
                        if (pos > 0 && capitulo != ""){
                            configuracion.setTimeRep(capitulo, pos * 1000);
                            console.log ("[PLAYER.play] Guardando la posición en la configuración");
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
            this.repObject = this.crearepPlugin (audio, configuracion);
            console.log("[PLAYER.play] Objeto reproductor creado."); 
            this.repObject.play();
            return (true);
        }
    }

    resume(){
        this.repObject.play();
    }

    guardaPos(configuracion: ConfiguracionService){
        this.repObject.getCurrentPosition()
            .then((pos)=>{
                console.log("[PLAYER.guardaPos] Recibida posición " + pos * 1000);
                if (pos > 0) {
                    configuracion.setTimeRep(this.dameCapitulo(), pos * 1000);
                }
                else { // Cuando la reproducción está parada, la posición es -1
                    configuracion.setTimeRep(this.dameCapitulo(), 0);
                }
            })
            .catch ((err)=> {
                console.log ("[PLAYER.guardaPos] Recibido error al pedir posición de reproducción: " + err);
            });

    }

    pause(configuracion: ConfiguracionService){
        if (this.repObject != null){
            console.log ("[PLAYER.pause] repObject no es nulo ");
            this.guardaPos(configuracion);
            this.repObject.pause();
            if (this.statusRep == this.repPlugin.MEDIA_STARTING)
                {
                    //Hay un fallo en este plugin. Si damos a pause / stop cuando está en "MEDIA_STARTING no nos hace ni caso. ASí que hay que parchear."
                    console.log ("[PLAYER.pause] Dejando parada en espera");
                    this.paradaEncolada = true;
                    this.events.publish('reproduccion:status', {status:this.repPlugin.MEDIA_PAUSED});
                }
        }
        else {
            console.log ("[PLAYER.pause] repObject es nulo ");
        }
    }

    release(configuracion: ConfiguracionService){
        if (this.repObject != null){
            this.guardaPos(configuracion);
            this.repObject.release();
            console.log ("[PLAYER.release] EJECUTADO RELEASE");
        }
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
 //       console.log("[PLAYER.seekTo] Recibidos " + milisegundos + " milésimas de segundo.")
        if (milisegundos == 0){
            // Hay un bug; si es cero no hace ni caso,así que lo pondremos a 1 milisegundo, que para el caso...
            this.repObject.seekTo(1);    
        }
        else {
            this.getCurrentPosition()
            .then((position)=>{
                let diferencia = Number(position*1000) - milisegundos;
 //               console.log("[PLAYER.seekTo] " + diferencia + " " + position + " " + milisegundos + "--------------------------------------------------------");
                if (Math.abs(diferencia) > 100){
                    this.repObject.seekTo(milisegundos);
                    console.log("[PLAYER.seekTo] Me han pedido hacer un cambio de posición de " + milisegundos + "milésimas de segundo.")
                }
                else{
 //                   console.log("[PLAYER.seekTo] Me han pedido hacer un cambio de posición de " + diferencia + " milésimas de segundo. Paso 1000.")
                }
            })
            .catch(() =>{
                this.repObject.seekTo(milisegundos);
                console.log("[PLAYER.seekTo] No he podido ver por dónde vamos, así que obedezco.")
            });
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

 