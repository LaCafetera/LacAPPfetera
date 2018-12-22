import { Component, ViewChild, OnDestroy } from '@angular/core';
import { Nav, Platform, ToastController, MenuController, Events } from 'ionic-angular';
import { StatusBar} from '@ionic-native/status-bar';
import { Contacts, ContactField, ContactName, ContactAddress, ContactFindOptions } from '@ionic-native/contacts';
import { SplashScreen } from '@ionic-native/splash-screen';
//import { InAppBrowser} from '@ionic-native/in-app-browser'
import { Deeplinks } from '@ionic-native/deeplinks';
import { BackgroundMode } from '@ionic-native/background-mode';
import { Network } from '@ionic-native/network';
import { AppVersion } from '@ionic-native/app-version';

import { HomePage } from '../pages/home/home';
import { ConfiguracionService } from '../providers/configuracion.service';
import { EpisodiosService } from '../providers/episodios-service';
import { InfoUsuarioPage } from '../pages/info-usuario/info-usuario';
import { SlideInicioPage } from '../pages/slide-inicio/slide-inicio';


@Component({
  templateUrl: 'app.html',
  providers: [ConfiguracionService, StatusBar, SplashScreen, Contacts/*, InAppBrowser*/, Deeplinks, BackgroundMode, Network]
})
export class MyApp implements OnDestroy {
  @ViewChild(Nav) nav: Nav;

  soloWifi:boolean = false;
  fechasAbsolutas:boolean = false;
  // prueba: any;
  conectadoASpreaker: boolean = false;
  iniciando: boolean = false;

  chosenTheme: String;
  //modoNoche:boolean = false;
    availableThemes: {className: string, prettyName: string}[];

  rootPage: any; //HomePage;
  imgItem: string = "assets/icon/icon.png";
  nombreUsu: string = "Proscrito";
  descripcion: string = "Resistente de Sherwood"
  datosUsu: Array<any> = null;
  verApp: string = ''

  constructor(public _platform: Platform,
              private _configuracion: ConfiguracionService,
              public toastCtrl: ToastController,
              private barraEstado: StatusBar,
              private splashscreen: SplashScreen,
              private contacts: Contacts,
              private epService: EpisodiosService,
              //private iab: InAppBrowser,
              private _deepLink: Deeplinks,
              public menuCtrl: MenuController,
              private backgroundMode: BackgroundMode,
              public network: Network,
              public events: Events,
              private appVersion: AppVersion) {

    this.availableThemes = this._configuracion.availableThemes;
//    _platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
//    });
  }

  ngAfterViewInit() {
    this._platform.ready().then(() => {
      this._deepLink.routeWithNavController(this.nav,{
          '/:detalles':InfoUsuarioPage
        }).subscribe((match) => {
        //console.log('[app.component.ngAfterViewInit] Enrutado. $link: '/* + match.$route + ' - '*/ +  JSON.stringify(match.$link) );
        //console.log('[app.component.ngAfterViewInit] Enrutado. $args: '/* + match.$route + ' - '*/ + JSON.stringify(match.$args ) );
        //console.log('[app.component.ngAfterViewInit]          Código: '/* + match.$route + ' - '*/ + JSON.stringify(match.$args["code"] ) );
        this.epService.solicitaTokenViaCode(match.$args["code"]).subscribe(
            data => {
                console.log("[app.component.ngAfterViewInit] Descargados datos de conexión: " + JSON.stringify(data));
                this.habemusConexion(data.access_token);
            },
            err => {
                console.error("[app.component.ngAfterViewInit] Error solicitando datos de usuario " + JSON.stringify(err));
                this.logoutSpreaker();
            }
        );
      }, (nomatch) => {
        console.warn('[app.component.ngAfterViewInit] Enrutado incorrecto' + nomatch);
      });;
    })
    .catch((error)=>{
      console.log("[app.ngAfterViewInit] Error esperando a que el terminal responda: " + error);
      this.soloWifi=false;
    });
  }

