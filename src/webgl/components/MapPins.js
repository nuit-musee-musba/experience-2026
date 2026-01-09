import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export class MapPins {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.circleTexture = this.createCircleTexture();
    this.loader = new GLTFLoader();
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('/draco/');
    this.loader.setDRACOLoader(this.dracoLoader);
  }

  createCircleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(32, 32, 28, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    return new THREE.CanvasTexture(canvas);
  }

  addPin(item) {
    if (item.model3d) {
      this.loader.load(`/models/${item.model3d}`, (gltf) => {
        const model = gltf.scene;
        model.position.set(item.x, item.y, -10);
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
      const geometry = new THREE.SphereGeometry(1, 32, 16);
      const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      const pin = new THREE.Mesh(geometry, material);
      
      if (item.artworks) {
         pin.geometry = new THREE.BoxGeometry(1, 1, 1);
         pin.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      }

      pin.userData = item;
      pin.position.set(item.x, item.y, -9.5);
      pin.name = 'pin';
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
                 child.material.forEach(m => m.dispose());
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
