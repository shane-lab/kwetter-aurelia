import {bindable} from 'aurelia-framework';
import {inject} from 'aurelia-dependency-injection';

import {SharedState} from '../../shared/state/shared-state';
import {KweetService} from '../../shared/services/kweet-service';
import {ToastService} from '../../shared/services/toast-service';
import {DomEffectsService} from '../../shared/services/dom-effects-service';

@inject(SharedState, KweetService, ToastService, DomEffectsService)
export class KweetPreview {
  /** @type{{
    id: number,
    message: string,
    author: string,
    createdAt: Date,
    mentions: string[],
    hashTags: string[],
    favorites: number
  }} */
  @bindable kweet;
  @bindable favorited;
  @bindable onDeleteCb;
  fill = false;
  disabled = false;

  /** @type{SharedState} */sharedState;
  /** @type{KweetService} */kweetService;
  /** @type{ToastService} */toastService;
  /** @type{DomEffectsService} */domEffectsService;
  constructor(sharedState, kweetService, toastService, domEffectsService) {
    this.sharedState = sharedState;
    this.kweetService = kweetService;
    this.toastService = toastService;
    this.domEffectsService = domEffectsService;
  }

  attached() {
    this.disabled = this.isUser;
    if (this.sharedState.isAuthenticated && !this.isUser) {
      this.kweetService.isFavoritedBy(this.kweet.id, this.sharedState.currentUser.username)
        .then(favorited => this.favorited = favorited);
    }
  }

  get isUser() {
    return this.sharedState.isAuthenticated && this.kweet.author === this.sharedState.currentUser.username;
  }

  favorite(/** @type{MouseEvent} */$event) {
    if ($event.which !== 1) {
      return;
    }
    if (!this.sharedState.isAuthenticated) {
      return this.toastService.info('To favorite this Kweet, you must be signed in', 'Unauthorized');
    }
    if (this.isUser) {
      return this.toastService.info('You cannot favorite your own Kweets', 'Favorite interrupted');
    }
    const delegate = (this.favorited ? this.kweetService.unfavorite : this.kweetService.favorite).bind(this.kweetService);
    delegate(this.kweet.id)
      .then(_ => {
        const favorited = this.favorited = !this.favorited;
        this.kweet.favorites = (this.kweet.favorites + (favorited ? 1 : -1));
      });
  }

  delete(/** @type{MouseEvent} */$event) {
    if ($event.which !== 1) {
      return;
    }
    if (!this.sharedState.isAuthenticated) {
      return this.toastService.info('To delete this Kweet, you must be signed in', 'Unauthorized');
    }
    if (!this.isUser) {
      return this.toastService.info('You cannot delete other people\'s Kweets', 'Delete interrupted');
    }
    this.kweetService.destroy(this.kweet.id)
      .then(_ => this.onDeleteCb && this.onDeleteCb({kweet: this.kweet}));
  }

  mouseOver(/** @type{MouseEvent} */$event) {
    if (this.isUser) {
      if ($event.srcElement.tagName.toLowerCase() === 'button') {
        $event.srcElement.classList.add('has-background-danger');
      }
      return;
    }
    this.fill = true;
  }

  mouseLeave(/** @type{MouseEvent} */$event) {
    if (this.isUser) {
      if ($event.srcElement.tagName.toLowerCase() === 'button') {
        $event.srcElement.classList.remove('has-background-danger');
      }
      return;
    }
    this.fill = false;
  }
}
