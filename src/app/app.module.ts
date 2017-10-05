import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';

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
//import { InAppBrowser} from '@ionic-native/in-app-browser'
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { Deeplinks } from '@ionic-native/deeplinks';

import { Ng2EmojiModule } from 'ng2-emoji';

import { Player } from './player';
import { ConfiguracionService } from '../providers/configuracion.service';
import { EpisodiosService } from "../providers/episodios-service";
import { CadenasTwitterService } from "../providers/cadenasTwitter.service";

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { InfoFerPage } from '../pages/info-fer/info-fer';
import { ReproductorPage } from '../pages/reproductor/reproductor';
import { DetalleCapituloPage } from '../pages/detalle-capitulo/detalle-capitulo';
import { ChatPage } from '../pages/chat/chat';
import { InfoUsuChatPage } from "../pages/info-usu-chat/info-usu-chat";
import { InfoUsuarioPage } from "../pages/info-usuario/info-usuario";
import { MapaCafeteroPage } from "../pages/mapa-cafetero/mapa-cafetero";
import { CapitulosDescargadosPage } from "../pages/capitulos-descargados/capitulos-descargados";

import { DescargaCafetera } from '../components/descarga.component';
import { MenuExtComponent } from '../components/menuext/menuext';

import { tiempoHastaAhoraPipe } from './tiempoHastaAhora.pipe'
import { muestraHashtagPipe } from './muestraHashtag.pipe'
import { eliminaHashtagPipe } from './eliminaHashtag.pipe'
import { formateaFechaPipe } from './formateaFecha.pipe'

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
    eliminaHashtagPipe,
    formateaFechaPipe,
    InfoUsuChatPage,
    InfoUsuarioPage,
    MapaCafeteroPage,
    MenuExtComponent,
    CapitulosDescargadosPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    Ng2EmojiModule,
    IonicModule.forRoot(MyApp, { // Esta llave es para poner atrás en lugar de back en el menú de navegación
      backButtonText: ''}),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    InfoFerPage,
    ReproductorPage,
    DetalleCapituloPage,
    InfoUsuChatPage,
    ChatPage,
    InfoUsuarioPage,
    MapaCafeteroPage,
    MenuExtComponent,
    CapitulosDescargadosPage
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
              ScreenOrientation,
//              InAppBrowser,
              Deeplinks,
              Player,
              ConfiguracionService,
              EpisodiosService,
              CadenasTwitterService ]
})
export class AppModule {}
