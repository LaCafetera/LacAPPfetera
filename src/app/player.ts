import { Injectable, Component, OnDestroy /*, Output, EventEmitter*/ } from '@angular/core';
import { Platform } from 'ionic-angular';
import { PlayerIOS } from './playerIOS';
import { PlayerAndroid } from './playerAndroid';
import { ConfiguracionService } from '../providers/configuracion.service';

@Injectable()
@Component({
    providers: [PlayerAndroid, PlayerIOS, Platform]
})

export class Player implements OnDestroy {

    audiolocal: boolean = false;

    public inicializado:boolean = false;

    constructor(public platform : Platform, 
                private playerIOS: PlayerIOS, 
                private playerAndroid: PlayerAndroid){
                    console.log ("[PLAYER] El dispositivo es : " + this.platform.platforms() );
    }
    
    ngOnDestroy(){
    }

    ionViewWillUnload() {
    }

    private cantaIos_local (audio: string): boolean {
        if (audio != ''){ // Si me pasan el nombre del fichero, lo cambio; si no lo dejo como está.
            if (audio.includes('.mp3')) {
                this.audiolocal = true;
            }
            else {
                this.audiolocal = false;
            }
        }
        if (!this.platform.is('android') || this.audiolocal) {
            return (true)
        }
        else{
            return (false)
        }
    }

    public crearepPlugin (audio:string, configuracion: ConfiguracionService, autoplay: boolean) { 
        if (this.cantaIos_local(audio)){
            this.playerIOS.crearepPlugin(audio, configuracion);
        }
        else {
            this.playerAndroid.crearepPlugin(audio, configuracion, autoplay);
        }
        this.inicializado = true;
    }

    public dameStatus(){
        if (this.cantaIos_local('')){
            return (this.playerIOS.dameStatus());
        }
        else {
            return (this.playerAndroid.dameStatus());
        }
    }

    public dameStatusRep(){
        if (this.cantaIos_local('')){
            return (this.playerIOS.dameStatusRep());
        }
        else {
            return (this.playerAndroid.dameStatusRep());
        }
    }

    public dameStatusPause(){
        if (this.cantaIos_local('')){
            return (this.playerIOS.dameStatusPause());
        }
        else {
            return (this.playerAndroid.dameStatusPause());
        }
    }

    public dameStatusStop(){
        if (this.cantaIos_local('')){
            return (this.playerIOS.dameStatusStop())
        }
        else {
            return (this.playerAndroid.dameStatusStop());
        }
    }

    public dameStatusStarting(){
        if (this.cantaIos_local('')){
            return (this.playerIOS.dameStatusStarting());
        }
        else {
            return (this.playerAndroid.dameStatusStarting());
        }
    }

    traduceAudio(audio):string{
        if (this.cantaIos_local('')){ // no paso el audio porque no quiero que me cambie el si es un adudio local o no. Además, ambos sistemas funcionan igual.
            return (this.playerIOS.traduceAudio(audio));
        }
        else {
            return (this.playerAndroid.traduceAudio(audio));
        }
    }

    public dameCapitulo():string{
        if (this.cantaIos_local('')){
            return (this.playerIOS.dameCapitulo());
        }
        else {
            return (this.playerAndroid.dameCapitulo());
        }
    }

    extraeCapitulo(capituloEntrada):string{
        if (this.cantaIos_local(capituloEntrada)){
            return (this.playerIOS.extraeCapitulo(capituloEntrada));
        }
        else {
            return (this.playerAndroid.extraeCapitulo(capituloEntrada));
        }
    }

    capDescargado (idDescargado){
        if (this.cantaIos_local('')){
            this.playerIOS.capDescargado (idDescargado);
        }
        else {
            this.playerAndroid.capDescargado (idDescargado);
        }
    }
    
    getCurrentPosition(){
        if (this.cantaIos_local('')){
            return (this.playerIOS.getCurrentPosition());
        }
        else {
            return (this.playerAndroid.getCurrentPosition());
        }
    }
    
    getDuration(){
        if (this.cantaIos_local('')){
            return (this.playerIOS.getDuration());
        }
        else {
            return (this.playerAndroid.getDuration());
        }
    }

    getCurrentAmplitude(){
        if (this.cantaIos_local('')){
            return (this.playerIOS.getCurrentAmplitude());
        }
        else {
            return (this.playerAndroid.getCurrentAmplitude());
        }
    }

