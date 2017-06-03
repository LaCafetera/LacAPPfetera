import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, ToastController } from 'ionic-angular';
import { StatusBar} from '@ionic-native/status-bar';
import { Contacts, ContactField, ContactName, ContactAddress, ContactFindOptions } from '@ionic-native/contacts';
import { SplashScreen } from '@ionic-native/splash-screen';
import { InAppBrowser} from '@ionic-native/in-app-browser'

import { HomePage } from '../pages/home/home';
import { ConfiguracionService } from '../providers/configuracion.service';
import { EpisodiosService } from '../providers/episodios-service';
//import { InfoUsuarioPage } from "../pages/info-usuario/info-usuario";


@Component({
  templateUrl: 'app.html',
  providers: [ConfiguracionService, StatusBar, SplashScreen, Contacts, InAppBrowser]
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  soloWifi:boolean = false;
  // prueba: any;
  conectadoASpreaker: boolean = false;
  iniciando: boolean = false;

  chosenTheme: String;
  //modoNoche:boolean = false;
    availableThemes: {className: string, prettyName: string}[];

  rootPage = HomePage;
  imgItem: string = "assets/icon/icon.png";
  nombreUsu: string = "Proscrito";
  descripcion: string = "Resistente de Sherwood"
  datosUsu: Array<any> = null;

  constructor(public platform: Platform, 
              private _configuracion: ConfiguracionService, 
              public toastCtrl: ToastController, 
              private barraEstado: StatusBar, 
              private splashscreen: SplashScreen, 
              private contacts: Contacts,
              private epService: EpisodiosService,
              private iab: InAppBrowser) {

    this.availableThemes = this._configuracion.availableThemes;
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.barraEstado.styleDefault();
      this.splashscreen.hide();
    });
  }

    ngOnInit() {
      //console.log ('[app.component.ngOnInit]');

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

      this._configuracion.theme.subscribe(val => {
        this.chosenTheme = val;
        console.log("[app.component.ngOnInit] El valor de tema elegido es " + this.chosenTheme);
        if (this.platform.is("ios")){
          this.barraEstado.overlaysWebView(true);
        }
        this.barraEstado.backgroundColorByHexString("#000"); //-->ESto se lo voy a dejar a Mczhy. ;-)
        //StatusBar.backgroundColorByHexString("toolbar-title"); //-->ESto parece que no funciona :-( 
      });
    }

    setTheme(e) {
    // https://webcake.co/theming-an-ionic-2-application/
        this._configuracion.setTheme(e);
    }

    setWIFI(e) {
        console.log("[app.component.setWIFI] El valor que trato de guardar es " + e.checked );
        this._configuracion.setWIFI(e.checked);
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
            contact.addresses = [new ContactAddress(true, 'Apartado de Correos', 'RadioCable en Internet. Apartado postal 82042 28080 Madrid', 'Apartado de correos 82042', 'Madrid', '', '28080', 'España')];
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
            this.msgDescarga ("Se ha producido un error " + error.message);
        });
    }

//Recibido http://localhost:8100/#access_token=bbcb70c068334b8fe067b34f69e5d318a45fb37a&expires_in=r&token_type=Bearer&scope=basic&state=cG9J6z16F2qHtZFr3w79sdf1aYqzK6ST"

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

    loginSpreaker(){
      let browser = this.iab.create('https://www.spreaker.com/oauth2/authorize?client_id=1093&response_type=token&state=cG9J6z16F2qHtZFr3w79sdf1aYqzK6ST&scope=basic&redirect_uri=http://localhost:8100', 
                                    '_blank', 
                                    'location=no,clearsessioncache=yes,clearcache=yes');
      browser.on('loadstart')
        .subscribe((event) => {
          let responseParameters;
          console.log ("[APP.loginSpreaker] URL recibido: " + event.url + " tipo " + event.type );
          if ((event.url).indexOf("http://localhost:8100") === 0) {
            //browser.removeEventListener("exit", (event) => {});
            browser.close();
            if ((event.url).indexOf("http://localhost:8100") === 0 ){
              responseParameters = ((event.url).split("#")[1]).split("&");
            }
            console.log ("[APP.loginSpreaker] responseParameters vale " + responseParameters);
            let parsedResponse = {};
            for (let i = 0; i < responseParameters.length; i++) {
              parsedResponse[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
            }
            if (parsedResponse["access_token"] !== undefined && parsedResponse["access_token"] !== null) { //conexión vía spreaker
              console.log ("[APP.loginSpreaker] Login vía Spreaker OK");
              this._configuracion.setTokenSpreaker(parsedResponse["access_token"]);
              this.actualizaAvatar(parsedResponse["access_token"]);
            } 
          }
         });
    /*  browser.on("exit") //comento esto, porque cuando conectas con un servicio que ya te "conoce" directamente cierra la web (Twitter) y lo considero como cancelado, por esto.
        .subscribe((event) =>{
          console.log ("[APP.loginSpreaker] Login cancelado. type: " + event.type + " url " + event.url + " code " + event.code + " message " + event.message);
        });*/
    }

    logoutSpreaker(){
      console.log ("[APP.logoutSpreaker] Desconectando de spreaker.");
      this._configuracion.setTokenSpreaker(null);
      this.actualizaAvatar(null);
    }

    actualizaAvatar (token:string){
      console.log("[APP.actualizaAvatar] Solicitada actualización de avatar con token " + token);
      if (token != null){
        this.epService.whoAMi(token).subscribe
        ((data) => {
          console.log("[APP.actualizaAvatar] Información recibida " + JSON.stringify(data));
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
}

