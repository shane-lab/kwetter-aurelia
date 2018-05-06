import {inject} from 'aurelia-dependency-injection';

import {ProfileService} from '../../shared/services/profile-service';

@inject(ProfileService)
export class ProfileFollowersComponent {
  profiles = [];
  pageNumber;
  totalPages;
  currentPage = 1;
  limit = 20;

  /** @type{ProfileService} */profileService;
  constructor(profileService) {
    this.profileService = profileService;
  }

  activate(params, routeConfig) {
    this.username = params.name;
    return this.getProfiles();
  }

  getProfiles() {
    const page = this.currentPage - 1 < 0 ? 0 : this.currentPage - 1;
    const queryParams = {
      size: this.limit,
      page
    };
    return this.profileService.getFollowers(this.username, queryParams)
      .then(response => {
        this.profiles.splice(0);
        if (response.data) {
          this.profiles.push(...response.data.items);
          this.totalPages = response.data.pages;
        }
      });
  }

  setPageTo(pageNumber) {
    this.currentPage = pageNumber;
    this.getProfiles();
  }
}
