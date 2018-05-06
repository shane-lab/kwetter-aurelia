import {inject} from 'aurelia-dependency-injection';
/* eslint-disable */
import {Redirect, NavigationInstruction, Next} from 'aurelia-router';
/* eslint-enable */

import {SharedState} from '../shared/state/shared-state';

@inject(SharedState)
export class AuthGuard {
  /** @type{SharedState} */sharedState;
  constructor(sharedState) {
    this.sharedState = sharedState;
  }

  run(/** @type{NavigationInstruction} */instruction, /** @type{Next} */next) {
    const signedIn = this.sharedState.isAuthenticated;
    const {publicOnly, auth} = instruction.config.settings || {};
    if (!signedIn && auth) {
      return next.cancel(new Redirect('login'));
    }
    if (signedIn && publicOnly) {
      return next.cancel(new Redirect('profile'));
    }

    return next();
  }
}
