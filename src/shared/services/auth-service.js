import {inject} from 'aurelia-dependency-injection';

import {ApiService} from './api-service';
import {JwtService} from './jwt-service';
import {SharedState} from '../state/shared-state';

@inject(ApiService, JwtService, SharedState)
export class AuthService {
  /** @type{ApiService} */apiService;
  /** @type{JwtService} */jwtService;
  /** @type{SharedState} */sharedState;
  constructor(apiService, jwtService, sharedState) {
    this.apiService = apiService;
    this.jwtService = jwtService;
    this.sharedState = sharedState;
  }

  populate() {
    if (this.jwtService.getToken()) {
      return this.apiService.post('/auth/refresh')
        .then(response => this.setAuth(response))
        .catch(this.purgeAuth.bind(this));
    }
    return Promise.resolve(this.purgeAuth);
  }

  setAuth(response) {
    if (response.data) {
      this.sharedState.currentUser = response.data;
    }
  }

  purgeAuth() {
    this.jwtService.destroyToken();
    this.sharedState.currentUser = null;
  }

  attemptAuth(type, credentials) {
    const route = (type === 'login') ? '/auth/login' : '/users';
    return this.apiService.post(route, credentials)
      .then(response => {
        this.setAuth(response);
        return response.data;
      });
  }
}
