import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InfoUsuChatPage } from './info-usu-chat';

@NgModule({
  declarations: [ 
    InfoUsuChatPage,
  ],
  imports: [
      IonicPageModule.forChild(InfoUsuChatPage)],
  exports: [
    InfoUsuChatPage]
})
export class InfoUsuChatPageModule {}
