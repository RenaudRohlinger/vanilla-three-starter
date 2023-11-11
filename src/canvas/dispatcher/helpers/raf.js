import dispatcher from '@/canvas/utils/dispatcher';

class Raf {
  constructor() {
    this.time = window.performance.now();

    this.start = this.start.bind(this);
    this.pause = this.pause.bind(this);
    this.animate = this.animate.bind(this);
    this.start();
  }

  start() {
    this.startTime = window.performance.now();
    this.oldTime = this.startTime;
    this.isPaused = false;

    this.animate(this.startTime);
  }

  pause() {
    this.isPaused = true;
  }

  animate(now) {
    this.time = now;

    if (!this.isPaused) {
      requestAnimationFrame(this.animate);
      dispatcher.triggerOnRaf();
    }
  }
}

export const raf = new Raf();
