import {Pipe, PipeTransform} from '@angular/core'

@Pipe ({name: 'eliminaHashtag'})

export class eliminaHashtagPipe implements PipeTransform{
    transform (value:string, args:number[]){
        let cadena:string ="";
        let posHT = value.indexOf('#');
        if (posHT != -1){
            let espacio = value.indexOf(' ', posHT);
            if (espacio == -1) {
                espacio = value.length;
            }
            cadena = value.substr(0, posHT) + value.substr (espacio);
            while (cadena.substr(0,1)== ' ' || cadena.substr(0,1)== ',' || cadena.substr(0,1)== '.' || cadena.substr(0,1)== ':' || cadena.substr(0,1)== ';'){
                cadena = cadena.substr(1);
            }
     //      console.log("[eliminaHashtagPipe]La cadena sin Hashtag es " + cadena + " La posición del caracter # es " + posHT + " espacio " + espacio);
        }
        else
        {
     //       console.log("[eliminaHashtagPipe]Sin hashtag en el titulo. Enviando " +value);
            cadena = value;
        }
        return (cadena);
    }
}