import { Injectable, Component, OnDestroy /*, Output, EventEmitter*/ } from '@angular/core';
import { File } from '@ionic-native/file';
import { AndroidExoplayer, AndroidExoPlayerParams, AndroidExoPlayerAspectRatio, AndroidExoPlayerControllerConfig, AndroidExoplayerState } from '@ionic-native/android-exoplayer';
import { Events } from 'ionic-angular';
import { ConfiguracionService } from '../providers/configuracion.service';

//declare var cordova: any;

@Injectable()
@Component({
    providers: [File, AndroidExoplayer]
})

export class PlayerAndroid implements OnDestroy {


    private capitulo: string ="";
    private descargado:boolean = false;
    private statusRep:number;

    seekPdte:boolean = false;
    ubicacionAudio:string ="";
    //audioRecibido: string = "";
    paradaEncolada: boolean = false;
    timerVigila: number = 0;
    timerGetReady: number = 0;

    estadoExo: AndroidExoplayerState = null;
    estadoPlayer = { 
        MEDIA_NONE : 0,
        MEDIA_STARTING : 1,
        MEDIA_RUNNING : 2,
        MEDIA_PAUSED : 3,
        MEDIA_STOPPED : 4,
        MEDIA_PAUSANDO : 5
    }

    estado : number = this.estadoPlayer.MEDIA_NONE;

    aspecto: AndroidExoPlayerAspectRatio = 'FILL_SCREEN';
    controlador: AndroidExoPlayerControllerConfig = { // If this object is not present controller will not be visible
        streamImage: 'https://d1bm3dmew779uf.cloudfront.net/large/1e40f2bb313c60fabc2ef6ae4ef65573.jpg',
        streamTitle: '#LaCafeteraDeLasMujeres',
        streamDescription: '',//Hoy, además de la actualidad, videoforum, con los oyentes sobre la película \'La fuente de las mujeres\'',
        hideProgress: true, // Hide entire progress timebar
        hidePosition: false, // If timebar is visible hide current position from it
        hideDuration: false, // If timebar is visible Hide stream duration from it
        controlIcons: null
    }
    params: AndroidExoPlayerParams = {
        //url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/WYEPFMAAC.aac',
        url: 'https://api.spreaker.com/v2/episodes/13949915/stream',
        userAgent: 'ExoPlayerPlugin', // default is 'ExoPlayerPlugin''MyAwesomePlayer'
        aspectRatio: this.aspecto,//'FILL_SCREEN', // default is FIT_SCREEN
        hideTimeout: 5000, // Hide controls after this many milliseconds, default is 5 sec
        autoPlay: false, // When set to false stream will not automatically start
        seekTo: 0, // Start playback 10 minutes into video specified in ms, default is 0
        forwardTime: 15 * 1000, // Amount of time in ms to use when skipping forward, default is 1 min
        rewindTime: 15 * 1000, // Amount of time in ms to use when skipping backward, default is 1 min
        audioOnly: true, // Only play audio in the backgroud, default is false.
        //subtitleUrl: '', // Optional subtitle url
        connectTimeout: 1000, // okhttp connect timeout in ms (default is 0)
        readTimeout: 1000, // okhttp read timeout in ms (default is 0)
        writeTimeout: 1000, // okhttp write timeout in ms (default is 0)
        pingInterval: 1000, // okhttp socket ping interval in ms (default is 0 or disabled)
        retryCount: 5, // number of times datasource will retry the stream before giving up (default is 3)
        controller: this.controlador
    }

    constructor(private androidExoplayer: AndroidExoplayer,
                private file: File, 
                private configuracion: ConfiguracionService, 
                public events: Events){

        file.resolveLocalFilesystemUrl(file.dataDirectory)
            .then((entry)=>{
                this.ubicacionAudio = entry.toInternalURL();
                //this.crearepPlugin (audio);
            })
            .catch((error)=>{
                console.log("[PLAYERANDROID] ERROR RECUPERANDO UBICACIÓN DE AUDIO:" + error)
            });
//        this.repPlugin = new MediaPlugin ();
    }

    ngOnDestroy(){
        this.androidExoplayer.close()
        .then(()=>{
            console.log("[PLAYERANDROID.ngOnDestroy] close OK ");
            this.estado = this.estadoPlayer.MEDIA_STOPPED;
        })
        .catch ((err)=> {
            console.log("[PLAYERANDROID.ngOnDestroy] close KO ");
        });
        console.log("[PLAYERANDROID.ngOnDestroy] Saliendo");
        this.inVigilando(false);
    }

