
class Dispatcher {
  constructor() {
    this.data = {};
    this.listeners = {};
    this.fireAtStart = {};
    this.instances = [];
    this.handlerMap = {}; // New property to track handlers
    this.triggeredEvents = new Set(); // Keep track of all triggered events
    this.globalLastUpdateTime = 0;
    this.is;
  }

  on(e, f) {
    this.listeners[e] = this.listeners[e] || [];
    if (!this.handlerMap[e]) {
      this.handlerMap[e] = new Set();
    }
    if (!this.handlerMap[e].has(f)) {
      this.handlerMap[e].add(f);
      this.listeners[e].push(f);
    }
    this.listeners[e].push(f);
  }
  isHandlerRegistered(e, f) {
    return this.handlerMap[e] && this.handlerMap[e].has(f);
  }

  off(e, f) {
    if (e in this.listeners === false) {
      return;
    }

    this.listeners[e].splice(this.listeners[e].indexOf(f), 1);

    if (this.handlerMap[e]) {
      this.handlerMap[e].delete(f);
    }
  }

  register(instance) {
    this.instances.push(instance);

    for (let k in this.fireAtStart) {
      this.fireMethod(instance, k);
    }
  }

  unregister(instance) {
    const index = this.instances.indexOf(instance);

    if (index > -1) {
      this.instances.splice(index, 1);
    }
  }

  nameToMethod(n) {
    return `on${n.charAt(0).toUpperCase() + n.slice(1)}`;
  }

  fireMethod(instance, name) {
    const method = instance[this.nameToMethod(name)];

    if (typeof method === 'function') {
      method.call(instance, this.data[name]);
    }
  }

  triggerOnRaf({ elapsedTime }) {
    const performance = self.performance;
    const now = performance.now();

    // Sort the instances by renderPriority
    const sortedInstances = Array.from(this.instances);
    for (let i = 0; i < sortedInstances.length; i++) {
      for (let j = 0; j < sortedInstances.length; j++) {
        if (
          sortedInstances[i].raf.renderPriority <
          sortedInstances[j].raf.renderPriority
        ) {
          const temp = sortedInstances[i];
          sortedInstances[i] = sortedInstances[j];
          sortedInstances[j] = temp;
        }
      }
    }

    for (let instance of sortedInstances) {
      if (typeof instance.onBeforeRaf === 'function') {
        instance.onBeforeRaf();
      }
    }

    const maxDelta = 0.033; // Maximum delta time for 30 FPS
    const globalDelta = Math.min(
      (now - this.globalLastUpdateTime) / 1000,
      maxDelta
    );
    this.globalLastUpdateTime = now;

    for (let instance of sortedInstances) {
      if (typeof instance.onRaf === 'function') {
        const timeSinceLastUpdate = Math.min(
          now - (instance.lastUpdateTime || now),
          maxDelta * 1000
        );
        const fpsInterval = 1000 / instance.raf.fps; // Interval based on instance's FPS

        // Calculate throttleInterpolation for each frame
        let throttleInterpolation =
          (timeSinceLastUpdate % fpsInterval) / fpsInterval;
        if (instance.raf.fps === Infinity) {
          throttleInterpolation = 0; // If the instance is set to update every frame, the interpolation is not needed
        } else if (typeof instance.onThrottle === 'function') {
          if (Math.round(timeSinceLastUpdate) >= Math.round(fpsInterval)) {
            // If the component should update, reset throttleInterpolation to 1
            throttleInterpolation = 1;

            const throttledDelta = timeSinceLastUpdate / 1000; // Convert to seconds
            instance.onThrottle({
              delta: throttledDelta,
              elapsedTime,
            });
            instance.lastUpdateTime = now;
          }
        }

        instance.onRaf({
          delta: globalDelta,
          throttleInterpolation,
          elapsedTime,
        });
      }
    }

    for (let instance of sortedInstances) {
      if (typeof instance.onAfterRaf === 'function') {
        instance.onAfterRaf();
      }
    }
  }

  trigger({ name, fireAtStart = false, log = false }, data = {}) {
    this.data[name] = data;
    if (name !== 'newEventRegistered' && typeof window === 'undefined') {
      this.trigger({ name: 'newEventRegistered' }, { newEvent: name });
    }
    if (fireAtStart) {
      this.fireAtStart[name] = true;
    }

    if (log) {
      console.log(`👨‍🏫 ${name} – ${data}`);
    }

    if (name in this.listeners) {
      for (let i = 0; i < this.listeners[name].length; i++) {
        this.listeners[name][i].call(this, data);
      }
    }

    this.instances.forEach((instance) => this.fireMethod(instance, name));
  }
}

const dispatcherSingleton = /* @__PURE__ */ new Dispatcher();

export default dispatcherSingleton;
