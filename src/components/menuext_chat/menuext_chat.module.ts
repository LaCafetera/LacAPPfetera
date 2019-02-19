import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MenuExtChatComponent } from './menuext_chat';

@NgModule({
  declarations: [
    MenuExtChatComponent,
  ],
  imports: [
    IonicPageModule.forChild(MenuExtChatComponent),
  ],
  exports: [
    MenuExtChatComponent
  ],
  entryComponents: [
    MenuExtChatComponent
  ],
})
export class MenuExtChatComponentModule {}
