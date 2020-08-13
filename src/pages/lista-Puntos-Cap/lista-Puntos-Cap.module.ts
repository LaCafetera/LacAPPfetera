import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { listaPuntosCap } from './lista-Puntos-Cap';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [ 
    listaPuntosCap,
  ],
  imports: [
      IonicPageModule.forChild(listaPuntosCap),
      PipesModule],
  exports: [
    listaPuntosCap]
})
export class listaPuntosCapModule {}
