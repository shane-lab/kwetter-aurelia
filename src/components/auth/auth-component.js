import {inject} from 'aurelia-dependency-injection';
import {Router, activationStrategy} from 'aurelia-router';
import {ValidationControllerFactory, ValidationRules} from 'aurelia-validation';

// import {map, retry} from 'rxjs/operators';

import {AuthService} from '../../shared/services/auth-service';
import {SharedState} from '../../shared/state/shared-state';
import {profileRules} from '../../shared/validation/profile-rules';
import {SocketIoService} from '../../shared/services/socket-io-service';
// import {mapping, invalid} from '../../shared/validation/socket-message';

@inject(AuthService, SocketIoService, SharedState, Router, ValidationControllerFactory)
export class AuthComponent {
  type = '';
  username = '';
  password = '';
  responseError = null;

  /** @type{AuthService} */authService;
  /** @type{SocketIoService} */socketService;
  /** @type{SharedState} */sharedState;
  /** @type{Router} */router;
  /** @type{ValidationController} */controller;
  constructor(authService, socketService, sharedState, router, /** @type{ValidationControllerFactory} */controllerFactory) {
    this.authService = authService;
    this.socketService = socketService;
    this.sharedState = sharedState;
    this.router = router;
    this.controller = controllerFactory.createForCurrentScope();

    // this.connection = this.socketService.connect()
    //   .pipe(retry())
    //   .pipe(map(mapping));

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

  // bind() {
  //   this.connection.subscribe(data => {
  //     if (invalid(data)) {
  //       return console.log('invalid', data);
  //     }

  //     console.log('valid', data);
  //   });
  // }

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
            // .then(data => this.connection.next({event: 'authenticated', data: data.data}))
            .then(data => this.router.navigateToRoute('home'))
            .catch(error => this.responseError = error.message);
        }
      });
  }
}