    reproduciendoEste(audio):boolean{
        if (this.cantaIos_local('')){ // no paso el audio porque no quiero que me cambie el si es un adudio local o no. Además, ambos sistemas funcionan igual.
            return (this.playerIOS.reproduciendoEste(audio));
        }
        else {
            return (this.playerAndroid.reproduciendoEste(audio));
        }
    }
/*
    continuaPlayStreaming (tiempoSeek: number){
        if (this.cantaIos_local()){
            this.playerIOS.continuaPlayStreaming (tiempoSeek);
        }
        else {
            this.playerAndroid.continuaPlayStreaming (tiempoSeek);
        }
    }
*/
    play(audioIn: string, configuracion: ConfiguracionService):boolean{
        let capitulo = this.dameCapitulo();
        let audio = this.traduceAudio(audioIn);
        if (this.reproduciendoEste(audio)) {
            if (this.cantaIos_local(audioIn)){
                return (this.playerIOS.play(audio, configuracion));
            }
            else {
                //this.playerAndroid.play(audio, configuracion).then(()=> {return(true)});
                this.playerAndroid.play(audio, configuracion);
                return (true);
            }
        }
        else {
            // Aquí no paso el audio porque quiero que el "cerrarAudio" se ejecute sobre el sistema que estaba reproduciendo,  
            // que no tiene por qué ser el mismo que va a reproducir.
            if (this.cantaIos_local('')){
                this.playerIOS.cerrarAudio();
            }
            else {
                this.playerAndroid.cerrarAudio();
            }
            // Ahora sí lo paso, porque no sé si estoy en android reproduciendo descargado, o en Android reproduciendo en streaming. (O en iOS, en cuyo caso da todo igual).
            if (this.cantaIos_local(audioIn)){
                // no puedo pasar autoplay a true si estoy en ios, pero si estoy en Android 
                // y he pasado de reproducir en local a reproducir en remoto, el reproductor 
                // me lo tiene que crear como "true"
                this.crearepPlugin(audioIn,configuracion, true); 
                return (this.playerIOS.play(audio, configuracion));
            }
            else {
                this.crearepPlugin(audioIn,configuracion, true);
//                this.playerAndroid.play(audio, configuracion).then(()=> {return(true)});
                return (true);
            }
        }
    }

    resume(){
        if (this.cantaIos_local('')){
            this.playerIOS.resume ();
        }
        else {
            this.playerAndroid.resume ();
        }
    }

    guardaPos(configuracion: ConfiguracionService){
        if (this.cantaIos_local('')){
            this.playerIOS.guardaPos(configuracion);
        }
        else {
            this.playerAndroid.guardaPos(configuracion);
        }
    }

    pause(configuracion: ConfiguracionService){
        if (this.cantaIos_local('')){
            this.playerIOS.pause(configuracion);
        }
        else {
            // El reproductor de android no tiene pause; solo "playpause". Por esto, el "pause" se hace solo, diciendo "play". Pero como hay que 
            // pasarle un capítulo (por si acaso estuviéramos cambiando de capítulo) le paso el que está sonando.
            this.playerAndroid.play(this.dameCapitulo(), configuracion); 
        }
    }

    release(configuracion: ConfiguracionService){
        if (this.cantaIos_local('')){
            this.playerIOS.release(configuracion);
        }
        else {
            this.playerAndroid.release(configuracion);
        }
        this.inicializado = false;
    }

    adelantaRep(){
        if (this.cantaIos_local('')){
            this.playerIOS.adelantaRep();
        }
        else {
            this.playerAndroid.adelantaRep();
        }
    }

    retrocedeRep(){
        if (this.cantaIos_local('')){
            this.playerIOS.retrocedeRep();
        }
        else {
            this.playerAndroid.retrocedeRep();
        }
    }

    seekTo(milisegundos:number){
        this.getCurrentPosition()
        .then((position)=>{
            let diferencia = Number(position*1000) - milisegundos;
            if (Math.abs(diferencia) > 100){
                if (this.cantaIos_local('')){
                    this.playerIOS.seekTo(milisegundos);
                }
                else {
                    this.playerAndroid.seekTo(milisegundos);
                }
                console.log("[PLAYER.seekTo] Me han pedido hacer un cambio de posición de " + milisegundos + "milésimas de segundo.")
            }
            else{
//              console.log("[PLAYERIOS.seekTo] Me han pedido hacer un cambio de posición de " + diferencia + " milésimas de segundo. Paso 1000.")
            }
        })
        .catch(() =>{
            if (this.cantaIos_local('')){
                this.playerIOS.seekTo(milisegundos);
            }
            else {
                this.playerAndroid.seekTo(milisegundos);
            }
            console.log("[PLAYER.seekTo] No he podido ver por dónde vamos, así que obedezco.")
        });
    }

    setVolume(volumen){
        if (this.cantaIos_local('')){
            this.playerIOS.setVolume(volumen);
        }
        else {
            this.playerAndroid.setVolume(volumen);
        }
    }

    stop(){
        if (this.cantaIos_local('')){
            this.playerIOS.stop();
        }
        else {
            this.playerAndroid.stop();
        }
    }

}

 