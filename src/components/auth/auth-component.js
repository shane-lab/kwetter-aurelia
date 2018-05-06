import {inject} from 'aurelia-dependency-injection';
import {Router, activationStrategy} from 'aurelia-router';
import {ValidationControllerFactory, ValidationRules} from 'aurelia-validation';

import {AuthService} from '../../shared/services/auth-service';
import {SharedState} from '../../shared/state/shared-state';
import {profileRules} from '../../shared/validation/profile-rules';

@inject(AuthService, SharedState, Router, ValidationControllerFactory)
export class AuthComponent {
  type = '';
  username = '';
  password = '';
  responseError = null;

  /** @type{AuthService} */authService;
  /** @type{SharedState} */sharedState;
  /** @type{Router} */router;
  /** @type{ValidationController} */controller;
  constructor(authService, sharedState, router, /** @type{ValidationControllerFactory} */controllerFactory) {
    this.authService = authService;
    this.sharedState = sharedState;
    this.router = router;
    this.controller = controllerFactory.createForCurrentScope();

    ValidationRules
      .ensure('username').required().minLength(profileRules.username.minLength).matches(profileRules.username.pattern)
      .ensure('password').required().minLength(profileRules.password.minLength)
      .on(this);
  }

  determineActivationStrategy() {
    return activationStrategy.replace;
  }

  activate(params, routeConfig) {
    this.type = routeConfig.name;
  }

  get canSave() {
    return this.username !== '' && this.password !== '';
  }

  get usernameError() {
    const errors = this.controller.errors.filter(e => e.propertyName === 'username');
    return errors.length ? errors[0].message : undefined;
  }

  get passwordError() {
    const errors = this.controller.errors.filter(e => e.propertyName === 'password');
    return errors.length ? errors[0].message : undefined;
  }

  submit() {
    this.responseError = null;

    this.controller.validate()
      .then(result => {
        if (result.valid) {
          this.authService.attemptAuth(this.type, {
            username: this.username,
            password: this.password
          })
            .then(data => this.router.navigateToRoute('home'))
            .catch(error => this.responseError = error.message);
        }
      });
  }
}