    ngOnInit() {
      //console.log ('[app.component.ngOnInit]');

      this._platform.ready().then(() => {

        this.appVersion.getVersionNumber()
        .then ((version) => {
            this.verApp = version;
            console.info('[app.component.ngOnInit] ************** La versión es: ' + this.verApp)
            this._configuracion.primeraVez(version)
            .then ((yasTadoAqui) => {
                 console.info ('No es la primera vez que ejecutamos esta versión de la app');
                 if (!yasTadoAqui){
                   this.rootPage = SlideInicioPage;
                 }
                 else {
                   this.rootPage = HomePage;
                 }
            })
            .catch ((error)=> console.error('[HOME.ngOnInit] Error tratando de averiguar si es nuestra primera vez: ' + error));
        })
        .catch ((error)=> console.error('[HOME.ngOnInit] Error extrayendo versión de la app: ' + error));


        //this.barraEstado.styleDefault();
        this.splashscreen.hide();
        this._configuracion.getWIFI()
          .then((val)=> {
            this.soloWifi = val==true;
            console.log("[app.component.ngOnInit] getWIFI vale "+ val + " type " + typeof val);
          }).catch(()=>{
            console.log("[app.component.ngOnInit] Error recuperando valor WIFI");
            this.soloWifi=false;
        });

        this._configuracion.getTokenSpreaker()
          .then((val)=> {
            if (val == null || val == ""){
              this.conectadoASpreaker = false;
            }
            else {
              this.conectadoASpreaker = true;
              this.iniciando = true;
              this.actualizaAvatar (val);
            }
            console.log("[app.component.ngOnInit] getTokenSpreaker vale "+ val + " type " + typeof val);
          }).catch(()=>{
            console.log("[app.component.ngOnInit] Error recuperando valor token Spreaker");
            this.soloWifi=false;
        });
        console.log("[app.component.ngOnInit] Plataformas: " + this._platform.platforms());

        this._configuracion.theme.subscribe(val => {
          this.chosenTheme = val;
          console.log("[app.component.ngOnInit] El valor de tema elegido es " + this.chosenTheme);
          if (this._platform.is("ios")){
            this.barraEstado.overlaysWebView(true);
          }
          //this.barraEstado.backgroundColorByHexString("#000"); //-->ESto se lo voy a dejar a Mczhy. ;-)
          //StatusBar.backgroundColorByHexString("toolbar-title"); //-->ESto parece que no funciona :-(
        });

        this._configuracion.getFechasAbsolutas()
        .then((dato)=>this.fechasAbsolutas = dato==true)
        .catch((error) => console.log("[HOME.ionViewDidLoad] Error descargando usuario:" + error));


        if (!this._platform.is("ios")){
          this.backgroundMode.setDefaults({
            title: "La cAPPfetera",
            text: "Bienvenido al bosque de Sherwood",
          });
          this.backgroundMode.enable();
          this.backgroundMode.on('activate').subscribe(
          data => {
              console.log('[app.component.ngOnInit] Background activate: ' + JSON.stringify(data));
              this.backgroundMode.disableWebViewOptimizations();
          },
          err => {
              console.error('[app.component.ngOnInit] Background activate error: ' + JSON.stringify(err));
          });


          this.backgroundMode.on('enable').subscribe(
          data => {
              console.log('[app.component.ngOnInit] Background enable: ' + JSON.stringify(data));
          },
          err => {
              console.error('[app.component.ngOnInit] Background enable error: ' + JSON.stringify(err));
          });

          this.backgroundMode.on('disable').subscribe(
          data => {
              console.log('[app.component.ngOnInit] Background disable: ' + JSON.stringify(data));
          },
          err => {
              console.error('[app.component.ngOnInit] Background disable error: ' + JSON.stringify(err));
          });

          this.backgroundMode.on('deactivate').subscribe(
          data => {
              console.log('[app.component.ngOnInit] Background deactivate : ' + JSON.stringify(data));
          },
          err => {
              console.error('[app.component.ngOnInit] Background deactivate  error: ' + JSON.stringify(err));
          });

          this.backgroundMode.on('failure').subscribe(
          data => {
              console.log('[app.component.ngOnInit] Background failure : ' + JSON.stringify(data));
          },
          err => {
              console.error('[app.component.ngOnInit] Background failure  error: ' + JSON.stringify(err));
          });
          console.log('[app.component.ngOnInit] Background activado');
        }

        this.network.onchange().subscribe(
          data=> {
              console.log('[app.component.ngOnInit] Se ha producido un cambio de conexión ' + this.network.type);
              this.events.publish('conexion:status', {valor:this.network.type});
          },
          err => {
              console.error('[app.component.ngOnInit] Error en onchange: '  + err.message)
          }
        )
      })
      .catch((error)=>{
        console.log("[app.ngAfterViewInit] Error esperando a que el terminal responda: " + error);
      });
    }


    ngOnDestroy(){
      this.backgroundMode.disable();
      console.log("[app.component.ngOnDestroy] Saliendoooooooooooooooooooooooooooooo");
    }