    ionViewWillUnload() {
        console.log("[PLAYERANDROID.ionViewWillUnload] Cerrandoooooooooooooooooooooooo");
    }

    private inVigilando (interruptor:boolean){
        var _that = this;
        if (interruptor) {
            if (this.timerVigila == 0){
                this.timerVigila = setInterval(() =>{
                    this.actualizaStatus();
                }, 500);
            }
        }
        else {
            clearInterval(this.timerVigila);
        }
    }
    
    actualizaStatus(){
        this.androidExoplayer.getState()
        .then((datos)=>{
            // console.log("[PLAYERANDROID.actualizaStatus] Estado recibido: " + JSON.stringify(datos));
            this.estadoExo=datos;
        })
        .catch ((err)=> {
            console.log("[PLAYERANDROID.actualizaStatus] getState KO: " + err);
        });
        if (this.estadoExo.playbackState == "STATE_READY"){ //Saco esto fuera porque si está dentro del ((datos) no sabemos quien es this.
            if (this.estadoExo.playWhenReady == "false" && this.estado != this.estadoPlayer.MEDIA_PAUSED){
                this.estado = this.estadoPlayer.MEDIA_PAUSED;
                this.publicaEstado();
            }
            else if (this.estadoExo.playWhenReady == "true" && this.estado != this.estadoPlayer.MEDIA_RUNNING){
                this.estado = this.estadoPlayer.MEDIA_RUNNING;
                this.publicaEstado();                
            }    
        }
        else if (this.estadoExo.playbackState == "STATE_ENDED" && this.estado != this.estadoPlayer.MEDIA_STOPPED){
            this.estado = this.estadoPlayer.MEDIA_STOPPED;
            this.publicaEstado();                
        }
        //console.log("[PLAYERANDROID.actualizaStatus] PAQUETE: " + JSON.stringify(this.estadoExo));
    }

    publicaEstado (){
        this.events.publish('reproduccion:status', {status:this.estado});
    }

    public crearepPlugin (audio:string, configuracion: ConfiguracionService, autoplay: boolean) {
        console.log("[PLAYERANDROID.crearepPlugin] recibida petición de audio: " + audio);
        //this.audioRecibido = audio;
        this.capitulo = audio;
        this.params.url = audio;
        
        configuracion.getTimeRep(this.dameCapitulo())
        .then((data) => {
            this.estado = this.estadoPlayer.MEDIA_STOPPED;
            this.params.seekTo = Number(data)/1000;
            this.androidExoplayer.show(this.params).subscribe
            ((data) => {
                console.log("[PLAYERANDROID.crearepPlugin] recibidos datos " + JSON.stringify(data))
                if (this.estadoExo == null){
                    this.estadoExo = data;                    
                } 
                this.inVigilando(true);
            }),
            ((error) => console.log("recibido error " + error));
            if (this.estado == this.estadoPlayer.MEDIA_NONE || 
                this.estado == this.estadoPlayer.MEDIA_PAUSED || 
                this.estado == this.estadoPlayer.MEDIA_STOPPED) {
                this.estado = this.estadoPlayer.MEDIA_STARTING;
                this.publicaEstado ();
            }
        })
        .catch (() => {
            this.params.seekTo = 0;
            this.androidExoplayer.show(this.params).subscribe
            ((data) => {
                console.log("recibidos datos " + JSON.stringify(data))
                if (this.estadoExo == null){
                    this.estadoExo = data;                    
                } 
                this.inVigilando(true);
            }),
            ((error) => console.log("recibido error " + error));
            if (this.estado == this.estadoPlayer.MEDIA_NONE || 
                this.estado == this.estadoPlayer.MEDIA_PAUSED || 
                this.estado == this.estadoPlayer.MEDIA_STOPPED) {
                this.estado = this.estadoPlayer.MEDIA_STARTING;
                this.publicaEstado ();
            }
        })

        //this.androidExoplayer.playPause(); // cuando pueda instalar una versión > 2.5.0 esto no hará falta.
    }

