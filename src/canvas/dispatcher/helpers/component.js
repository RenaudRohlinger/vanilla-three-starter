import dispatcher from '@/canvas/utils/dispatcher.js';
import scene from '@/canvas/scene';
import { disposeAll } from '@/canvas/utils/disposeAll';

let activeComponents = new Map();

export function updateComponentRegistry(componentName, newModule) {
  activeComponents.forEach((instance, name) => {

    if (name === componentName) {
      instance.dispose();
      // Add to the list instead of creating a new instance immediately
      const NewClass = newModule[componentName];
      if (NewClass) {
        new NewClass();
        console.log('🏗️ HMR: Component updated:', componentName);
      }
    }
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
      this.lastUpdateTime = self.performance.now();
      dispatcher.register(this, this.raf);

      // hmr
      activeComponents.set(this.constructor.name, this);

    }

    destroy() {
      dispatcher.unregister(this);
    }
    dispose() {
      // unregister hmr
      this.destroy && this.destroy();

      scene.remove(this);
      disposeAll(this)

    }
  };


export { component };