    setTheme(e) {
    // https://webcake.co/theming-an-ionic-2-application/
        this._configuracion.setTheme(e);
    }

    setWIFI(e) {
        console.log("[app.component.setWIFI] El valor que trato de guardar es " + e.checked );
        this._configuracion.setWIFI(e.checked);
    }

    setFechasAbsolutas(e) {
        console.log("[app.component.setFechasAbsolutas] El valor que trato de guardar es " + e.checked );
        this._configuracion.setFechasAbsolutas(e.checked);
        this.events.publish('fechasAbsolutas:status', {valor:e.checked});
    }

    msgDescarga  (mensaje: string) {
        let toast = this.toastCtrl.create({
            message: mensaje,
            duration: 3000,
            cssClass: 'msgDescarga'
        });
        toast.present();
    }

    cafeteaAgenda(){
      let telefono:string = '627002002';
      let contact = this.contacts.create();
      let options = new ContactFindOptions();
      options.filter = telefono;
      options.multiple = false;
      //options.desiredFields = ["ContactName"];
      this.contacts.find(["phoneNumbers"], options)
        .then((contacts) => {
          if (contacts.length == 0){
            console.log("[app.component.cafeteaAgenda] Guardando en agenda ");
            contact.name = new ContactName('La Cafetera de Radiocable', 'La Cafetera');
            contact.phoneNumbers = [new ContactField ('mobile', telefono)]; //(type?: string, value?: string, pref?: boolean)
            contact.addresses = [new ContactAddress(true, 'Apartado de Correos', 'RadioCable en Internet. Apartado postal 18018 28080 Madrid', 'Apartado de correos 18018', 'Madrid', '', '28080', 'España')];
            contact.save().then(
              () => this.msgDescarga('Has dado de alta La Cafetera en tu agenda'),
              (error: any) => this.msgDescarga('Error guardando el contacto.'+ error));
          }
          else {
            this.msgDescarga ("El teléfono ya está en la agenda (" + contacts[0].displayName + ")");
          }
        })
        .catch ((error)=> {
            console.log("[app.component.cafeteaAgenda] Guardando en agenda "+ error.message);
            this.msgDescarga ("No puedo acceder a tu agenda. ¿Seguro que me has dado permiso?");
        });
    }

//Recibido http://localhost:8100/#access_token=bbcb70c068334b8fe067b34f69e5d318a45fb37a&expires_in=r&token_type=Bearer&scope=basic&state=cG9J6z16F2qHtZFr3w79sfd1aYqzK6ST"

