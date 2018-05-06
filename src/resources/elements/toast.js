import {bindable} from 'aurelia-framework';

export class Toast {
  @bindable id;
  @bindable type
  @bindable title
  @bindable message

  @bindable closeable
  @bindable clearable
  @bindable closeCb
  @bindable autoClose
}
