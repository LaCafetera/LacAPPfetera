import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InfoFerPage } from './info-fer';
//import { ItemUserComponent } from './components/item-user/item-user';
//import { HighlightDirective } from './directives/highlight/highlight';
//import { ReversePipe } from './pipes/reverse';

@NgModule({
  declarations: [ 
    InfoFerPage,
  ],
  imports: [
    /*ItemUserComponent, HighlightDirective, ReversePipe,*/ IonicPageModule.forChild(InfoFerPage)],
  exports: [
    InfoFerPage]
})
export class InfoFerModule {}
