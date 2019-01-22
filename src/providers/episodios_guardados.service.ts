import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';


@Injectable()
export class EpisodiosGuardadosService {

    dirdestino:string;
    fichero : string = 'cafesLocales.lst'

    constructor(private file: File) {
    }

    ngOnInit(){
        this.file.resolveLocalFilesystemUrl(this.file.externalDataDirectory) // --> Probar esto: externalDataDirectory
        .then((entry) => {
            this.dirdestino = entry.toInternalURL();
            console.log("[EpisodiosGuardados.ngOnInit] ********************************* BIEEEEEENNNNNN ********************************");
        })
        .catch((error) => {
            console.log("[EpisodiosGuardados.ngOnInit] Error recuperando carpeta de destino: " + error.body);
        });
    }

    guardaProgramas (programa: object){
        console.log("[EpisodiosGuardados.guardaProgramas] Guardando "+ JSON.stringify(programa))
        //let listaDescargados = {"programas":[programa]};
        this.file.resolveLocalFilesystemUrl(this.file.externalDataDirectory) // --> Probar esto: externalDataDirectory
        .then((entry) => {
            this.dirdestino = entry.toInternalURL();
                this.dameDatosFichero ()
                .then ((datos)=> {
                    let programasObjeto = JSON.parse(datos);
                    if (!this.yaEstaba(programa, programasObjeto)) {
                        var todosProgramas = JSON.stringify(this.tidyYourRoom(programasObjeto.concat([programa])));
                        console.log("[EpisodiosGuardados.guardaProgramas] ." + todosProgramas);
                        this.file.writeFile (this.dirdestino, this.fichero, todosProgramas, {replace: true, append:false, truncate:0})
                        .then ((data) => {
                            console.log("[EpisodiosGuardados.guardaProgramas] Datos guardados en fichero existente." + data)
                        })
                        .catch ((error) => {
                            console.log("[EpisodiosGuardados.guardaProgramas] Error guardando datos en el fichero existente." + error)
                        });
                    }
                })
                .catch ((error)=> {
                    let todosProgramas = JSON.stringify([programa]);
                    this.file.writeFile (this.dirdestino, this.fichero,todosProgramas, {replace: true, append:false, truncate:0})
                        .then ((data) => {
                            console.log("[EpisodiosGuardados.guardaProgramas] Datos guardados en fichero existente." + data)
                        })
                        .catch ((error) => {
                            console.log("[EpisodiosGuardados.guardaProgramas] Error guardando datos en el fichero existente." + error)
                        });
                    //console.log("[EpisodiosGuardados.cargaProgramas] Error leyendo: " + error);
                })
            })
        .catch((error) => {
            console.log("[EpisodiosGuardados.constructor] Error recuperando carpeta de destino: " + error.body);
        });
    }

    borraProgramas (programa: object){
        console.log("[EpisodiosGuardados.borraProgramas] this.dirdestino "+ this.dirdestino+" this.fileDownload " + this.fichero)
        //let listaDescargados = {"programas":[programa]};
        this.file.resolveLocalFilesystemUrl(this.file.externalDataDirectory) // --> Probar esto: externalDataDirectory
        .then((entry) => {
            this.dirdestino = entry.toInternalURL();
                this.dameDatosFichero ()
                .then ((datos)=> {
                    let programasObjeto = JSON.parse(datos);
                    if (this.yaEstaba(programa, programasObjeto)) {
                        var todosProgramas = JSON.stringify(this.borraElemento(programasObjeto, programa));
                        console.log("[EpisodiosGuardados.borraProgramas] ." + todosProgramas);
                        this.file.writeFile (this.dirdestino, this.fichero, todosProgramas, {replace: true, append:false, truncate:0})
                        .then ((data) => {
                            console.log("[EpisodiosGuardados.borraProgramas] Datos guardados en fichero existente." + data)
                        })
                        .catch ((error) => {
                            console.log("[EpisodiosGuardados.borraProgramas] Error guardando datos en el fichero existente." + error)
                        });
                    }
                })
                .catch ((error)=> {
                    console.log("[EpisodiosGuardados.borraProgramas] Error leyendo: " + error);
                })
            })
        .catch((error) => {
            console.log("[EpisodiosGuardados.borraProgramas] Error recuperando carpeta de destino: " + error.body);
        });
    }

    tidyYourRoom(listaProgramas: Array<any>) :Array<object>{
        //let ordenado = listaProgramas;
        let mapped = listaProgramas.map((el, i) => {
            return { index: i, value: el.episode_id };
        });

        // ordenando el array mapeado conteniendo los valores reducidos
        mapped.sort((a, b) => {
            return (b.value - a.value);
        });

        // contenedor para el orden resultante
        return( mapped.map((el) =>{
            return listaProgramas[el.index];
        }));
    }

    yaEstaba(programa: any, programasArray: any): boolean{
        //let programaObjeto = programa;
        //let programasArray = programasGuardados.programas;
        let encontrado = programasArray.find((element) => {
            return (element.episode_id == programa.episode_id)
        });
        return (encontrado != undefined);
    }
	
	borraElemento (programasArray: Array<any>, programa: any){
        let posicion = programasArray.findIndex((elemento) => {
			return (elemento.episode_id == programa.episode_id)
        })
        // programasArray.splice (posicion-1,1);
        programasArray.splice (posicion,1);
        return (programasArray);
	}

    dameDatosFichero (): Promise <any>{
        let promesa = new Promise ((resolve, reject) => {
            this.file.resolveLocalFilesystemUrl(this.file.externalDataDirectory) // --> Probar esto: externalDataDirectory
            .then((entry) => {
                this.dirdestino = entry.toInternalURL();
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
            })
            .catch((error) => {
                console.log("[EpisodiosGuardados.ngOnInit] Error recuperando carpeta de destino: " + error.body);
            });
        });
        return (promesa);
    }

    daListaProgramas () : Observable <any> {
        return Observable.create(observer => {
            this.dameDatosFichero ()
            .then ((datos)=> {
                console.log("[EpisodiosGuardados.daListaProgramas] enviado: " + JSON.stringify(JSON.parse(datos).programas));
                JSON.parse(datos).forEach((elemento, index, array) => {
                    observer.next(elemento);
                });
                observer.complete();
            })
            .catch ((error)=> {
                console.log("[EpisodiosGuardados.daListaProgramas] Error leyendo: " + error.message);
                observer.complete();
            })
        })
    }

    dimeSiLoTengo(nombreFichero: string): Promise <any>{
        let nombreYExtension = nombreFichero + ".mp3";
        console.log("[EpisodiosGuardados.dimeSiLoTengo] Buscando si tengo el fichero " + nombreYExtension)
        let promesa = new Promise ((resolve, reject) => {
            this.file.resolveLocalFilesystemUrl(this.file.externalDataDirectory) // --> Probar esto: externalDataDirectory
            .then((entry) => {
                this.file.checkFile(entry.toInternalURL(), nombreYExtension)
                .then((value)=>{
                    if(value == true) {
                        resolve (this.file.externalDataDirectory + '/' + nombreYExtension);
                    }
                    else {
                        resolve (null);
                    }
                })
                .catch((error) => {
                    console.warn ("[EpisodiosGuardados.dimeSiLoTengo] Parece que no hemos encontrado el fichero: " + error.body);
                    resolve (null);
                });
            })
            .catch((error) => {
                console.log("[EpisodiosGuardados.dimeSiLoTengo] Problemas entrando en carpeta: " + error.body);
                reject("Problemas Problemas entrando en carpeta: " + error.body);
            });
        });
        return (promesa);
    }
}