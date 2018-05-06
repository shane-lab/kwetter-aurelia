import {BindingEngine} from 'aurelia-framework';
import {inject} from 'aurelia-dependency-injection';

import {SharedState} from '../../shared/state/shared-state';
import {listTypes, KweetService} from '../../shared/services/kweet-service';
import {HashTagService} from '../../shared/services/tag-service';
import {ToastService} from '../../shared/services/toast-service';
import {ScrollService} from '../../shared/services/scroll-service';

@inject(SharedState, BindingEngine, KweetService, HashTagService, ToastService, ScrollService)
export class HomeComponent {
  kweets = [];
  shownList = listTypes.all;
  tags = [];
  filterTag = undefined;
  totalPages = 0;
  currentPage = 1;
  limit = 10;

  /** @type{SharedState} */sharedState;
  /** @type{BindingEngine} */bindingEngine;
  /** @type{KweetService} */kweetService;
  /** @type{HashTagService} */tagService;
  /** @type{ToastService} */toastService;
  /** @type{ScrollService} */scrollService;
  constructor(sharedState, bindingEngine, kweetService, tagService, toastService, scrollService) {
    this.sharedState = sharedState;
    this.bindingEngine = bindingEngine;
    this.kweetService = kweetService;
    this.tagService = tagService;
    this.toastService = toastService;
    this.scrollService = scrollService;
  }

  bind() {
    this.subscription = this.bindingEngine.propertyObserver(this.sharedState, 'isAuthenticated')
      .subscribe((newValue, oldValue) => {
        console.log('homeComponent isAuthenticated: ', newValue);
      });
  }

  unbind() {
    this.subscription.dispose();
  }

  attached() {
    this.getKweets();
    this.getTrends();
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
