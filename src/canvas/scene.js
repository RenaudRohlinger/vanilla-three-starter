import { Scene } from 'three';

import camera from '@/canvas/camera';
import { component } from '@/canvas/dispatcher';
import loader from '@/canvas/loader';
import Plane from '@/canvas/meshes/plane';
import suzanne from '@/canvas/meshes/suzanne';

class Stage extends component(Scene) {
  init() {
    // wait only this asset finished loading to start
    loader.resources.matcap.loading.then(() => {
      this.add(new Plane());
    });
    this.add(camera);
  }
  onLoadEnd() {
    // wait everything loads to start
    this.add(new suzanne());
  }
}

export default new Stage();
