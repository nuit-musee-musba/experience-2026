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

        // Zone tactile très grande pour mobile
        const touchZoneGeometry = new THREE.SphereGeometry(8, 16, 16);
        const touchZoneMaterial = new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0,
          depthWrite: false
        });
        const touchZone = new THREE.Mesh(touchZoneGeometry, touchZoneMaterial);
        touchZone.userData = item;
        touchZone.position.copy(model.position);
        touchZone.name = 'touchZone';

        this.group.add(model);
        this.group.add(touchZone);
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
          CONFIG.pins.artworks.geometrySizes[0],
          CONFIG.pins.artworks.geometrySizes[1],
          CONFIG.pins.artworks.geometrySizes[2]
        );
        pin.material = new THREE.MeshBasicMaterial({
          color: CONFIG.colors.pinGreen,
        });
      }

      pin.userData = item;
      pin.position.set(item.x, item.y, -9.5);
      pin.name = 'pin';

      // Zone tactile TRÈS GRANDE pour mobile (8x la taille du pin pour les ronds jaunes)
      const touchZoneGeometry = item.artworks
        ? new THREE.BoxGeometry(10, 10, 10)
        : new THREE.SphereGeometry(8, 16, 16);
      const touchZoneMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false
      });
      const touchZone = new THREE.Mesh(touchZoneGeometry, touchZoneMaterial);
      touchZone.userData = item;
      touchZone.position.set(item.x, item.y, -9.5);
      touchZone.name = 'touchZone';

      this.group.add(pin);
      this.group.add(touchZone);
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
