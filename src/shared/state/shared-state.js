export class SharedState {
  /** @type{{
   id: number,
   username: string,
   bio?: string,
   createdAt: Date,
   website?: string,
   location?: string,
   kweets: number,
   followers: number,
   following: number
  }} */currentUser;
  /** @type{boolean} */isAuthenticated;
  constructor() {
    this.currentUser = null;
  }

  get isAuthenticated() {
    return !!this.currentUser;
  }
}
