import {inject, Container, CompositionEngine, ViewSlot, Origin} from 'aurelia-framework';
import { DomEffectsService } from './dom-effects-service';

const defaults = {
  debug: false,
  position: 'toast-top-right',
  startingZIndex: 1000,
  autoClose: true,
  closeInterval: 1500
};

const ToastType = {
  Error: 'error',
  Info: 'info',
  Success: 'success',
  Warning: 'warning'
};

const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
  const r = Math.random() * 16 | 0;
  return (ch === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
});

@inject(DomEffectsService)
class ToastRenderer {
  /** @type{DomEffectsService} */domEffectsService;
  constructor(domEffectsService) {
    this.domEffectsService = domEffectsService;
  }

  render(containerStorage, controller, options) {
    const viewSlot = this.createToastContainer(containerStorage, options);
    controller.view.bind(options);
    viewSlot.add(controller.view);
    viewSlot.attached();
    options.handle = {slot: viewSlot, containers: containerStorage, controller, options};
    this.setAutoClose(options);
    return options.handle;
  }

  createToastContainer(containerStorage, options) {
    const position = options.position;
    if (containerStorage.has(position)) {
      return containerStorage.get(position);
    }

    const containerElement = document.createElement('div');
    containerElement.id = 'toast-container';
    containerElement.classList.add(options.position);
    containerElement.setAttribute('aria-live', 'polite');
    containerElement.setAttribute('role', 'alert');
    document.body.insertBefore(containerElement, document.body.firstChild);
    const toastContainerViewSlot = new ViewSlot(containerElement, true);
    containerStorage.set(position, toastContainerViewSlot);
    return toastContainerViewSlot;
  }

  setAutoClose(options) {
    if (!options.autoClose) {
      return;
    }
    const {closeInterval} = options;
    if (options.autoClose) {
      setTimeout(() => {
        const toastElem = document.getElementById(options.id);
        if (toastElem) {
          this.domEffectsService.fadeOut(toastElem, {
            duration: 500,
            complete: () => {
              // alert('Complete');
              this.close(toastElem, options.handle);
            }
          });
        }
      }, closeInterval && closeInterval > 500 && closeInterval <= 5000 ? closeInterval : 500);
    }
  }

  close(target, handle) {
    if (!handle) {
      return;
    }

    let elem = target;
    while (!!elem.parentElement && elem.parentElement.id !== 'toast-container') {
      elem = elem.parentElement;
    }
    if (!elem.parentElement || elem.parentElement.id !== 'toast-container') {
      return;
    }

    elem.remove();
    if (handle.slot.anchor.children.length === 0) {
      document.body.removeChild(handle.slot.anchor);
    }
    handle.slot.detached();
    handle.containers.delete(handle.options.position);
    handle = null;
  }
}

function getViewModel(instruction, compositionEngine) {
  if (typeof instruction.viewModel === 'function') {
    instruction.viewModel = Origin.get(instruction.viewModel).moduleId;
  } else if (typeof instruction.viewModel === 'string') {
    return compositionEngine.ensureViewModel(instruction);
  }

  return Promise.resolve(instruction);
}

function invokeLifecycle(instance, name, model) {
  if (typeof instance[name] !== 'function') {
    return Promise.resolve(true);
  }

  const result = instance[name](model);
  if (result instanceof Promise) return result;
  if (result !== null && result !== undefined) {
    return Promise.resolve(result);
  }

  return Promise.resolve(true);
}

@inject(Container, CompositionEngine, ToastRenderer)
export class ToastService {
  // internal
  _containers = new Map();
  _toasts = [];
  /** @type{Container} */container;
  /** @type{CompositionEngine} */compositionEngine;
  /** @type{ToastRenderer} */renderer;
  constructor(container, compositionEngine, toastRenderer) {
    this.container = container;
    this.compositionEngine = compositionEngine;
    this.renderer = toastRenderer;
  }

  error(/** @type{String} */message, /** @type{String} */title, /** @type{{}} */options) {
    return this.notify(ToastType.Error, message, title, options);
  }

  info(/** @type{String} */message, /** @type{String} */title, /** @type{{}} */options) {
    return this.notify(ToastType.Info, message, title, options);
  }

  success(/** @type{String} */message, /** @type{String} */title, /** @type{{}} */options) {
    return this.notify(ToastType.Success, message, title, options);
  }

  warning(/** @type{String} */message, /** @type{String} */title, /** @type{{}} */options) {
    return this.notify(ToastType.Warning, message, title, options);
  }

  notify(/** @type{ToastType} */type, /** @type{String} */message, /** @type{String} */title, /** @type{{}} */options) {
    if (title === undefined && typeof message !== 'string') {
      options = message;
    }

    const close = this.renderer.close;
    options = Object.assign({}, defaults, options, {
      type: type,
      message: message,
      title: title,
      id: uuidv4(),
      closeCb: function($event) {
        close($event.target, this.handle);
      }
    });

    return new Promise((resolve, reject) => {
      const childContainer = this.container.createChild();
      const instruction = {
        viewModel: 'resources/elements/toast',
        container: this.container,
        childContainer,
        model: options.model
      };

      let controllerInstruction;
      return getViewModel(instruction, this.compositionEngine)
        .then(returnedInstruction => {
          controllerInstruction = returnedInstruction;
          return invokeLifecycle(controllerInstruction.viewModel, 'canActivate', options.model);
        })
        .then(canActivate => !canActivate ? null :
          this.compositionEngine.createController(controllerInstruction)
            .then(controller => {
              controller.automate();
              return this.renderer.render(this._containers, controller, options);
            })
        )
        .then(resolve);
    });
  }
}
