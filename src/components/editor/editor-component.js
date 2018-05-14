import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';

import {Observable, Subject} from 'rxjs';
import {finalize, map, retry} from 'rxjs/operators';

import {SharedState} from '../../shared/state/shared-state';
import {ProfileService} from '../../shared/services/profile-service';
import {KweetService} from '../../shared/services/kweet-service';
import {ToastService} from '../../shared/services/toast-service';
import {QuoteService} from '../../shared/services/quote-service';
import {SocketService} from '../../shared/services/socket-service';

const URI = 'ws://localhost:4001'; // 10.50.0.81:8001

@inject(SharedState, ProfileService, KweetService, SocketService, QuoteService, ToastService, Router)
export class EditorComponent {
  message = '';
  quote = null;
  limit = 144;

  /** @type{SharedState} */sharedState;
  /** @type{ProfileService} */profileService;
  /** @type{KweetService} */kweetService;
  /** @type{SocketService} */socketService;
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

    this.connection = socketService.connect(URI)
      .pipe(retry())
      .pipe(map((/** @type{MessageEvent} */response) => {
        try {
          const data = JSON.parse(response.data);
          const {event = 'unknown'} = data;
          delete data.event;
          console.log('response', response);
          // const type = event === 'message' ? SocketMessageType.Message : event === 'change' ? SocketMessageType.Gate : SocketMessageType.Unkown;

          return { event, data };
        } catch (error) {
          console.error('error');

          return null;
        }
      }));
  }

  get length() {
    return this.message.trimLeft().length;
  }

  activate(params, routeConfig) {
    this.routeConfig = routeConfig;

    this.connection.subscribe((message) => {
      console.log('message', message);
    });
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
      .then(_ => {
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
