import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { CONFIG } from "@/config/webgl.js";

export class Map3D {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.circleTexture = this.createCircleTexture();
    this.loader = new GLTFLoader();
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath("/draco/");
    this.loader.setDRACOLoader(this.dracoLoader);

    this.update();
  }

  update() {
    this.group.rotation.x = CONFIG.mapPlane.planeRotationX;
    this.group.position.z = CONFIG.mapPlane.planePositionZ;
  }

  addModel() {
      this.loader.load(`/models/map.glb`, (gltf) => {
        const model = gltf.scene;

        model.traverse((child) => {
          if (child.isMesh) {
            child.userData = item;
          }
        });
        model.userData = item;

        this.group.add(model);
      });
  }

  renderLevel(dataList) {
    this.clear();
    dataList.forEach((item) => this.addPin(item));
  }

  clear() {
    while (this.group.children.length > 0) {
      const object = this.group.children[0];
      if (object.traverse) {
        object.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (child.material.length) {
              child.material.forEach((m) => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }
      if (object.geometry) object.geometry.dispose();
      if (object.material) object.material.dispose();
      this.group.remove(object);
    }
  }

  getPins() {
    return this.group.children;
  }
}
