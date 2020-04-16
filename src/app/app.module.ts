import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { SQLite } from '@ionic-native/sqlite/ngx';
import { HttpModule } from '@angular/http';

import { File } from '@ionic-native/file/ngx';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { Media } from '@ionic-native/media/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Dialogs } from '@ionic-native/dialogs/ngx';
import { Network } from '@ionic-native/network/ngx';
import { MusicControls } from '@ionic-native/music-controls/ngx';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Contacts } from '@ionic-native/contacts/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
//import { InAppBrowser} from '@ionic-native/in-app-browser'
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import { AndroidExoplayer } from '@ionic-native/android-exoplayer/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Downloader } from '@ionic-native/downloader/ngx';
import { Vibration } from '@ionic-native/vibration/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';

//import { Ng2EmojiModule } from 'ng2-emoji';

import { Player } from './player';
import { PlayerAndroid } from './playerAndroid';
import { PlayerIOS } from './playerIOS';
import { ConfiguracionService } from '../providers/configuracion.service';
import { EpisodiosService } from "../providers/episodios-service";
import { CadenasTwitterService } from "../providers/cadenasTwitter.service";
import { EpisodiosGuardadosService } from "../providers/episodios_guardados.service";
import { DescargaCafetera } from '../providers/descarga.service';
import { StoreProvider } from '../providers/store.service';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { InfoFerPage } from '../pages/info-fer/info-fer';
import { ReproductorPage } from '../pages/reproductor/reproductor';
//import { DetalleCapituloPage } from '../pages/detalle-capitulo/detalle-capitulo';
import { ChatPage } from '../pages/chat/chat';
import { InfoUsuChatPage } from "../pages/info-usu-chat/info-usu-chat";
import { InfoUsuarioPage } from "../pages/info-usuario/info-usuario";
import { MapaCafeteroPage } from "../pages/mapa-cafetero/mapa-cafetero";
import { CapitulosDescargadosPage } from "../pages/capitulos-descargados/capitulos-descargados";
import { listaPuntosCap } from "../pages/lista-Puntos-Cap/lista-Puntos-Cap";
import { SlideInicioPage } from "../pages/slide-inicio/slide-inicio";
import { MapaOyentesPage } from "../pages/mapa-oyentes/mapa-oyentes";

import { MenuExtComponent } from '../components/menuext/menuext';
import { MenuExtDescComponent } from '../components/menuext_descargados/menuext_descargados';
import { MenuExtChatComponent } from '../components/menuext_chat/menuext_chat';

import { tiempoHastaAhoraPipe } from './tiempoHastaAhora.pipe'
import { muestraHashtagPipe } from './muestraHashtag.pipe'
import { eliminaHashtagPipe } from './eliminaHashtag.pipe'
import { formateaFechaPipe } from './formateaFecha.pipe'
import { formateaTiempoPipe } from './formateaTiempo.pipe'

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    InfoFerPage,
    ReproductorPage,
    //DetalleCapituloPage,
    ChatPage,
    tiempoHastaAhoraPipe,
    muestraHashtagPipe,
    eliminaHashtagPipe,
    formateaFechaPipe,
    formateaTiempoPipe,
    InfoUsuChatPage,
    InfoUsuarioPage,
    MapaCafeteroPage,
    MenuExtComponent,
    MenuExtDescComponent, 
    MenuExtChatComponent,
    CapitulosDescargadosPage,
    listaPuntosCap,
    SlideInicioPage,
    MapaOyentesPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    //Ng2EmojiModule,
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
    //DetalleCapituloPage,
    InfoUsuChatPage,
    ChatPage,
    InfoUsuarioPage,
    MapaCafeteroPage,
    MenuExtComponent,
    MenuExtDescComponent, 
    MenuExtChatComponent, 
    CapitulosDescargadosPage,
    listaPuntosCap,
    SlideInicioPage,
    MapaOyentesPage
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler},
              File,
              FileTransfer, FileTransferObject,
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
              DescargaCafetera,
              AndroidExoplayer,
              SQLite,
              AppVersion,
              Geolocation,
              Downloader,
              Vibration,
              LocalNotifications,
    StoreProvider]
})
export class AppModule {}
