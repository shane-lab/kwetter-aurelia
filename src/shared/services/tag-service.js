import {inject} from 'aurelia-dependency-injection';

import {ApiService} from './api-service';

@inject(ApiService)
export class HashTagService {
  /** @type{ApiService} */apiService;
  constructor(apiService) {
    this.apiService = apiService;
  }

  getTrends() {
    const date = new Date(Date.now());
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const formatted = [
      date.getFullYear(),
      (month > 9 ? '' : '0') + month,
      (day > 9 ? '' : '0') + day
    ].join('-');
    return this.apiService.get(`/hashtags/trending/${formatted}`);
  }
}
