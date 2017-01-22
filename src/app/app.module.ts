import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { InfoFerPage } from '../pages/info-fer/info-fer';
import { ReproductorPage } from '../pages/reproductor/reproductor';
import { DetalleCapituloPage } from '../pages/detalle-capitulo/detalle-capitulo';
import { ChatPage } from '../pages/chat/chat';

import { DescargaCafetera } from './descarga.component';
import { tiempoHastaAhoraPipe } from './tiempoHastaAhora.pipe'

@NgModule({
  declarations: [
    MyApp,
    DescargaCafetera,
    HomePage,
    InfoFerPage,
    ReproductorPage,
    DetalleCapituloPage,
    ChatPage,
    tiempoHastaAhoraPipe
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    InfoFerPage,
    ReproductorPage,
    DetalleCapituloPage,
    ChatPage
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}]
})
export class AppModule {}
