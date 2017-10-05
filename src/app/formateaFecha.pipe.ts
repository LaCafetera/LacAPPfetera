import {Pipe, PipeTransform} from '@angular/core'

@Pipe ({name: 'formateaFecha'})

export class formateaFechaPipe implements PipeTransform{
    transform (value:string, args:number[]){
        var zonaHoraria = Math.abs(new Date().getTimezoneOffset()/60);
        var fechaSegundos = new Date (Number(value.substr(0,4)), Number(value.substr(5,2))-1, Number(value.substr(8,2)), Number(value.substr(11,2))+zonaHoraria, Number(value.substr(14,2)), Number(value.substr(17,2)));
        return (fechaSegundos.toLocaleString());
    }
}