import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SlideInicioPage } from './slide-inicio';
import { HomePageModule} from '../home/home.module';

@NgModule({
  declarations: [ 
    SlideInicioPage,
  ],
  imports: [
    IonicPageModule.forChild(SlideInicioPage),
    HomePageModule
  ],
  exports: [
    SlideInicioPage
  ]
})
export class SlideInicioPageModule {}
