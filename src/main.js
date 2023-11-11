import { Object3D } from 'three';

import camera from '@/canvas/camera';
import { component } from '@/canvas/dispatcher';
import loader from '@/canvas/loader';
import postfx from '@/canvas/postfx/postfx';
import renderer from '@/canvas/renderer';
import scene from '@/canvas/scene';
import { DEBUG_MODE } from '@/constants';

let stats = null;
if (DEBUG_MODE) {
  import('stats-gl').then((module) => {
    stats = new module.default();
    stats.init(renderer.domElement);
    document.body.appendChild(stats.container);
    scene.onBeforeRender = function () {
      stats.begin();
    };
    scene.onAfterRender = function () {
      stats.end();
    };
  });
}

// disable auto update
Object3D.DEFAULT_MATRIX_AUTO_UPDATE = false;
Object3D.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = false;

class Site extends component(null, {
  raf: {
    renderPriority: Infinity, // always render in last the loop
    fps: Infinity, // no throttle to the render RAF
  },
}) {
  init() {
    loader.load();
    document.body.appendChild(renderer.domElement);
  }

  onRaf() {
    // renderer.render(scene, camera);
    // postprocess
    postfx.render(scene, camera);
  }

  onLoadEnd() {
    if (stats) {
      document.body.appendChild(stats.container);
      stats.init(renderer.domElement);
    }
  }
}

new Site();
