import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { File } from '@ionic-native/file';

/**
 * Generated class for the CapitulosDescargadosPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-capitulos-descargados',
  templateUrl: 'capitulos-descargados.html',
  providers: [File]
})
export class CapitulosDescargadosPage {

    dirdestino:string;
    datosDestino: Array<any>

  constructor(public navCtrl: NavController, public navParams: NavParams, private file: File) {
  }

/*
{"isFile":false,"isDirectory":true,"name":"files","fullPath":"/files/","filesystem":"<FileSystem: files>","nativeURL":"file:///data/user/0/com.ionicframework.lacappfetera828555/files/files/"},
{"isFile":false,"isDirectory":true,"name":"Documents","fullPath":"/Documents/","filesystem":"<FileSystem: files>","nativeURL":"file:///data/user/0/com.ionicframework.lacappfetera828555/files/Documents/"},
{"isFile":true,"isDirectory":false,"name":"11556812","fullPath":"/11556812","filesystem":"<FileSystem: files>","nativeURL":"file:///data/user/0/com.ionicframework.lacappfetera828555/files/11556812"},
{"isFile":true,"isDirectory":false,"name":"11978713.mp3","fullPath":"/11978713.mp3","filesystem":"<FileSystem: files>","nativeURL":"file:///data/user/0/com.ionicframework.lacappfetera828555/files/11978713.mp3"},
{"isFile":true,"isDirectory":false,"name":"12006537.mp3","fullPath":"/12006537.mp3","filesystem":"<FileSystem: files>","nativeURL":"file:///data/user/0/com.ionicframework.lacappfetera828555/files/12006537.mp3"},
{"isFile":true,"isDirectory":false,"name":"11885748.mp3","fullPath":"/11885748.mp3","filesystem":"<FileSystem: files>","nativeURL":"file:///data/user/0/com.ionicframework.lacappfetera828555/files/11885748.mp3"},
{"isFile":true,"isDirectory":false,"name":"12016111.mp3","fullPath":"/12016111.mp3","filesystem":"<FileSystem: files>","nativeURL":"file:///data/user/0/com.ionicframework.lacappfetera828555/files/12016111.mp3"}]"

*/

  ionViewDidLoad() {
    console.log('ionViewDidLoad CapitulosDescargadosPage');
/*    this.file.resolveLocalFilesystemUrl(this.file.dataDirectory) // --> Probar esto: externalDataDirectory
    .then((entry) => {
        this.dirdestino = entry.toInternalURL();
        console.log('[CAPITULOS-DESCARGADOS.ionViewDidLoad] Vamos a revisar los archivos que hay en la carpeta ' +this.dirdestino  );
        this.file.listDir(this.dirdestino,'' )
        .then((listado)=>{
          console.log("[CAPITULOS-DESCARGADOS.ionViewDidLoad] Los capitulos descargados son " + JSON.stringify(listado));
          this.datosDestino = listado


            listado.response.items.forEach((capitulo, elemento, array) => {
                this.dameDetalleEpisodio(capitulo.episode_id).subscribe(
                    data => {
                        if (token!= null) {
                            this.episodioDimeSiLike(capitulo.episode_id, usuario, token)
                            .subscribe (
                                espureo=>{ 
                                    console.log("[EPISODIOS-SERVICE.dameEpisodios] Devuelve datos --> Me gusta el capítulo " + capitulo.episode_id );
                                    observer.next ({objeto:data.response.episode,
                                                    like: true});
                                },
                                error=>{
                                    console.log("[EPISODIOS-SERVICE.dameEpisodios] No me gusta el capítulo " + capitulo.episode_id);
                                    observer.next ({objeto:data.response.episode,
                                                    like: false});
                                }
                            )
                        }
                        else{
                            observer.next ({objeto:data.response.episode,
                                            like: false});
                        }
                    },
                    err => {
                        console.log("[EPISODIOS-SERVICE.dameEpisodios] Error en detalle:" + err);
                    }
                )}

        })
        .catch ((error)=>{
          console.log("[CAPITULOS-DESCARGADOS.ionViewDidLoad] Se ha producido un errrrorrrr listsando episodios" + error.body);
        })
    })
    .catch ((error)=>{
      console.log("[CAPITULOS-DESCARGADOS.ionViewDidLoad] Error recuperando carpeta de destino: " + error.body);
    });*/
  }

}
