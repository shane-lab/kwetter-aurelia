import {inject} from 'aurelia-dependency-injection';
/* eslint-disable */
import {RouterConfiguration, Router, NavigationInstruction, Next, activationStrategy} from 'aurelia-router';
/* eslint-enable */

import {stepTypes, AuthGuard, PreActivateStep, PostCompleteStep} from './pipelines/index';
import {AuthService} from './shared/services/auth-service';

const unAuthorized = { publicOnly: true };
const authorized = { auth: true };

const p = () => new Promise((res, rej) => {

});

@inject(AuthService)
export class App {
  /** @type{Router} */router;
  /** @type{AuthService} */authService;
  constructor(authService) {
    this.authService = authService;
  }

  configureRouter(/** @type{RouterConfiguration} */config, /** @type{Router} */router) {
    config.title = 'Kwetter';
    config.options['pushState'] = true;
    config.options['root'] = '/';
    config.addAuthorizeStep(AuthGuard);
    config.addPipelineStep(stepTypes.preActivate, PreActivateStep);
    config.addPipelineStep(stepTypes.postComplete, PostCompleteStep);
    config.map([
      {route: ['', 'home'], moduleId: 'components/home/home-component', name: 'home', title: 'Home'},
      {route: ['login'], moduleId: 'components/auth/auth-component', name: 'login', title: 'Sign in', settings: unAuthorized},
      {route: ['register'], moduleId: 'components/auth/auth-component', name: 'register', title: 'Sign up', settings: unAuthorized},
      {route: ['settings'], moduleId: 'components/settings/settings-component', name: 'settings', title: 'Settings', settings: authorized},
      {route: ['search/:q?'], moduleId: 'components/search/search-component', name: 'search', title: 'Search'},
      {route: ['@/:name'], moduleId: 'components/profile/profile-component', name: 'profile', title: 'Profile'},
      {route: ['editor'], moduleId: 'components/editor/editor-component', name: 'editor', title: 'Editor', settings: authorized},
      {route: ['bad-gateway'], moduleId: 'components/error/bad-gateway-component', name: 'bad-gateway', title: 'Bad gateway'},
      {route: ['unexpected'], moduleId: 'components/error/unexpected-component', name: 'unexpected', title: 'Unexpected error'},
      {route: ['profile-not-found/:name'], moduleId: 'components/error/profile-not-found-component', name: 'profile-not-found', title: 'Profile not found'}
    ]);
    config.mapUnknownRoutes((instruction) => ({route: 'page-not-found', moduleId: 'components/error/page-not-found-component', title: 'Page Not Found'}));

    this.router = router;
  }

  activate() {
    return this.authService.populate();
  }
}
