import { Directive } from '@angular/core';

/**
 * Generated class for the DirectivaDirective directive.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/DirectiveMetadata-class.html
 * for more info on Angular Directives.
 */
@Directive({
  selector: '[directiva]' // Attribute selector
})
export class DirectivaDirective {

  constructor() {
    console.log('Hello DirectivaDirective Directive');
  }

}
