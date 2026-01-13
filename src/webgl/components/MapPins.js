import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { CONFIG } from "@/config/webgl.js";

export class MapPins {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.circleTexture = this.createCircleTexture();
    this.loader = new GLTFLoader();
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath("/draco/");
    this.loader.setDRACOLoader(this.dracoLoader);
  }

  createCircleTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = CONFIG.pins.circleTextureSize;
    canvas.height = CONFIG.pins.circleTextureSize;
    const ctx = canvas.getContext("2d");
    const center = CONFIG.pins.circleTextureSize / 2;
    ctx.beginPath();
    ctx.arc(center, center, CONFIG.pins.circleRadius, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    return new THREE.CanvasTexture(canvas);
  }

  addPin(item) {
    if (item.model3d) {
      this.loader.load(`/models/${item.model3d}`, (gltf) => {
        const model = gltf.scene;
        model.position.set(item.x, CONFIG.pins.defaultZ, item.y);
        model.scale.set(0.1, 0.1, 0.1);
        model.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI / 1.4);

        model.traverse((child) => {
          if (child.isMesh) {
            child.userData = item;
          }
        });
        model.userData = item;

        this.group.add(model);
      });
    } else {
      const geometry = new THREE.SphereGeometry(
        CONFIG.pins.museums.sphereRadius,
        CONFIG.pins.museums.sphereWidthSegments,
        CONFIG.pins.museums.sphereHeightSegments
      );
      const material = new THREE.MeshBasicMaterial({
        color: CONFIG.colors.pinYellow,
      });
      const pin = new THREE.Mesh(geometry, material);

      if (item.artworks) {
        pin.geometry = new THREE.BoxGeometry(
          ...CONFIG.pins.artworks.geometrySizes
        );
        pin.material = new THREE.MeshBasicMaterial({
          color: CONFIG.colors.pinGreen,
        });
      }

      pin.userData = item;
      pin.position.set(item.x, CONFIG.pins.defaultZ, item.y);
      pin.name = "pin";
      this.group.add(pin);
    }
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
