import {inject} from 'aurelia-dependency-injection';
import {Router} from 'aurelia-router';
import {ValidationControllerFactory, ValidationRules} from 'aurelia-validation';

import {ProfileService} from '../../shared/services/profile-service';
import {ToastService} from '../../shared/services/toast-service';
import {SharedState} from '../../shared/state/shared-state';
import {profileRules} from '../../shared/validation/profile-rules';

@inject(ProfileService, ToastService, SharedState, Router, ValidationControllerFactory)
export class SettingsComponent {
  password = '';
  limit = profileRules.bio.maxLength;
  uploadAvatarError = null;
  saveSettingsError = null;

  /** @type{ProfileService} */profileService;
  /** @type{ToastService} */toastService;
  /** @type{SharedState} */sharedState;
  /** @type{Router} */router;
  constructor(profileService, toastService, sharedState, router, /** @type{ValidationControllerFactory} */controllerFactory) {
    this.profileService = profileService;
    this.toastService = toastService;
    this.sharedState = sharedState;
    this.router = router;
    this.controller = controllerFactory.createForCurrentScope();

    const user = this.sharedState.currentUser;
    this.username = user.username;
    this.bio = user.bio || '';
    this.website = user.website || '';
    this.location = user.location || '';
    this.initialState = {
      username: this.username,
      password: this.password,
      bio: this.bio,
      website: this.website,
      location: this.location
    };
    this.imageUrl = `http://localhost:8080/api/v1/users/${user.username}/avatar`;

    ValidationRules
      .ensure('username').minLength(profileRules.username.minLength).matches(profileRules.username.pattern)
      .ensure('password').minLength(profileRules.password.minLength)
      .ensure('bio').maxLength(profileRules.bio.maxLength)
      .ensure('website').matches(profileRules.website.pattern)
      .on(this);

    this.dragAndDropHandler = (file, contents) => {
      this.uploadAvatarError = null;
      const element = document.getElementById('profileImage');
      element.classList.toggle('uploading');
      const prev = this.imageUrl;
      this.imageUrl = contents;
      this.profileService.uploadAvatar(contents)
        .then(response => {
          element.classList.toggle('uploading');
          if (response.ok) {
            return this.toastService.success('Your new profile image was successfully uploaded', 'Image upload success', {
              clearInterval: 2000
            });
          }
          throw new Error(null);
        })
        .catch(_ => {
          element.classList.toggle('uploading');
          this.imageUrl = prev;
          this.toastService.warning('Unable to process the uploaded profile avatar', 'Image upload error');
        });
    };
    this.onDragAndDropFail = (file) => {
      this.uploadAvatarError = `Image size (${file.size}kb) exceed the limit of 1mb`;
    };
  }

  get canSave() {
    const user = this.sharedState.currentUser;
    return (this.username !== '' && !this.isUser) || this.password !== '' || (this.bio !== '' && this.bio !== user.bio) || (this.website !== '' && this.website !== user.website) || (this.location !== '' && this.location !== user.location);
  }

  get usernameError() {
    const errors = this.controller.errors.filter(e => e.propertyName === 'username');
    return errors.length ? errors[0].message : undefined;
  }

  get passwordError() {
    const errors = this.controller.errors.filter(e => e.propertyName === 'password');
    return errors.length ? errors[0].message : undefined;
  }

  get bioError() {
    const errors = this.controller.errors.filter(e => e.propertyName === 'bio');
    return errors.length ? errors[0].message : undefined;
  }

  get websiteError() {
    const errors = this.controller.errors.filter(e => e.propertyName === 'website');
    return errors.length ? errors[0].message : undefined;
  }

  get length() {
    return this.bio.trimLeft().length;
  }

  update() {
    this.saveSettingsError = null;

    this.controller.validate()
      .then(result => {
        if (result.valid) {
          const userModel = Object.keys(this.initialState).reduce((obj, key) => {
            if (this[key] !== this.initialState[key]) {
              obj[key] = this[key];
            }
            return obj;
          }, {});
          if (Object.keys(userModel).length <= 0) {
            return;
          }
          this.checkUsername()
            .then(_ => this.profileService.update(userModel))
            .then(_ => {
              this.toastService.success('Successfully updated your profile', 'Profile changes success');
              this.router.navigateToRoute('home');
            })
            .catch(error => this.saveSettingsError = error.message);
        }
      });
  }

  checkUsername() {
    if (this.username.length >= profileRules.username.minLength && !this.isUser) {
      return new Promise((resolve, reject) => {
        this.profileService.get(this.username)
          .then(_ => reject(new Error('The entered username already exists')))
          .catch(resolve);
      });
    }

    return Promise.resolve();
  }

  get isUser() {
    return this.username.toLowerCase() === this.sharedState.currentUser.username.toLowerCase();
  }

  logout() {
    this.profileService.purgeAuth();
    this.router.navigateToRoute('home');
  }
}
