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

  constructor(public platform: Platform, private _configuracion: ConfiguracionService) {
    this.availableThemes = this._configuracion.availableThemes;
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
    });
  }

    ngOnInit() {
      console.log ('[app.component.ngOnInit]');
      this._configuracion.theme.subscribe(val => {
        this.chosenTheme = val;
        console.log("[app.component.ngOnInit] El valor de tema elegido es " + this.chosenTheme);
        if (this.platform.is("ios")){
          StatusBar.overlaysWebView(false);
        }
        // StatusBar.backgroundColorByHexString($base-fondoBarra); -->ESto se lo voy a dejar a Mczhy. ;-)
      });
    }
      
    public setTheme(e) {
        this._configuracion.setTheme(e);
    }

    // https://webcake.co/theming-an-ionic-2-application/
}
