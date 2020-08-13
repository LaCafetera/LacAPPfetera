import { NgModule } from '@angular/core';
import { eliminaHashtagPipe } from './eliminaHashtag.pipe'
import { formateaFechaPipe } from './formateaFecha.pipe'
import { formateaTiempoPipe } from './formateaTiempo.pipe'
import { muestraHashtagPipe } from './muestraHashtag.pipe'
import { tiempoHastaAhoraPipe } from './tiempoHastaAhora.pipe'

@NgModule({
  declarations: [eliminaHashtagPipe, formateaFechaPipe, formateaTiempoPipe, muestraHashtagPipe, tiempoHastaAhoraPipe],
  exports: [eliminaHashtagPipe, formateaFechaPipe, formateaTiempoPipe, muestraHashtagPipe, tiempoHastaAhoraPipe]
})
export class PipesModule {}