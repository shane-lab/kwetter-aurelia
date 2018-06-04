import {Subject, Observable, Observer} from 'rxjs';
import {share} from 'rxjs/operators';

export class SocketInterface {
  _onMessage;
  _onError;
  _onComplete;

  get onMessage() {
    return this._onMessage;
  }

  set onMessage(fn) {
    this._onMessage = fn;
  }

  get onError() {
    return this._onError;
  }

  set onError(fn) {
    this._onError = fn;
  }

  get onComplete() {
    return this._onComplete;
  }

  set onComplete(fn) {
    this._onComplete = fn;
  }

  send(data) { }

  close() { }
}

export class SocketService {
  connect(/** @type{SocketInterface} */socket) {
    const observable = Observable.create((/** @type{Observer<MessageEvent>} */obs) => {
      socket.onMessage = obs.next.bind(obs);
      socket.onError = obs.error.bind(obs);
      socket.onComplete = obs.complete.bind(obs);

      return socket.close.bind(socket);
    });
    observable
      .pipe(share());

    const send = (data) => socket.send(JSON.stringify(data));

    return Subject.create({
      next: send
    }, observable);
  }
}
