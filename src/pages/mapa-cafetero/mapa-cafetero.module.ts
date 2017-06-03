import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MapaCafeteroPage } from './mapa-cafetero';

@NgModule({
  declarations: [
    MapaCafeteroPage,
  ],
  imports: [
    IonicPageModule.forChild(MapaCafeteroPage),
  ],
  exports: [
    MapaCafeteroPage
  ]
})
export class MapaCafeteroPageModule {}
