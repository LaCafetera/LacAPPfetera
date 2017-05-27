import {Pipe, PipeTransform} from '@angular/core'

@Pipe ({name: 'tiempoHastaAhora'})

export class tiempoHastaAhoraPipe implements PipeTransform{
    transform (value:string, args:number[]){
        var ahora = Date.now();
        var diferencia;
        var cantidad;
        var milisegundosPorSegundo = 1000;
        var milisegundosPorMinuto = milisegundosPorSegundo * 60;
        var milisegundosPorHora = milisegundosPorMinuto * 60;
        var milisegundosPorDia = milisegundosPorHora * 24;
        var milisegundosPorMes = milisegundosPorDia * 30;
        var milisegundosPorAnyo = milisegundosPorDia * 365;
        var zonaHoraria = Math.abs(new Date().getTimezoneOffset()/60);
        // console.log("[tiempoHastaAhoraPipe] Diferencia horaria: " + zonaHoraria);
        // En la siguiente línea hay un +1 porque las horas que manda spreaker son las de gmt+0
        var fechaSegundos = new Date (Number(value.substr(0,4)), Number(value.substr(5,2))-1, Number(value.substr(8,2)), Number(value.substr(11,2))+zonaHoraria, Number(value.substr(14,2)), Number(value.substr(17,2)));
        //console.log(value + "|"+ value.substr(0,4)+"|"+value.substr(5,2)+"|"+value.substr(8,2)+"|"+value.substr(11,2)+"|"+value.substr(14,2)+"|"+value.substr(17,2)+"|");
        var valueResultado = "Hace un rato";

     //   console.log("REcibida fecha "+ value);

        diferencia = Math.floor(ahora - fechaSegundos.getTime());
        //console.log("FEcha 1 =" + ahora.toString() + " Fecha 2 =" + fechaSegundos.toString() + " o también  =" + fechaSegundos.getTime());
        //console.log("[tiempoHastaAhora] Recibido: "+value+"; fechaSegundos = " + fechaSegundos + "-"+ fechaSegundos.getTime() + "; diferencia = " + diferencia + "; ahora = " + ahora);
        if (diferencia < milisegundosPorMinuto) {
            valueResultado = "Hace menos de un minuto";
        } //
        else if (diferencia < milisegundosPorHora) {
            cantidad = Math.floor(diferencia/milisegundosPorMinuto);
            valueResultado = "Hace " + cantidad + ((cantidad==1)? " minuto.":" minutos.");
        }
        else if (diferencia < milisegundosPorDia) {
            cantidad = Math.floor(diferencia/milisegundosPorHora);
            valueResultado = "Hace " + cantidad + ((cantidad==1)? " hora.":" horas.");
        }
        else if (diferencia < milisegundosPorMes) {
            cantidad = Math.floor(diferencia/milisegundosPorDia);
            valueResultado = "Hace " + cantidad + ((cantidad==1)? " día.":" días.");
        }
        else if (diferencia < milisegundosPorAnyo) {
            cantidad = Math.floor(diferencia/milisegundosPorMes);
            valueResultado = "Hace " + cantidad + ((cantidad==1)? " mes.":" meses.");
        }
        else {
            cantidad = Math.floor(diferencia/milisegundosPorAnyo);
            valueResultado = "Hace " + cantidad + ((cantidad==1)? " año.":" años.");
        }
    //    console.log(valueResultado);
        return (valueResultado);
    }

    /*
    var posHT = elementosCapitulo.title.indexOf('#');
                if (posHT != -1){
                    var espacio = elementosCapitulo.title.indexOf(' ', posHT);
                    if (espacio == -1) {
                        espacio = elementosCapitulo.title.length;
                    }
                    var resta = elementosCapitulo.title.indexOf(' ', posHT)-posHT;
                    hashtag = elementosCapitulo.title.substring(posHT, espacio) + " ";
                    console.log("El hashtag es " + hashtag + " La posición del caracter # es " + posHT + " espacio " + espacio + " resta " + resta);
                }
                else
                {
                    console.log("Sin hashtag en el titulo");
                }
                */

}