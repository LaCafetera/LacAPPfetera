import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';


@Injectable()
export class EpisodiosGuardadosService {

    dirdestino:string;
    fichero : string = 'cafesLocales.lst'

    constructor(private file: File) {
        this.file.resolveLocalFilesystemUrl(this.file.dataDirectory) // --> Probar esto: externalDataDirectory
        .then((entry) => {
            this.dirdestino = entry.toInternalURL();
        })
        .catch((error) => {
            console.log("[EpisodiosGuardados.constructor] Error recuperando carpeta de destino: " + error.body);
        });
    }

    ngOnInit(){
    }

    guardaProgramas (programa: string){
        console.log("[EpisodiosGuardados.guardaProgramas] this.dirdestino "+ this.dirdestino+" this.fileDownload " + this.fichero)
        this.dameDatosFichero()
        .then((listaDescargados)=>{
            console.log("[EpisodiosGuardados.guardaProgramas] El fichero " + this.fichero + ' existe.');
            this.file.writeExistingFile (this.dirdestino, this.fichero, JSON.stringify(listaDescargados.programas.concat(programa)))
            .then (() => {
                console.log("[EpisodiosGuardados.guardaProgramas] Datos guardados en fichero existente.")})
            .catch (() => {
                console.log("[Episodi}osGuardados.guardaProgramas] Error guardando datos en el fichero existente.")});
        })
        .catch((err) => {
            //if (err.code == 1){
                console.log("[EpisodiosGuardados.guardaProgramas] El fichero no existe.");
                let listaDescargados = {"programas":[programa]};
                this.file.writeFile (this.dirdestino, this.fichero, JSON.stringify(listaDescargados), {replace: true, append:false, truncate:0})
                .then ((data) => {
                    console.log("[EpisodiosGuardados.guardaProgramas] Datos guardados en fichero existente." + JSON.stringify(data))})
                .catch ((error) => {
                    console.log("[EpisodiosGuardados.guardaProgramas] Error guardando datos en el fichero existente." + error)});
            //}
            //else {
            //    console.log("[EpisodiosGuardados.guardaProgramas] Error buscando fichero:" + err.message);
            //}
        });
    }

    dameDatosFichero (): Promise <any>{
        let promesa = new Promise ((resolve, reject) => {
            this.file.checkFile(this.dirdestino, this.fichero)
            .then((value)=>{
                if(value == true) {
                    console.log("[EpisodiosGuardados.dameDatosFichero] El fichero " + this.fichero + ' existe.');
                    this.file.readAsText (this.dirdestino, this.fichero)
                    .then ((arrayBuffer) => {
//                        resolve ([{}]);
                        //resolve(JSON.parse(arrayBuffer));
                        resolve(arrayBuffer);
                    })
                    .catch ((error) => {
                        reject (error);
                    })
                }
                else {
                    reject ();
                }
            })
            .catch((err) => {
                reject (err);
            });
        });
        return (promesa);
    }

    daListaProgramas () : Observable <any> {
        return Observable.create(observer => {
            this.dameDatosFichero ()
            .then ((datos)=> {
                datos.forEach(programas => {
                    observer.next(programas);
                });
            })
            .catch ((error)=> {
                //console.log("[EpisodiosGuardados.cargaProgramas] Error leyendo: " + error)});
            })
        })
    }
}