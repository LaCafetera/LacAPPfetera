import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReproductorPage } from './reproductor';
import { ChatPageModule } from '../chat/chat.module';
import { DetalleCapituloPageModule } from '../detalle-capitulo/detalle-capitulo.module';
import { listaPuntosCapModule } from '../lista-Puntos-Cap/lista-Puntos-Cap.module';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [ 
    ReproductorPage,
  ],
  imports: [ 
    IonicPageModule.forChild(ReproductorPage),
    ChatPageModule, DetalleCapituloPageModule, listaPuntosCapModule,
    PipesModule], 
  exports: [
    ReproductorPage]
})
export class ReproductorPageModule {}
