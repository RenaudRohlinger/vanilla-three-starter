import { Scene } from 'three';

import camera from '@/canvas/camera';
import { component } from '@/canvas/dispatcher';
import { Grid } from '@/canvas/meshes/Grid/Grid';
import { Suzanne } from './meshes/suzanne';

class Stage extends component(Scene) {
  init() {
    // wait only this asset finished loading to start
    // loader.resources.matcap.loading.then(() => {
    //   this.add(new Plane());
    // });
    this.add(camera);
  }
  onLoadEnd() {
    this.add(new Grid());

    // wait everything loads to start
    this.add(new Suzanne());
  }
}

export default new Stage();
