import {inject} from 'aurelia-dependency-injection';
/* eslint-disable */
import {RedirectToRoute, RouterConfiguration, Router, activationStrategy} from 'aurelia-router';
/* eslint-enable */
import {computedFrom} from 'aurelia-framework';

import {SharedState} from '../../shared/state/shared-state';
import {ProfileService} from '../../shared/services/profile-service';

const childRoutes = ['favorites', 'followers', 'following'];

@inject(SharedState, ProfileService)
export class ProfileComponent {
  username;
  profile;
  error = true;
  checkedFollow = false;
  following = false;

  /** @type{SharedState} */sharedState;
  /** @type{ProfileService} */profileService;
  constructor(sharedState, profileService) {
    this.sharedState = sharedState;
    this.profileService = profileService;
  }

  configureRouter(/** @type{RouterConfiguration} */config, /** @type{Router} */router) {
    config.map([
      {route: [''], moduleId: 'components/profile/profile-kweets-component', name: 'profile-kweets', title: 'Timeline'},
      ...childRoutes.map(key => ({
        route: [key],
        moduleId: `components/profile/profile-${key}-component`,
        name: `profile-${key}`,
        title: (key.charAt(0).toUpperCase() + key.slice(1))
      }))
    ]);

    this.router = router;
  }

  created() {
    const { queryParams } = this.router.parent.currentInstruction || {};
    if (queryParams && queryParams.view) {
      const { view } = queryParams;
      if (view.length > 0 && childRoutes.indexOf(view.toLowerCase()) >= 0) {
        this.router.navigate(view);
      }
    }
  }

  determineActivationStrategy() {
    return activationStrategy.replace;
  }

  activate(params, routeConfig) {
    this.username = params.name;
    return this.profileService.get(this.username)
      .then(profile => {
        if (!profile) {
          throw new RedirectToRoute('unexpected');
        }
        this.profile = profile;
        if (this.sharedState.isAuthenticated) {
          this.profileService.isFollowing(this.sharedState.currentUser.username, this.username)
            .then(flag => {
              this.checkedFollow = true;
              this.following = flag;
            })
            .catch(_ => this.checkedFollow = true);
        }
      })
      .catch(err => {
        throw (err instanceof RedirectToRoute) ? err : new RedirectToRoute('profile-not-found', {
          name: this.username
        });
      });
  }

  @computedFrom('sharedState.currentUser.username')
  get isUser() {
    return this.sharedState.isAuthenticated && this.profile.username === this.sharedState.currentUser.username;
  }

  get isFollowing() {
    return this.sharedState.isAuthenticated && !this.isUser && this.checkedFollow && this.following;
  }

  onToggleFollowing() {
    const delegate = (!this.isFollowing ? this.profileService.follow : this.profileService.unfollow).bind(this.profileService);
    delegate(this.profile.username)
      .then(_ => this.following = !this.isFollowing);
  }
}
