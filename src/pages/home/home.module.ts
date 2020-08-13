import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HomePage } from './home';
import { InfoFerModule } from '../info-fer/info-fer.module';

import { ReproductorPageModule } from '../reproductor/reproductor.module';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [HomePage],
  imports: [IonicPageModule.forChild(HomePage),
    PipesModule, ReproductorPageModule, InfoFerModule],
    exports: [HomePage]
})

export class HomePageModule { }
