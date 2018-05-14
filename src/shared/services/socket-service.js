import {Subject, Observable, Observer} from 'rxjs';
import {share} from 'rxjs/operators';

export class SocketService {
  /** @type{WebSocket} */
  ws;
  /** @type{Subject<MessageEvent>} */
  subject;

  connect(/** @type{string} */url) {
    if (!this.subject) {
      this.subject = this.from(url);
    }

    return this.subject;
  }

  sendMessage(/** @type{any} */msg) {
    this.ws.send(msg);
  }

  /**
   * Create a new Observable
   * @param {string} url The path to the websocket endpoint
   * @returns {Subject<MessageEvent>}
   */
  from(/** @type{string} */url) {
    this.ws = new WebSocket(url);

    const observable = Observable.create((/** @type{Observer<MessageEvent>} */obs) => {
      this.ws.onmessage = obs.next.bind(obs);
      this.ws.onerror = obs.error.bind(obs);
      this.ws.onclose = obs.complete.bind(obs);

      return this.ws.close.bind(this.ws);
    });
    observable
      .pipe(share());

    return Subject.create({
      next: data => this.ws.readyState === WebSocket.OPEN && this.ws.send(JSON.stringify(data))
    }, observable);
  }
}
