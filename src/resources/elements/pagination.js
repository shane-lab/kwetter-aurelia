import {bindable} from 'aurelia-framework';

export class Pagination {
  @bindable page = 1;
  @bindable totalPages;
  @bindable setPageCb;

  updatePage($event, page) {
    if (!this.setPageCb) {
      return;
    }
    if ($event.which !== 1) {
      return;
    }

    const currentPage = this.page;
    this.page = page <= 0 ? currentPage : (page >= this.totalPages ? this.totalPages : page);
    if (this.page !== currentPage) {
      this.setPageCb({pageNumber: this.page});
    }
  }
}
