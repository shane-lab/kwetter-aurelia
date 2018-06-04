import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';

import {map, retry} from 'rxjs/operators';

import {SharedState} from '../../shared/state/shared-state';
import {ProfileService} from '../../shared/services/profile-service';
import {KweetService} from '../../shared/services/kweet-service';
import {ToastService} from '../../shared/services/toast-service';
import {QuoteService} from '../../shared/services/quote-service';
import {SocketIoService} from '../../shared/services/socket-io-service';
import {mapping} from '../../shared/validation/socket-message';

@inject(SharedState, ProfileService, KweetService, SocketIoService, QuoteService, ToastService, Router)
export class EditorComponent {
  message = '';
  quote = null;
  limit = 144;

  /** @type{SharedState} */sharedState;
  /** @type{ProfileService} */profileService;
  /** @type{KweetService} */kweetService;
  /** @type{SocketIoService} */socketService;
  /** @type{QuoteService} */quoteService;
  /** @type{ToastService} */toastService;
  /** @type{Router} */router;
  constructor(sharedState, profileService, kweetService, socketService, quoteService, toastService, router) {
    this.sharedState = sharedState;
    this.profileService = profileService;
    this.kweetService = kweetService;
    this.socketService = socketService;
    this.quoteService = quoteService;
    this.toastService = toastService;
    this.router = router;

    this.connection = this.socketService.connect()
      .pipe(retry())
      .pipe(map(mapping));
  }

  get length() {
    return this.message.trimLeft().length;
  }

  activate(params, routeConfig) {
    this.routeConfig = routeConfig;
  }

  publish() {
    if (!/\w(\w(\.{1}|\s{1})?)+\w$/.test(this.message.trim())) {
      this.message = '';
      return this.toastService.info('The Kweet may not be empty', 'Publish error');
    }
    if (this.message.length > this.limit) {
      return this.toastService.info(`A Kweet can only take up to ${this.limit} characters`, 'Publish error');
    }
    const message = this.message.trimRight().trimLeft();
    this.kweetService.save(message)
      .then(kweet => {
        this.connection.next({event: 'kweet_create', data: kweet});
        this.toastService.success('Posted a new Kweet', 'success', { closeInterval: 2000 });
        this.router.navigateToRoute('home');
      });
  }

  inspiration() {
    this.quoteService.get()
      .then(quote => this.quote = {
        quote: quote.quote,
        author: quote.author
      });
  }
}
