import {inject} from 'aurelia-dependency-injection';
import {bindable, bindingMode} from 'aurelia-framework';
import {Router} from 'aurelia-router';

import {AuthService} from '../services/auth-service';
import {SharedState} from '../state/shared-state';

@inject(AuthService, SharedState, Router)
export class HeaderLayout {
  activeRoute = '';
  menuOpen = false;
  @bindable({defaultBindingMode: bindingMode.twoWay}) routerConfig;

  /** @type{AuthService} */authService;
  /** @type{SharedState} */sharedState;
  /** @type{Router} */router;
  constructor(authService, sharedState, router) {
    this.authService = authService;
    this.sharedState = sharedState;
    this.router = router;
  }

  logout() {
    this.authService.purgeAuth();
    this.router.navigateToRoute('home');
  }

  routerConfigChanged(newValue, oldValue) {
    this.activeRoute = newValue.name;
  }

  toggleMenu($event) {
    this.menuOpen = !this.menuOpen;
  }
}
