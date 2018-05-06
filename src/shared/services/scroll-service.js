/**
    Smoothly scroll element to the given target (element.scrollTop)
    for the given duration

    Returns a promise that's fulfilled when done, or rejected if
    interrupted
 */
const smoothScrollInElement = (/** @type{Element} */element, /** @type{number} */target, /** @type{number} */duration) => {
  target = Math.round(target);
  duration = Math.round(duration);
  if (duration === 0) {
    element.scrollTop = target;
    return Promise.resolve();
  }

  const startTime = Date.now();
  const endTime = startTime + duration;

  const startTop = element.scrollTop;
  const distance = target - startTop;

  // based on http://en.wikipedia.org/wiki/Smoothstep
  const smoothStep = (start, end, point) => {
    if (point <= start) { return 0; }
    if (point >= end) { return 1; }
    const x = (point - start) / (end - start); // interpolation
    return x * x * (3 - 2 * x);
  };

  return new Promise((resolve, reject) => {
    // This is to keep track of where the element's scrollTop is
    // supposed to be, based on what we're doing
    let previousTop = element.scrollTop;

    // This is like a think function from a game loop
    const scrollFrame = () => {
      if (element.scrollTop !== previousTop) {
        reject('interrupted');
        return;
      }

      // set the scrollTop for this frame
      const now = Date.now();
      const point = smoothStep(startTime, endTime, now);
      const frameTop = Math.round(startTop + (distance * point));
      element.scrollTop = frameTop;

      // check if we're done!
      if (now >= endTime) {
        resolve();
        return;
      }

      // If we were supposed to scroll but didn't, then we
      // probably hit the limit, so consider it done; not
      // interrupted.
      if (element.scrollTop === previousTop && element.scrollTop !== frameTop) {
        resolve();
        return;
      }
      previousTop = element.scrollTop;

      // schedule next frame for execution
      setTimeout(scrollFrame, 0);
    };

    // boostrap the animation process
    setTimeout(scrollFrame, 0);
  });
};

const smoothScrollTo = (/** @type{number}*/top) => {
  window.scroll({
    behavior: 'smooth',
    left: 0,
    top
  });
};

const getPosition = (/** @type{Element} */element) => {
  let x = 0;
  let y = 0;

  while (element && (element.tagName || '').toLowerCase() !== 'html') {
    x += element.offsetLeft || 0;
    y += element.offsetTop || 0;
    element = element.parentElement;
  }

  return { x, y };
};

export class ScrollService {
  scrollToOffset(/** @type{number} */offset, margin = 0) {
    smoothScrollTo(offset);
  }

  scrollToElement(/** @type{Element} */element, margin = 0) {
    smoothScrollTo(getPosition(element).y - margin);
  }

  scrollInElementUp(/** @type{Element} */element, /** @type{number} */amount, /** @type{number} */duration) {
    smoothScrollInElement(element, getPosition(element).y - amount, duration);
  }

  scrollInElementDown(/** @type{Element}*/element, /** @type{number} */amount, /** @type{number} */duration) {
    smoothScrollInElement(element, getPosition(element).y + amount, duration);
  }
}
