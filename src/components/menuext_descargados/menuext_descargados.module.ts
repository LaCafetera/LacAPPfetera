import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MenuExtDescComponent } from './menuext_descargados';

@NgModule({
  declarations: [
    MenuExtDescComponent,
  ],
  imports: [
    IonicPageModule.forChild(MenuExtDescComponent),
  ],
  exports: [
    MenuExtDescComponent
  ],
  entryComponents: [
    MenuExtDescComponent
  ],
})
export class MenuExtDescComponentModule {}
