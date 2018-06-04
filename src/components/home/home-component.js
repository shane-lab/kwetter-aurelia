import {BindingEngine} from 'aurelia-framework';
import {inject} from 'aurelia-dependency-injection';

import {map, retry} from 'rxjs/operators';

import {SharedState} from '../../shared/state/shared-state';
import {listTypes, KweetService} from '../../shared/services/kweet-service';
import {HashTagService} from '../../shared/services/tag-service';
import {SocketIoService} from '../../shared/services/socket-io-service';
import {ToastService} from '../../shared/services/toast-service';
import {ScrollService} from '../../shared/services/scroll-service';
import {mapping, invalid, MessageType, MessageEvent} from '../../shared/validation/socket-message';

@inject(SharedState, BindingEngine, KweetService, HashTagService, SocketIoService, ToastService, ScrollService)
export class HomeComponent {
  kweets = [];
  shownList = listTypes.all;
  tags = [];
  filterTag = undefined;
  totalPages = 0;
  currentPage = 1;
  limit = 10;
  autoUpdate = false;
  newKweets = 0;

  /** @type{SharedState} */sharedState;
  /** @type{BindingEngine} */bindingEngine;
  /** @type{KweetService} */kweetService;
  /** @type{HashTagService} */tagService;
  /** @type{SocketIoService} */socketService;
  /** @type{ToastService} */toastService;
  /** @type{ScrollService} */scrollService;
  constructor(sharedState, bindingEngine, kweetService, tagService, socketService, toastService, scrollService) {
    this.sharedState = sharedState;
    this.bindingEngine = bindingEngine;
    this.kweetService = kweetService;
    this.tagService = tagService;
    this.socketService = socketService;
    this.toastService = toastService;
    this.scrollService = scrollService;

    this.autoUpdate = window.localStorage['auto_update'];

    this.connection = this.socketService.connect()
      .pipe(retry())
      .pipe(map(mapping));
  }

  bind() {
    this.subscription = this.bindingEngine.propertyObserver(this.sharedState, 'isAuthenticated')
      .subscribe((newValue, oldValue) => {
        console.log('homeComponent isAuthenticated: ', newValue);
      });

    this.connection.subscribe(response => {
      console.log(response);
      if (invalid(response)) {
        return console.log('invalid', response);
      }

      if (response.type === MessageType.FEED) {
        if (!this.filterTag || this.filterTag && response.data.hashTags.length && response.data.hashTags.find((tag) => tag.name === this.filterTag)) {
          if (response.event === MessageEvent.KWEET_CREATE) {
            if (this.autoUpdate) {
              this.kweets.unshift(response.data);
            } else {
              this.newKweets++;
            }
          }
          if (response.event === MessageEvent.KWEET_DELETE) {
            // if (this.autoUpdate) {
              const index = this.kweets.findIndex((kweet) => kweet.id === response.data.id) || -1;
              console.log(index);
              if (index !== -1) {
                this.kweets[index].deleted = true;
              }
            // }
          }
        }
      }
    });
  }

  unbind() {
    this.subscription.dispose();
  }

  attached() {
    this.getKweets();
    this.getTrends();
  }

  loadKweets() {
    this.newKweets = 0;
    this.getKweets();
  }

  enableLiveUpdate() {
    if (!this.sharedState.isAuthenticated) {
      return this.toastService.info('To enable the auto update feature, you must be signed in', 'Unauthorized', { closeInterval: 2000 });
    }

    window.localStorage['auto_update'] = true;

    this.loadKweets();
  }

  getKweets() {
    const page = this.currentPage - 1 < 0 ? 0 : this.currentPage - 1;
    const params = {
      size: this.limit,
      page
    };
    let promised;
    if (this.shownList === listTypes.all) {
      promised = this.kweetService.getAll(params);
    } else if (this.shownList === listTypes.hashTag) {
      promised = this.kweetService.getByHashtag(this.filterTag, params);
    } else if (this.shownList === listTypes.feed) {
      promised = this.kweetService.getTimeline(this.sharedState.currentUser.username, params);
    }

    if (promised) {
      promised.then(this.resolveKweets.bind(this));
    }
  }

  resolveKweets(response) {
    this.kweets.splice(0);
    if (response.data) {
      this.kweets.push(...response.data.items);
      this.totalPages = response.data.pages;
    }
  }

  getTrends() {
    this.tagService.getTrends()
      .then(response => {
        this.tags.splice(0);
        if (response.data) {
          this.tags.push(...response.data.map(tag => tag.name));
        }
      });
  }

  setListTo(type, tag) {
    if (type === 'feed' && !this.sharedState.isAuthenticated) {
      return this.toastService.info('To view your feed, you must be signed in', 'Unauthorized');
    }
    this.filterTag = this.filterTag === tag ? undefined : tag;
    this.shownList = !this.filterTag && this.shownList === listTypes.hashTag ? listTypes.all : type;
    this.currentPage = 1;
    this.getKweets();
  }

  setPageTo(pageNumber) {
    this.currentPage = pageNumber;
    this.getKweets();

    this.scrollService.scrollToElement(document.getElementById('container'), 100);
  }

  kweetDeleted(kweet) {
    this.getKweets();
  }
}
