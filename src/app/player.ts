import { MediaPlugin } from 'ionic-native';
import { Component/*, Output, EventEmitter*/ } from '@angular/core';
import { ConfiguracionService } from '../providers/configuracion.service';

@Component({
  providers: [ConfiguracionService]
})

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

    seekPdte:boolean = false;

    constructor(audio:string, private _configuracion: ConfiguracionService){
        this.creaReproductor (audio);
    }

    private creaReproductor (audio){
        const onStatusUpdate = ((status) =>{
            this.statusRep = status
            console.log("[PLAYER.creaReproductor] actualizado status de la reproducción a " + status);
            if (this.seekPdte && status == MediaPlugin.MEDIA_RUNNING){
                let capitulo = this.dameCapitulo();
                this._configuracion.getTimeRep(this.dameCapitulo())
                .then((val)=> {
                    console.log("[PLAYER.onStatusUpdate] recibida posición de reproducción "+val + "para el capítulo" + capitulo );
                    if (val != null && Number(val) > 0){
                        this.seekTo (Number(val));
                    }
                    //this.actualizaPosicion();
                }).catch(()=>{
                    console.log("[PLAYER.onStatusUpdate] Error recuperando posición de la reproducción.");
                });
                this.seekPdte = false;
            }
        });
   /*     const onError = ((err) => {
            console.log ("[PLAYER.creaReproductor] Error creando reproductor " + err.message);
        });
*/
        this.reproductor = new MediaPlugin (audio, onStatusUpdate);
    }

    dameStatus(){
        return this.statusRep;
    }

    dameCapitulo():string{
        let inicio:number;
        let fin:number;
        console.log("[PLAYER.dameCapitulo] Extrayendo capítulo de la cadena "+ this.capitulo);
        if (this.capitulo != null){
            if (this.capitulo.includes('http')){
                fin = this.capitulo.length-5;
            }
            else {
                fin = this.capitulo.length-4;
            }
            inicio = this.capitulo.substring(0, fin).lastIndexOf("/")+1;
            console.log("[PLAYER.dameCapitulo] Devolviendo "+ this.capitulo.substring(inicio, fin));
            return (this.capitulo.substring(inicio, fin));
        }
        else {
            console.log("[PLAYER.dameCapitulo] Devolviendo cadena vacía");
            return ("");
        }
        /*console.log("[PLAYER] Longitud: "+ this.capitulo.length);
        console.log("[PLAYER] Inicio: "+ inicio);
        console.log("[PLAYER] FIN : " + fin);
        console.log("[PLAYER] Capítulo: " + this.capitulo);
        console.log("[PLAYER] incluye http: " + this.capitulo.includes('http'));
        console.log ("[PLAYER] Capítulo vale " + this.capitulo.substring(inicio, fin));*/
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
        //let repeticiones:number = 1;
        //let sonarBloqueado:boolean = true;
		let capitulo = this.dameCapitulo();
        if (this.reproduciendoEste(audio))
        {
            console.log ("[PLAYER.play] Play normal");
            this.reproductor.play(); //this.reproductor.play([repeticiones, sonarBloqueado]);
        }
        else{
            console.log ("[PLAYER.play] Modificado audio");
			this.reproductor.getCurrentPosition()
				.then((pos)=>{
					console.log("[PLAYER.play] Recibida posición " + pos * 1000 + " para el capítulo "+ capitulo+ ". Guardando posición ");
                    if (pos > 0){
					    this._configuracion.setTimeRep(capitulo, pos * 1000);
                    }
				})
				.catch ((err)=> {
					console.log ("[PLAYER.play] Recibido error al pedir posición de reproducción: " + err);
				});
            this.reproductor.stop();
            this.reproductor.release();
            this.creaReproductor (audio);
            this.capitulo = audio;
			this.reproductor.play();
            this.seekPdte = true;
        }
        //this.reproduciendo = true;
    }

    resume(){
        this.reproductor.play();
    }

    pause(){
        this.reproductor.pause();
        //this.reproduciendo = false;
    }

    release(){
		this.reproductor.getCurrentPosition()
			.then((pos)=>{
				console.log("[PLAYER.release] Recibida posición " + pos * 1000);
                if (pos > 0) {
				    this._configuracion.setTimeRep(this.dameCapitulo(), pos * 1000);
                }
			})
			.catch ((err)=> {
				console.log ("[PLAYER.release] Recibido error al pedir posición de reproducción: " + err);
			});
        this.reproductor.release();
        //this.reproduciendo = false;
    }

    adelantaRep(){
        this.getCurrentPosition().then((position)=>{
            this.seekTo((position+15)*1000);
        });
    }

    retrocedeRep(){
        this.getCurrentPosition().then((position)=>{
            if (position>15){
                this.seekTo((position-15)*1000);
            }
            else{
                this.seekTo(0);
            }
        });
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
