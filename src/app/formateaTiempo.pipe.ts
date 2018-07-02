import {Pipe} from '@angular/core'
import { toTypeScript } from '@angular/compiler';

@Pipe ({name: 'formateaTiempo'})

export class formateaTiempoPipe /*implements PipeTransform*/{


    transform (tiempo:string, args:number[]){
        let salida ='' ;
        if (isNaN(Number(tiempo))){
            salida = tiempo;
        }
        else {
            let tiempoEnSec = Number(tiempo)/1000;
            let horas = Math.floor(Number(tiempoEnSec) / 3600);
            let minutos = Math.floor((Number(tiempoEnSec) % 3600) / 60);
            let segundos = (Number(tiempoEnSec) % 60);
            salida = ((this.numerosDosCifras (horas)=='00'?'':this.numerosDosCifras (horas) + ':') + this.numerosDosCifras (minutos) + ':' + this.numerosDosCifras (segundos));
        }
        return (salida)
    }

    numerosDosCifras(numero):string {
        let ret: string = "00";
        if (!isNaN(numero)){
            if (numero < 10){
                ret = '0' + numero;
            }
            else {
                ret = numero.toString();
            }
        }
        return (ret.substr(0,2));
    }

}