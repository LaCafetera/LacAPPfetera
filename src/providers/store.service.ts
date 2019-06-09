import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file';
import { Platform} from 'ionic-angular';

/*
  Generated class for the StoreProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class StoreProvider {

  constructor(private file: File, public platform : Platform) {
  }

  andeLoDejo (): string{
      if (this.platform.is('ios')){
          return (this.file.dataDirectory);
      }
      else {
          return (this.file.externalDataDirectory);
      }
  }

}
