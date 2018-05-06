import {inject} from 'aurelia-framework';

import {KweetService} from '../../shared/services/kweet-service';
import {ProfileService} from '../../shared/services/profile-service';
import {ToastService} from '../../shared/services/toast-service';
import {profileRules} from '../../shared/validation/profile-rules';

const listTypes = [{
  id: 0,
  name: 'Kweets',
  desc: 'Kweets by hashtags'
}, {
  id: 1,
  name: 'profiles',
  desc: 'Profiles by name'
}];

@inject(KweetService, ProfileService, ToastService)
export class SearchComponent {
  types = listTypes
  query = '';
  infoMessage = null;
  items = [];
  searchedType;
  totalPages = 0;
  currentPage = 1;
  limit = 10;

  /** @type{KweetService} */kweetService;
  /** @type{ProfileService} */profileService
  /** @type{ToastService} */toastService
  constructor(kweetService, profileService, toastService) {
    this.kweetService = kweetService;
    this.profileService = profileService;
    this.toastService = toastService;
    this.type = this.types[0];
  }

  search() {
    this.infoMessage = null;
    this.currentPage = 1;
    this.query = this.query.trim();
    if (this.type.id === 1) {
      const nameRules = profileRules.username;
      if (this.query.length < nameRules.minLength) {
        return this.toastService.info('Name is too short, must be atleast 3 characters', 'Search error');
      }
      if (!nameRules.pattern.test(this.query)) {
        return this.toastService.info('The give name contains an invalid format. Names start with a letter', 'Search error');
      }
    }
    this.getItems();
  }

  get isDisabled() {
    return this.query.trimLeft().length <= 0;
  }

  getItems() {
    const page = this.currentPage - 1 < 0 ? 0 : this.currentPage - 1;
    const params = {
      size: this.limit,
      page
    };
    let promised;
    if (this.type === this.types[0]) {
      promised = this.kweetService.getByHashtag(this.query, params);
    } else if (this.type === this.types[1]) {
      promised = this.profileService.lookup(this.query, params);
    }

    if (promised) {
      this.searchedType = this.type;
      promised.then(this.resolveList.bind(this));
    } else {
      this.toastService.warning(`Unable to fetch a list of type of '${this.type}'`, 'Search error');
    }
  }

  resolveList(response) {
    this.items.splice(0);
    if (response.data) {
      if (response.data.items.length <= 0) {
        return this.infoMessage = `No ${this.type.name} were found when searching for '${this.query}'`;
      }
      this.items.push(...response.data.items);
      this.totalPages = response.data.pages;
    }
  }
}