    private preparado() {
        return new Promise(resolve => this.timerGetReady = setInterval(() => {
            console.log("Promesas que no valen nada " + this.estado + ' - ' + this.estadoPlayer.MEDIA_NONE); 
            if (this.estado != this.estadoPlayer.MEDIA_NONE) {
                console.log("Promesas que no valen nada  resolviendo");
                clearInterval(this.timerGetReady);
                this.timerGetReady = 0;
                resolve (true);
            }
        }, 500));
    }

    public dameStatus(){
        return (this.estado);
    }

    public dameStatusRep(){
        return (this.estadoPlayer.MEDIA_RUNNING);
    }

    public dameStatusPause(){
        return (this.estadoPlayer.MEDIA_PAUSED);
    }

    public dameStatusStop(){
        return (this.estadoPlayer.MEDIA_STOPPED);
    }

    public dameStatusStarting(){
        return (this.estadoPlayer.MEDIA_STARTING);
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
        console.log("[PLAYERANDROID.extraeCapitulo] Extrayendo capítulo de la cadena "+ capituloEntrada);
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
            console.log("[PLAYERANDROID.extraeCapitulo] Devolviendo "+ capituloEntrada.substring(inicio, fin));
            return (capituloEntrada.substring(inicio, fin));
        }
        else {
            console.log("[PLAYERANDROID.extraeCapitulo] Devolviendo cadena vacía");
            return ("");
        }
    }

    capDescargado (idDescargado){
        this.descargado = idDescargado;
    }
    
    getCurrentPosition(){
        let posicion = new Promise ((resolve, reject) => {
            resolve(parseInt(this.estadoExo.position) / 1000); // Para que sea igual que el de iOS :-p
        });
        return (posicion);
    }
    
    getDuration(): number{
        return (parseInt(this.estadoExo.duration));
    }

    getCurrentAmplitude(){
        return 0;//todo
    }

    reproduciendoEste(audio):boolean{
        console.log ("[PLAYERANDROID.reproduciendoEste] que dicen que si es el mismo audio este: "+ audio + " y este: "+ this.capitulo );
        return (this.capitulo.includes(audio));
    }

    continuaPlayStreaming (tiempoSeek: number){
        console.log ("[PLAYERANDROID.continuaPlayStreaming] Play rápido posicionando en " + tiempoSeek );
        this.androidExoplayer.playPause()
        .then(()=>{
            console.log("[PLAYERANDROID.continuaPlayStreaming] playPause OK ");
            if (this.estado == this.estadoPlayer.MEDIA_RUNNING)
            {
                this.estado = this.estadoPlayer.MEDIA_PAUSED;
            }
            else if (this.estado == this.estadoPlayer.MEDIA_PAUSED)
            {
                this.estado = this.estadoPlayer.MEDIA_RUNNING;
            }
            this.publicaEstado ();
        })
        .catch ((err)=> {
            console.log("[PLAYERANDROID.continuaPlayStreaming] playPause KO ");
        });
        this.androidExoplayer.seekTo(tiempoSeek)
        .then(()=>{
            console.log("[PLAYERANDROID.continuaPlayStreaming] seekTo OK ");
        })
        .catch ((err)=> {
            console.log("[PLAYERANDROID.continuaPlayStreaming] seekTo KO ");
        });
    }

    async play(audioIn: string, configuracion: ConfiguracionService){//:boolean{
        console.log ("[PLAYERANDROID.play] Play normal");
        await this.preparado(); // Cuando estemos preparados, seguimos.
        console.log ("[PLAYERANDROID.play] *********************************************************************************************");
        this.androidExoplayer.playPause()
        .then(()=>{
            console.log("[PLAYERANDROID.play] playPause OK "); 
        })
        .catch ((err)=> {
            console.log("[PLAYERANDROID.play] playPause KO " + err);
        });
        if (this.estado == this.estadoPlayer.MEDIA_RUNNING)
        {
            this.estado = this.estadoPlayer.MEDIA_PAUSED;
            this.guardaPos(configuracion);
        }
        else if (this.estado == this.estadoPlayer.MEDIA_NONE ||
                    this.estado == this.estadoPlayer.MEDIA_PAUSED)
        {
            this.estado = this.estadoPlayer.MEDIA_STARTING;
        }
        this.publicaEstado ();
        //return (true);
    }

    cerrarAudio (){
        if (this.androidExoplayer != null) {
            this.guardaPos(this.configuracion);
            if (this.estado != this.estadoPlayer.MEDIA_STOPPED) {
                this.androidExoplayer.stop();
            }
            this.androidExoplayer.close();
        }
    }

    resume(){
        this.androidExoplayer.playPause()
        .then(()=>{
            console.log("[PLAYERANDROID.resume] playPause OK ");
            this.estado = this.estadoPlayer.MEDIA_RUNNING;
            this.publicaEstado ();
        })
        .catch ((err)=> {
            console.log("[PLAYERANDROID.resume] playPause KO " + err);
        });
    }

    guardaPos(configuracion: ConfiguracionService){
        if (this.estadoExo != null) {
            let posicionNum = parseInt(this.estadoExo.position);
            let capitulo = this.dameCapitulo();
            if (posicionNum > 0 && capitulo != ""){
                configuracion.setTimeRep(capitulo, posicionNum * 1000);
                console.log ("[PLAYERIOS.guardaPos] Guardando la posición en la configuración");
            }
            else{
                console.log ("[PLAYERIOS.guardaPos] No guardando la posición en la configuración " + posicionNum + " - " + capitulo);
            }
        }
        else{
            console.log ("[PLAYERIOS.guardaPos] No guardando la posición en la configuración porque no hemos comenzado ninguna reproducción");
        }
    }

    pause(configuracion: ConfiguracionService){
        this.guardaPos(configuracion);
        this.androidExoplayer.playPause()
        .then(()=>{
            console.log("[PLAYERANDROID.pause] playPause OK ");
            this.estado = this.estadoPlayer.MEDIA_PAUSED;
            this.publicaEstado ();
        })
        .catch ((err)=> {
            console.log("[PLAYERANDROID.pause] playPause KO " + err);
        });
    }

    release(configuracion: ConfiguracionService){
        this.guardaPos(configuracion);
        this.androidExoplayer.close()
        .then(()=>{
            console.log("[PLAYERANDROID.release] close OK ");
            this.estado = this.estadoPlayer.MEDIA_STOPPED;
            this.publicaEstado ();
        })
        .catch ((err)=> {
            console.log("[PLAYERANDROID.release] close KO " + err);
        });
        this.estado = this.estadoPlayer.MEDIA_STOPPED;
        this.publicaEstado ();
        // this.guardaPos(configuracion); //TODO
        this.inVigilando(false);
        console.log ("[PLAYERANDROID.release] EJECUTADO RELEASE");
    }

    adelantaRep(){
        //this.androidExoplayer.seekBy(15000)
        this.androidExoplayer.seekTo(parseInt(this.estadoExo.position) + 15000)
        .then(()=>{
            console.log("[PLAYERANDROID.adelantaRep] seekBy OK ");
        })
        .catch ((err)=> {
            console.log("[PLAYERANDROID.adelantaRep] seekBy KO " + err);
        });
    }

    retrocedeRep(){
        //this.androidExoplayer.seekBy(-15000)
        this.androidExoplayer.seekTo(parseInt(this.estadoExo.position) - 15000)
        .then(()=>{
            console.log("[PLAYERANDROID.retrocedeRep] seekBy OK ");
        })
        .catch ((err)=> {
            console.log("[PLAYERANDROID.retrocedeRep] seekBy KO " + err);
        });;;
    }

    seekTo(milisegundos:number){
        this.androidExoplayer.seekTo(milisegundos)
        .then(()=>{
            console.log("[PLAYERANDROID.seekTo] seekTo OK ");
        })
        .catch ((err)=> {
            console.log("[PLAYERANDROID.seekTo] seekTo KO: " + err);
        });;;
    }

    setVolume(volumen){
        null;
    }

    stop(){
        if (this.estado != this.estadoPlayer.MEDIA_STOPPED && this.estado != this.estadoPlayer.MEDIA_NONE){
            this.androidExoplayer.stop()
            .then((data)=>{  // por lo que he podido ver, aquí nunca entra :-p
                console.log("[PLAYERANDROID.stop] ************************************************ stop OK " + JSON.stringify(data));
                this.estado = this.estadoPlayer.MEDIA_STOPPED;
                this.publicaEstado ();
                this.capitulo = '';
            })
            .catch ((err)=> {
                console.log("[PLAYERANDROID.stop] stop KO " + err);
            });
            this.estado = this.estadoPlayer.MEDIA_NONE;
            this.publicaEstado ();
        }
        this.capitulo = '';
        this.inVigilando(false);
        //this.reproduciendo = false;
    }
}

 