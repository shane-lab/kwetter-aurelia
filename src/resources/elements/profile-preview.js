import {bindable} from 'aurelia-framework';

export class ProfilePreview {
  @bindable profile;

  get avatarUrl() {
    return this.profile && this.profile.links.reduce((prev, curr) => (curr.rel === 'users.avatar.fetch') ? curr : prev, {}).path;
  }
}
