import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CapitulosDescargadosPage } from './capitulos-descargados';

@NgModule({
  declarations: [
    CapitulosDescargadosPage,
  ],
  imports: [
    IonicPageModule.forChild(CapitulosDescargadosPage),
  ],
  exports: [
    CapitulosDescargadosPage
  ]
})
export class CapitulosDescargadosPageModule {}
