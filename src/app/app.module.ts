import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { BrowserModule } from '@angular/platform-browser';

import { File } from '@ionic-native/file';
import { MediaPlugin } from '@ionic-native/media';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Dialogs } from '@ionic-native/dialogs';
import { Network } from '@ionic-native/network';
import { MusicControls } from '@ionic-native/music-controls';
import { BackgroundMode } from '@ionic-native/background-mode';
import { StatusBar } from '@ionic-native/status-bar';
import { Contacts } from '@ionic-native/contacts';
import { SplashScreen } from '@ionic-native/splash-screen';
import { InAppBrowser} from '@ionic-native/in-app-browser'

import { Player } from './player';
import { ConfiguracionService } from '../providers/configuracion.service';
import { EpisodiosService } from "../providers/episodios-service";
import { CadenasTwitterService } from "../providers/cadenasTwitter.service";

import { HttpModule } from '@angular/http';
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
    BrowserModule,
    HttpModule,
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
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}, 
              File, 
              MediaPlugin, 
              Dialogs, 
              SocialSharing, 
              Network, 
              MusicControls, 
              BackgroundMode, 
              StatusBar, 
              SplashScreen, 
              Contacts, 
              InAppBrowser,
              Player,
              ConfiguracionService,
              EpisodiosService,
              CadenasTwitterService ]
})
export class AppModule {}

