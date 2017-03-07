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
            console.log("La cadena sin Hashtag es " + cadena + " La posición del caracter # es " + posHT + " espacio " + espacio);
        }
        else
        {
            console.log("Sin hashtag en el titulo");
            cadena = value;
        }
        return (cadena);
    }
}