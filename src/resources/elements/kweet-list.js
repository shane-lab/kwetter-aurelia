import {bindable} from 'aurelia-framework';

export class KweetList {
  @bindable kweets = [];
  @bindable totalPages;
  @bindable currentPage;
  @bindable setPageCb;
}

