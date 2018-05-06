import {bindable} from 'aurelia-framework';

export class ProfileList {
  @bindable profiles;
  @bindable totalPages;
  @bindable currentPage;
  @bindable setPageCb;
}
