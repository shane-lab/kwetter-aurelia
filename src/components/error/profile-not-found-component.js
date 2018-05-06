import {RedirectToRoute} from 'aurelia-router';

export class ProfileNotFoundComponent {
  username = '';

  activate(params) {
    const {name} = params;
    if (!name) {
      return new RedirectToRoute('unexpected');
    }
    this.username = name;

    return true;
  }
}
