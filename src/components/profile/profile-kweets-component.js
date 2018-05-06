import {inject} from 'aurelia-dependency-injection';

import {KweetService} from '../../shared/services/kweet-service';

@inject(KweetService)
export class ProfileKweetsComponent {
  kweets = [];
  pageNumber;
  totalPages;
  currentPage = 1;
  limit = 10;

  /** @type{KweetService} */kweetService;
  constructor(kweetService) {
    this.kweetService = kweetService;
  }

  activate(params, routeConfig) {
    this.username = params.name;
    return this.getKweets();
  }

  getKweets() {
    const page = this.currentPage - 1 < 0 ? 0 : this.currentPage - 1;
    let queryParams = {
      size: this.limit,
      page
    };
    return this.kweetService.getTimeline(this.username, queryParams)
      .then(response => {
        this.kweets.splice(0);
        if (response.data) {
          this.kweets.push(...response.data.items);
          this.totalPages = response.data.pages;
        }
      });
  }

  setPageTo(pageNumber) {
    this.currentPage = pageNumber;
    this.getKweets();
  }

  kweetDeleted(kweet) {
    this.getKweets();
  }
}
