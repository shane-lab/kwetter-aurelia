
const effects = {
  easing: {
    linear: (progress) => progress,
    quadratic: (progress) => Math.pow(progress, 2),
    swing: (progress) => 0.5 - Math.cos(progress * Math.PI) / 2,
    circ: (progress) => 1 - Math.sin(Math.acos(progress)),
    back: (progress, x) => Math.pow(progress, 2) * ((x + 1) * progress - x),
    elastic: (progress, x) => Math.pow(2, 10 * (progress - 1)) * Math.cos(20 * Math.PI * x / 3 * progress),
    bounce: (progress) => {
      for (let a = 0, b = 1; 1; a += b, b /= 2) {
        if (progress >= (7 - 4 * a) / 11) {
          return -Math.pow((11 - 6 * a - 11 * progress) / 4, 2) + Math.pow(b, 2);
        }
      }
    }
  }
};

const animate = (options) => {
  const start = new Date;
  const id = setInterval(() => {
    const timePassed = new Date - start;
    let progress = timePassed / options.duration;
    if (progress > 1) {
      progress = 1;
    }
    options.progress = progress;
    const delta = options.delta(progress);
    options.step(delta);
    if (progress === 1) {
      clearInterval(id);
      options.complete();
    }
  }, options.delay || 10);
};

export class DomEffectsService {
  fadeIn(/** @type{Element} */element, options) {
    const to = 0;
    animate({
      duration: options.duration,
      delta: function(progress) {
        progress = this.progress;
        return effects.easing.swing(progress);
      },
      complete: options.complete,
      step: (delta) => (element.style.opacity = to + delta)
    });
  }

  fadeOut(/** @type{Element} */element, options) {
    const to = 0.8;
    animate({
      duration: options.duration,
      delta: function(progress) {
        progress = this.progress;
        return effects.easing.swing(progress);
      },
      complete: options.complete,
      step: (delta) => (element.style.opacity = to - delta)
    });
  }
}
