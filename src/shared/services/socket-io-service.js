import {inject} from 'aurelia-framework';

import io from 'socket.io-client';

import {config} from './config';
import {SocketService, SocketInterface} from './socket-service';

class SocketIO extends SocketInterface {
  constructor(/** @type{String} */url) {
    super();
    this.socket = io(url);

    this.socket.on('message', data => this.onMessage && this.onMessage(data));
    this.socket.on('error', err => this.onError && this.onError(err));
    this.socket.on('complete', () => this.onComplete && this.onComplete());
  }

  send(data) {
    this.socket.send(data);
  }

  close() {
    this.socket.close();
  }
}

@inject(SocketService)
export class SocketIoService {
  connection;

  /** @type{SocketService} */socketService;
  constructor(socketService) {
    this.socketService = socketService;
  }

  connect(/** @type{String} */url = config.socket_url) {
    if (!this.connection) {
      this.connection = this.socketService.connect(new SocketIO(url));
    }

    return this.connection;
  }
}
