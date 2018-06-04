import {bindable} from 'aurelia-framework';
import {inject} from 'aurelia-dependency-injection';

import {map, retry} from 'rxjs/operators';

import {SharedState} from '../../shared/state/shared-state';
import {KweetService} from '../../shared/services/kweet-service';
import {SocketIoService} from '../../shared/services/socket-io-service';
import {ToastService} from '../../shared/services/toast-service';
import {mapping} from '../../shared/validation/socket-message';

@inject(SharedState, KweetService, SocketIoService, ToastService)
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
  /** @type{SocketIoService} */socketService;
  /** @type{ToastService} */toastService;
  constructor(sharedState, kweetService, socketService, toastService) {
    this.sharedState = sharedState;
    this.kweetService = kweetService;
    this.socketService = socketService;
    this.toastService = toastService;

    this.connection = this.socketService.connect()
      .pipe(retry())
      .pipe(map(mapping));
  }

  attached() {
    this.disabled = this.isUser;
    if (this.sharedState.isAuthenticated && !this.isUser) {
      this.kweetService.isFavoritedBy(this.kweet.id, this.sharedState.currentUser.username)
        .then(favorited => this.favorited = favorited);
    }
  }

  get message() {
    return this.isDeleted ? '<i>This Kweet has been removed</i>' : this.kweet.message;
  }

  get isDeleted() {
    return this.kweet.deleted;
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
      .then(_ => this.connection.next({event: 'kweet_delete', data: this.kweet}))
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