    conexionSpreaker (evento){
      if(!evento.checked) {
        console.log("[app.component.conexionSpreaker] Estoy conectado a Spreaker así que desconecto");
        this.logoutSpreaker();
      }
      else {
        if (!this.iniciando){
          console.log("[app.component.conexionSpreaker] Estoy desconectado a Spreaker así que conecto");
          this.loginSpreaker();
        }
      }
      this.iniciando= false;
    }
// cordova plugin add ionic-plugin-deeplinks --variable URL_SCHEME=cappfetera --variable DEEPLINK_SCHEME=https --variable DEEPLINK_HOST=lacappfetera.mo
// npm install --save @ionic-native/deeplinks
    loginSpreaker(){
      /*let browser = */window.open('https://www.spreaker.com/oauth2/authorize?client_id=1093&response_type=code&state=cG9J6z16F2qHtZFr3w79sfd1aYqzK6ST&scope=basic&redirect_uri=cappfetera://lacappfetera.mo',
                                    '_system',
                                    'location=no,clearsessioncache=yes,clearcache=yes');
    }
/*
    loginSpreaker2(){
      // una conexión
      //let browser = this.iab.create('https://www.spreaker.com/connect/login?redirect=https://www.spreaker.com/oauth2/authorize?client_id=1093&response_type=token&state=cG9J6z16F2qHtZFr3w79sfd1aYqzK6ST&scope=basic&redirect_uri=http://localhost:8100',
      // cuatro conexiones.
      let browser = this.iab.create('https://www.spreaker.com/oauth2/authorize?client_id=1093&response_type=token&state=cG9J6z16F2qHtZFr3w79sfd1aYqzK6ST&scope=basic&redirect_uri=http://localhost:8100',
      // Cuatro conexiones, tirando de CODE
      //let browser = this.iab.create('https://www.spreaker.com/oauth2/authorize?client_id=1093&response_type=code&state=cG9J6z16F2qHtZFr3w79sfd1aYqzK6ST&scope=basic&redirect_uri=https://lacappfetera.mo',
                                    '_blank',
                                    'location=no,clearsessioncache=yes,clearcache=yes');
      browser.on('loadstart')
        .subscribe((event) => {
          let responseParameters;
          let parsedResponse = {};
          console.log ("[APP.loginSpreaker] URL recibido: " + event.url + " tipo " + event.type );
          if ((event.url).indexOf("http://localhost:8100") === 0) {
            if ((event.url).indexOf("?error") == -1) {
              //browser.removeEventListener("exit", (event) => {});
              browser.close();
              //if ((event.url).indexOf("http://localhost:8100") === 0 ){
                responseParameters = ((event.url).split("#")[1]).split("&");
              //}
              console.log ("[APP.loginSpreaker] responseParameters vale " + responseParameters);
              for (let i = 0; i < responseParameters.length; i++) {
                parsedResponse[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
              }
              if (parsedResponse["access_token"] !== undefined && parsedResponse["access_token"] !== null) { //conexión vía spreaker
                console.log ("[APP.loginSpreaker] Login vía Spreaker OK");
                this.habemusConexion(parsedResponse["access_token"]);
                //this._configuracion.setTokenSpreaker(parsedResponse["access_token"]);
                //this.actualizaAvatar(parsedResponse["access_token"]);
              }
            }
            else {
              this.conectadoASpreaker = false;
              console.log ("[APP.loginSpreaker] Error en la conexión: " + (event.url).split("?")[1]);
              this.msgDescarga ("Se ha producido un error conectando a Spreaker.");
            }
          }
          else if ((event.url).indexOf("https://www.spreaker.com/twitter/connect/return") === 0) {
            console.log("[APP.loginSpreaker] Conexión vía twitter");
            browser.close();
            responseParameters = ((event.url).split("?")[1]).split("&");
            for (let i = 0; i < responseParameters.length; i++) {
              parsedResponse[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
            }
            console.log("[APP.loginSpreaker] Parámetros recibdos: " + parsedResponse);
            if (parsedResponse["oauth_token"] !== undefined && parsedResponse["oauth_token"] !== null) { //conexión vía spreaker
              console.log ("[APP.loginSpreaker] Recibido Code; solicitando token");
              this.epService.solicitaTokenViaCode (parsedResponse["oauth_token"]).subscribe
                ((data) => {
                  console.log("[APP.loginSpreaker] Información recibida " + JSON.stringify(data));
                  this.habemusConexion(data.access_token);
                  //this._configuracion.setTokenSpreaker(parsedResponse["access_token"]);
                  //this.actualizaAvatar(parsedResponse["access_token"]);
                }),
                ((error) => {
                    console.log("[APP.loginSpreaker] Error recibiendo token " + error);
                });
            }
          }
        });
    /*  browser.on("exit") //comento esto, porque cuando conectas con un servicio que ya te "conoce" directamente cierra la web (Twitter) y lo considero como cancelado, por esto.
        .subscribe((event) =>{
          console.log ("[APP.loginSpreaker] Login cancelado. type: " + event.type + " url " + event.url + " code " + event.code + " message " + event.message);
        });*/
    //}

    habemusConexion (token: string){
      console.log ("[APP.habemusConexion] Procesando token "+ token);
      this._configuracion.setTokenSpreaker(token);
      this.actualizaAvatar(token);
      this.conectadoASpreaker = true;
      this.menuCtrl.close();
    }

    logoutSpreaker(){
      console.log ("[APP.logoutSpreaker] Desconectando de spreaker.");
      this._configuracion.setTokenSpreaker(null);
      this.actualizaAvatar(null);
      this.conectadoASpreaker = false;
    }

    actualizaAvatar (token:string){
      // console.log("[APP.actualizaAvatar] Solicitada actualización de avatar con token " + token);
      if (token != null){
        this.epService.whoAMi(token).subscribe
        ((data) => {
          //console.log("[APP.actualizaAvatar] Información recibida " + JSON.stringify(data));
          this.imgItem = data.response.user.image_url;
          this.nombreUsu = data.response.user.fullname;
          this.descripcion = data.response.user.description;
          this.datosUsu = data.response.user;
          console.log("[APP.actualizaAvatar] Avatar actualizado " + data.response.user.image_url);
        }),
        ((error) => {
            console.log("[APP.actualizaAvatar] Error actualizando Avatar " + error);
        });
      }
      else {
        this.imgItem = "assets/icon/icon.png";
        this.descripcion = "Resistente de Sherwood";
        this.nombreUsu = "Proscrito";
      }
    }

    ayuda(){
      this.nav.setRoot (SlideInicioPage);
    }
}
