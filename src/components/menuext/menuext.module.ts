import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MenuExtComponent } from './menuext';

@NgModule({
  declarations: [
    MenuExtComponent,
  ],
  imports: [
    IonicPageModule.forChild(MenuExtComponent),
  ],
  exports: [
    MenuExtComponent
  ],
  entryComponents: [
    MenuExtComponent
  ],
})
export class MenuExtComponentModule {}
