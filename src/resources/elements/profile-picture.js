import { bindable } from 'aurelia-framework';

export class ProfilePicture {
  @bindable imageUrl;
  @bindable isRound;
  @bindable isLarge;
}
