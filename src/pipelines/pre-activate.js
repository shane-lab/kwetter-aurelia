import {inject} from 'aurelia-dependency-injection';
/* eslint-disable */
import {Redirect, NavigationInstruction, Next} from 'aurelia-router';
/* eslint-enable */

import {ApiService} from '../shared/services/api-service';
import {AuthService} from '../shared/services/auth-service';
import {SharedState} from '../shared/state/shared-state';

@inject(ApiService, AuthService, SharedState)
export class PreActivateStep {
  /** @type{ApiService} */apiService;
  /** @type{AuthService} */authService;
  /** @type{SharedState} */sharedState;
  constructor(apiService, authService, sharedState) {
    this.apiService = apiService;
    this.authService = authService;
    this.sharedState = sharedState;
  }

  run(/** @type{NavigationInstruction} */instruction, /** @type{Next} */next) {
    return this.apiService.ping()
      .then(ok => ok ? next() : this.reinitiate(next))
      .catch(_ => instruction.fragment !== '/bad-gateway' ? next.cancel(new Redirect('bad-gateway')) : next());
  }

  reinitiate(/** @type{Next} */next) {
    if (!this.sharedState.isAuthenticated) {
      this.authService.populate();
    }
    return next.cancel(new Redirect('home'));
  }
}
