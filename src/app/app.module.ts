import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { SQLite } from '@ionic-native/sqlite';
import { HttpModule } from '@angular/http';

import { File } from '@ionic-native/file';
import { Media } from '@ionic-native/media';
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
import { AndroidExoplayer } from '@ionic-native/android-exoplayer';

import { Ng2EmojiModule } from 'ng2-emoji';

import { Player } from './player';
import { PlayerAndroid } from './playerAndroid';
import { PlayerIOS } from './playerIOS';
import { ConfiguracionService } from '../providers/configuracion.service';
import { EpisodiosService } from "../providers/episodios-service";
import { CadenasTwitterService } from "../providers/cadenasTwitter.service";
import { EpisodiosGuardadosService } from "../providers/episodios_guardados.service";

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
import { listaPuntosCap } from "../pages/lista-Puntos-Cap/lista-Puntos-Cap";

import { DescargaCafetera } from '../components/descarga.component';
import { MenuExtComponent } from '../components/menuext/menuext';

import { tiempoHastaAhoraPipe } from './tiempoHastaAhora.pipe'
import { muestraHashtagPipe } from './muestraHashtag.pipe'
import { eliminaHashtagPipe } from './eliminaHashtag.pipe'
import { formateaFechaPipe } from './formateaFecha.pipe'

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    DescargaCafetera,
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
    CapitulosDescargadosPage,
    listaPuntosCap
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
    CapitulosDescargadosPage,
    listaPuntosCap
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler},
              File,
              Media,
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
              PlayerIOS,
              PlayerAndroid,
              ConfiguracionService,
              EpisodiosService,
              CadenasTwitterService,
              EpisodiosGuardadosService,
              AndroidExoplayer,
              SQLite]
})
export class AppModule {}
