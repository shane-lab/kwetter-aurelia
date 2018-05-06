import {inject} from 'aurelia-dependency-injection';
import {HttpClient} from 'aurelia-fetch-client';

const parseResponse = (/** @type{Response}*/response) => new Promise((resolve, reject) => {
  if (!response) {
    return reject(new Error('Server error'));
  }
  response.json()
    .then(dataModel => {
      if (response.status >= 200 && response.status < 400) {
        return resolve(dataModel);
      }

      reject(new Error('Unable to fetch a quote'));
    });
});

@inject(HttpClient)
export class QuoteService {
  /** @type{HttpClient} */http;
  constructor(http) {
    this.http = http;
  }

  get() {
    const options = {
      method: 'GET',
      headers: new Headers({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    };
    return this.http.fetch('https://quote.shanelab.nl/api.php', options)
      .then(parseResponse);
  }
}
