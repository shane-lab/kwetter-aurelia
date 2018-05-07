import {inject} from 'aurelia-dependency-injection';

import {ApiService} from './api-service';
import {SharedState} from '../state/shared-state';

@inject(ApiService, SharedState)
export class ProfileService {
  /** @type{ApiService} */apiService;
  /** @type{SharedState} */sharedState;
  constructor(apiService, sharedState) {
    this.apiService = apiService;
    this.sharedState = sharedState;
  }

  get(/** @type{string} */username) {
    return this.apiService.get(`/users/${username}`)
      .then(response => response.data);
  }

  lookup(/** @type{string} */partialName) {
    if (!partialName || partialName.length < 3) {
      return Promise.reject(new Error('Partial name too short'));
    }
    return this.apiService.get(`/users/partial/${partialName}`);
  }

  getFollowers(/** @type{string} */username) {
    return this.apiService.get(`/users/${username}/followers`);
  }

  getFollowing(/** @type{string} */username) {
    return this.apiService.get(`/users/${username}/following`);
  }

  isFollowing(/** @type{string} */follower, /** @type{string} */followee) {
    return this.apiService.get(`/users/${follower}/follows/${followee}`)
      .then(Boolean);
  }

  follow(/** @type{string} */username) {
    return this.apiService.postRaw(`/users/follow/${username}`);
  }

  unfollow(/** @type{string} */username) {
    return this.apiService.delete(`/users/follow/${username}`, false);
  }

  update(/** @type{{
   username?: string,
   password?: string,
   bio?: string,
   website?: string,
   location?: string,
  }} */changes) {
    return this.apiService.put('/users', changes)
      .then(response => {
        this.sharedState.currentUser = response.data;
        return response.data;
      });
  }

  uploadAvatar(/** @type{string} */image) {
    return this.apiService.postRaw('/users/avatar', image, {
      'Content-Type': 'image/png',
      'Accept': '*/*'
    });
  }

  removeAvatar() {
    return this.apiService.delete('/users/avatar', false);
  }
}
