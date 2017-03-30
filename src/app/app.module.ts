import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { InfoFerPage } from '../pages/info-fer/info-fer';
import { ReproductorPage } from '../pages/reproductor/reproductor';
import { DetalleCapituloPage } from '../pages/detalle-capitulo/detalle-capitulo';
import { ChatPage } from '../pages/chat/chat';

import { DescargaCafetera } from './descarga.component';
import { tiempoHastaAhoraPipe } from './tiempoHastaAhora.pipe'
import { muestraHashtagPipe } from './muestraHashtag.pipe'
import { eliminaHashtagPipe } from './eliminaHashtag.pipe'

@NgModule({
  declarations: [
    MyApp,
    DescargaCafetera,
    HomePage,
    InfoFerPage,
    ReproductorPage,
    DetalleCapituloPage,
    ChatPage,
    tiempoHastaAhoraPipe,
    muestraHashtagPipe,
    eliminaHashtagPipe
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
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
