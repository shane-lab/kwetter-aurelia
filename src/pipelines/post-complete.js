/* eslint-disable */
import {NavigationInstruction, Next} from 'aurelia-router';
/* eslint-enable */

export class PostCompleteStep {
  run(/** @type{NavigationInstruction} */instruction, /** @type{Next} */next) {
    if (!instruction.config.settings || (instruction.config.settings && !instruction.config.settings.keepScroll)) {
      window.scrollTo(0, 0);
    }

    return next();
  }
}
