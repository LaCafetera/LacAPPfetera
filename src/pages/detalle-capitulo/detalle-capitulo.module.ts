import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DetalleCapituloPage } from './detalle-capitulo';

@NgModule({
  declarations: [ 
    DetalleCapituloPage,
  ],
  imports: [
    IonicPageModule.forChild(DetalleCapituloPage)],
  exports: [
    DetalleCapituloPage]
})
export class DetalleCapituloPageModule {}
