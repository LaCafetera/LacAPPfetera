import { MediaPlugin } from 'ionic-native';

export class Player {

    private reproductor: MediaPlugin;

    private capitulo: string;
    private descargado:boolean = false;
    //private reproduciendo:boolean = false;
    private statusRep:number;

    public MEDIA_RUNNING = MediaPlugin.MEDIA_RUNNING;
    public MEDIA_PAUSED = MediaPlugin.MEDIA_PAUSED;
    public MEDIA_STARTING = MediaPlugin.MEDIA_STARTING;
    public MEDIA_STOPPED = MediaPlugin.MEDIA_STOPPED;

    public MEDIA_ERR_ABORTED = MediaPlugin.MEDIA_ERR_ABORTED;
    public MEDIA_ERR_DECODE = MediaPlugin.MEDIA_ERR_DECODE;
    public MEDIA_ERR_NETWORK = MediaPlugin.MEDIA_ERR_NETWORK;
    public MEDIA_ERR_NONE_SUPPORTED = MediaPlugin.MEDIA_ERR_NONE_SUPPORTED;
    public MEDIA_NONE = MediaPlugin.MEDIA_NONE;

    constructor(audio){
        this.creaReproductor (audio);
    }

    private creaReproductor (audio){
        const onStatusUpdate = (status) =>{
            this.statusRep = status
            console.log("[Player] actualizado status de la reproducción a " + status);
        };
        this.reproductor = new MediaPlugin (audio, onStatusUpdate);
    }

    dameStatus(){
        return this.statusRep;
    }

    dameCapitulo():string{
        let inicio:number;
        let fin:number;
        if (this.capitulo.includes('http')){
            fin = this.capitulo.length-5;
        }
        else {
            fin = this.capitulo.length-4;
        }
        inicio = this.capitulo.substring(0, fin).lastIndexOf("/")+1;
        /*console.log("[PLAYER] Longitud: "+ this.capitulo.length);
        console.log("[PLAYER] Inicio: "+ inicio);
        console.log("[PLAYER] FIN : " + fin);
        console.log("[PLAYER] Capítulo: " + this.capitulo);
        console.log("[PLAYER] incluye http: " + this.capitulo.includes('http'));
        console.log ("[PLAYER] Capítulo vale " + this.capitulo.substring(inicio, fin));*/
        return (this.capitulo.substring(inicio, fin));
    }

    capDescargado (idDescargado){
        this.descargado = idDescargado;
    }

    getCurrentPosition(){
        return this.reproductor.getCurrentPosition();
    }

    getCurrentAmplitude(){
        return this.reproductor.getCurrentAmplitude();
    }

    reproduciendoEste(audio):boolean{
        return (audio == this.capitulo);
    }

    play(audio){
        if (this.reproduciendoEste(audio))
        {
            return this.reproductor.play();
        }
        else{
            this.reproductor.stop();
            this.reproductor.release();
            this.creaReproductor (audio);      
            this.capitulo = audio;
            this.reproductor.play();
        }
        //this.reproduciendo = true;
    }

    resume(){
        return this.reproductor.play();
    }

    pause(){
        this.reproductor.pause();
        //this.reproduciendo = false;
    }

    release(){
        this.reproductor.release();
        //this.reproduciendo = false;
    }

    seekTo(milisegundos:number){
        this.reproductor.seekTo(milisegundos);
    }

    setVolume(volumen){
        this.reproductor.setVolume(volumen);
    }

    stop(){
        this.reproductor.stop();
        //this.reproduciendo = false;
    }

    dimeCapitulo():string{
        return ('**************** El capítulo es:' + this.capitulo==null?'Sin capítulo definido':this.capitulo);
    }

}