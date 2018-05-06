export class JwtService {
  getToken() {
    return window.localStorage['jwtToken'];
  }

  saveToken(/** @type{String} */token) {
    window.localStorage['jwtToken'] = token;
  }

  destroyToken() {
    window.localStorage.removeItem('jwtToken');
  }
}
