import {inject} from 'aurelia-framework';

import io from 'socket.io-client';

import {config} from './config';
import {SocketService, SocketInterface} from './socket-service';

class SocketIO extends SocketInterface {
  constructor(/** @type{String} */url, /** @type{String} */namespace) {
    super();
    const uri = `${url}/${namespace || ''}`;
    this.socket = io(uri);

    this.socket.on('message', data => this.onMessage && this.onMessage(data));
    this.socket.on('error', err => this.onError && this.onError(err));
    this.socket.on('complete', () => this.onComplete && this.onComplete());
  }

  send(data) {
    this.socket.emit(data);
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

  connect(/** @type{String} */url = config.socket_url, /** @type{String} */namespace = config.socket_namespace) {
    if (!this.connection) {
      this.connection = this.socketService.connect(new SocketIO(url, namespace));
    }

    return this.connection;
  }
}
