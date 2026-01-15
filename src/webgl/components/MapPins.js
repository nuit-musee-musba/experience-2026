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
    
    this.pinModelPromise = new Promise((resolve) => {
      this.loader.load("/models/pin.glb", (gltf) => {
        resolve(gltf.scene);
      });
    });
  }

  createCircleTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = CONFIG.pins.circleTextureSize;
    canvas.height = CONFIG.pins.circleTextureSize;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(
      CONFIG.pins.circleTextureSize / 2,
      CONFIG.pins.circleTextureSize / 2,
      CONFIG.pins.circleRadius,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    return new THREE.CanvasTexture(canvas);
  }

  addPin(item) {
    if (item.model3d) {
      this.loader.load(`/models/${item.model3d}`, (gltf) => {
        const model = gltf.scene;
        model.position.set(item.x, item.y, CONFIG.pins.onceClickedZ);
        model.scale.set(0.1, 0.1, 0.1);
        model.rotation.set(Math.PI / 2, Math.PI / 2, 0);

        model.traverse((child) => {
          if (child.isMesh) {
            child.userData = item;
          }
        });
        model.userData = item;
        this.group.add(model);
      });
    } else {
      if (item.artworks) {
        const geometry = new THREE.BoxGeometry(
          CONFIG.pins.artworks.geometrySizes[0],
          CONFIG.pins.artworks.geometrySizes[1],
          CONFIG.pins.artworks.geometrySizes[2]
        );
        const material = new THREE.MeshBasicMaterial({
          color: CONFIG.colors.pinGreen,
        });
        const pin = new THREE.Mesh(geometry, material);
        pin.userData = item;
        pin.position.set(item.x, item.y, CONFIG.pins.defaultZ);
        pin.name = "pin";
        this.group.add(pin);
      } else {
        this.pinModelPromise.then((model) => {
          const pin = model.clone();
        
          pin.scale.set(0.1, 0.1, 0.1);
          pin.rotation.set(Math.PI, Math.PI, Math.PI / 1);

          pin.traverse((child) => {
             if (child.isMesh) {
               child.userData = item;
             }
          });
          pin.userData = item;
          pin.position.set(item.x, item.y, CONFIG.pins.defaultZ);
          pin.name = "pin";
          this.group.add(pin);
        });
      }
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
