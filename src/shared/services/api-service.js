import {inject} from 'aurelia-dependency-injection';
import {HttpClient, json} from 'aurelia-fetch-client';

import * as qs from 'querystringify';

import {config} from './config';
import {JwtService} from './jwt-service';

const storeToken = (/** @type{JwtService} */jwtService) => (/** @type{Response} */response) => {
  const authorization = response && response.headers && response.headers.get('Authorization');
  if (authorization) {
    jwtService.saveToken(authorization.trim());
  }

  return response;
};

const parseResponse = (/** @type{Response}*/response) => new Promise((resolve, reject) => {
  if (!response) {
    return reject(new Error('Server error'));
  }
  response.json()
    .then(dataModel => {
      if (response.status >= 200 && response.status < 400) {
        return resolve(dataModel);
      }

      const message = Array.isArray(dataModel) ? dataModel[0] : dataModel.message;
      reject(new Error(message));
    });
});

@inject(HttpClient, JwtService)
export class ApiService {
  /** @type{HttpClient} */http;
  /** @type{JwtService} */jwtService;
  constructor(http, jwtService) {
    this.http = http;
    this.jwtService = jwtService;
    this.tokenUpdater = storeToken(jwtService);
  }

  ping() {
    return this.http.fetch(`${config.api_url}`)
      .then(response => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response;
      })
      .then(response => response && response.status === 200 ? Promise.resolve(response) : Promise.reject(null));
  }

  setHeaders(/** @type{{[key: string]: any}} */overrideConfig = undefined) {
    let headersConfig = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (overrideConfig) {
      headersConfig = Object.assign(headersConfig, overrideConfig);
    }

    const token = this.jwtService.getToken();
    if (token) {
      headersConfig['Authorization'] = `Bearer ${token}`;
    }
    return new Headers(headersConfig);
  }

  get(/** @type{string} */path, /** @type{{[key: string]: any}} */params) {
    const options = {
      method: 'GET',
      headers: this.setHeaders()
    };
    return this.http.fetch(`${config.api_url}${path}?${qs.stringify(params)}`, options)
      .then(this.tokenUpdater)
      .then(parseResponse);
  }

  put(/** @type{string} */path, /** @type{{[key: string]: any}} */body = {}) {
    const options = {
      method: 'PUT',
      headers: this.setHeaders(),
      body: json(body)
    };
    return this.http.fetch(`${config.api_url}${path}`, options)
      .then(this.tokenUpdater)
      .then(parseResponse);
  }

  post(/** @type{string} */path, /** @type{{[key: string]: any}} */body = {}) {
    const options = {
      method: 'POST',
      headers: this.setHeaders(),
      body: json(body)
    };
    return this.http.fetch(`${config.api_url}${path}`, options)
      .then(this.tokenUpdater)
      .then(parseResponse);
  }

  postRaw(/** @type{string} */path, /** @type{string} */body, /** @type{{[key: string]: any}} */headersConfig = undefined) {
    const options = {
      method: 'POST',
      headers: this.setHeaders(headersConfig),
      body
    };
    return this.http.fetch(`${config.api_url}${path}`, options)
      .then(this.tokenUpdater);
  }

  delete(/** @type{string} */path, parse = true) {
    const options = {
      method: 'DELETE',
      headers: this.setHeaders()
    };
    return this.http.fetch(`${config.api_url}${path}`, options)
      .then(this.tokenUpdater)
      .then(response => parse ? parseResponse(response) : response);
  }
}
