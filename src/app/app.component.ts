import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';

import { HomePage } from '../pages/home/home';
import { ConfiguracionService } from '../providers/configuracion.service';


@Component({
  templateUrl: 'app.html',
  providers: [ConfiguracionService]
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  chosenTheme: String;
  //modoNoche:boolean = false;
    availableThemes: {className: string, prettyName: string}[];

  rootPage = HomePage;

  constructor(platform: Platform, private _configuracion: ConfiguracionService) {
    this._configuracion.getTheme().subscribe(val => this.chosenTheme = val);
        // similarly, as promised, we've moved availableThemes to SettingsService,
        // and therefore need to call that property here
    this.availableThemes = this._configuracion.availableThemes;
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
    });

  }

  openPage() {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
   // this.nav.setRoot(HomePage);
   console.log ('Presionado botón de cierre de menú')
  }
  
    public setTheme(e) {
        this._configuracion.setTheme(e);
    }
/*
    cambiaModo(){
      let color:string;
        if (this.modoNoche){
            color="tema-noche";
        }
        else{
            color= "tema-base";
        }
        this._configuracion.setTheme(color);
        console.log("[APP.cambiaModo] Cambiado color a "+ color);
    }*/
    // https://webcake.co/theming-an-ionic-2-application/
}
