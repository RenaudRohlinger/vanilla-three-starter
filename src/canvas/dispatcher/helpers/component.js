import dispatcher from '@/canvas/utils/dispatcher.js';
import { DEBUG_MODE } from '@/constants.js';

if (DEBUG_MODE) {
  console.log('🏗️ DEBUG_MODE enabled in @/src/constants.js');
  import('lil-gui').then((module) => {
    const gui = new module.GUI();

    dispatcher.trigger(
      { name: 'debug', fireAtStart: true },
      {
        gui,
      }
    );
  });
}

const defaultRaf = {
  renderPriority: 0,
  fps: Infinity,
};
const component = (
  superclass = class T {},
  settings = {
    raf: defaultRaf,
  }
) =>
  class extends (superclass || class T {}) {
    constructor(...args) {
      super(...args);
      this._args = args;
      this.raf = settings.raf || defaultRaf;
      this.init && this.init();
      this.lastUpdateTime = window.performance.now();
      dispatcher.register(this, this.raf);
    }

    destroy() {
      dispatcher.unregister(this);
    }
  };

export { component };
