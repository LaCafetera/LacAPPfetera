import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChatPage } from './chat';
import { PipesModule } from '../../pipes/pipes.module';


//import { InfoUsuChatPage } from "../info-usu-chat/info-usu-chat"; --> Esto estaba en el .ts 

@NgModule({
  declarations: [ 
    ChatPage,
  ],
  imports: [
    IonicPageModule.forChild(ChatPage),
    PipesModule],
  exports: [
    ChatPage]
})
export class ChatPageModule {}
