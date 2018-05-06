import {inject} from 'aurelia-dependency-injection';
import {ApiService} from './api-service';

export const listTypes = {
  all: 'all',
  feed: 'feed',
  hashTag: 'hashtag'
};

@inject(ApiService)
export class KweetService {
  /** @type{ApiService} */apiService;
  constructor(apiService) {
    this.apiService = apiService;
  }

  getAll(/** @type{{}} */params) {
    return this.apiService.get('/kweets', params);
  }

  getTimeline(/** @type{string} */profile, /** @type{{}} */params) {
    return this.apiService.get(`/kweets/user/${profile}/timeline`, params);
  }

  getFavorites(/** @type{string} */profile, /** @type{{}} */params) {
    return this.apiService.get(`/kweets/user/${profile}/favorites`, params);
  }

  getByHashtag(/** @type{string} */hashtag, /** @type{{}} */params) {
    return this.apiService.get(`/kweets/hashtag/${hashtag}`, params);
  }

  get(/** @type{number} */slug) {
    return this.apiService.get(`/kweets/${slug}`)
      .then(response => response.data);
  }

  destroy(/** @type{number} */slug) {
    return this.apiService.delete(`/kweets/${slug}`, false);
  }

  save(/** @type{string} */kweetMessage) {
    if (!kweetMessage || kweetMessage.length <= 0) {
      return Promise.reject(new Error('Kweet message is too short'));
    }
    return this.apiService.postRaw('/kweets/', kweetMessage)
      .then(response => response.data);
  }

  isFavoritedBy(/** @type{number} */slug, /** @type{string} */profile) {
    return this.apiService.get(`/kweets/${slug}/favorited/${profile}`)
      .then(Boolean);
  }

  favorite(/** @type{number} */slug) {
    return this.apiService.postRaw(`/kweets/favorite/${slug}`)
      .then(Boolean);
  }

  unfavorite(/** @type{number} */slug) {
    return this.apiService.delete(`/kweets/favorite/${slug}`, false)    .then(Boolean);
  }
}
