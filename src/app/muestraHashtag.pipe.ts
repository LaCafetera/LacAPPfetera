import {Pipe, PipeTransform} from '@angular/core'

@Pipe ({name: 'muestraHashtag'})

export class muestraHashtagPipe implements PipeTransform{
    transform (value:string, args:number[]){
        let hashtag:string ="";
        let posHT = value.indexOf('#');
        if (posHT != -1){
            let espacio = value.indexOf(' ', posHT);
            if (espacio == -1) {
                espacio = value.length;
            }
            //let resta = value.indexOf(' ', posHT)-posHT;
            hashtag = value.substring(posHT, espacio) + " ";
          //  console.log("[muestraHashtag]El hashtag es " + hashtag + " La posición del caracter # es " + posHT + " espacio " + espacio);
        }/*
        else
        {
            console.log("[muestraHashtag]Sin hashtag en el titulo");
        }*/
        return (hashtag);
    }
}