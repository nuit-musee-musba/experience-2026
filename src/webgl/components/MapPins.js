import * as THREE from 'three';

export class MapPins {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.circleTexture = this.createCircleTexture();
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
    const material = new THREE.SpriteMaterial({ map: this.circleTexture, color: 0xff0000 });
    const pin = new THREE.Sprite(material);
    pin.scale.set(2, 2, 1);
    pin.userData = item;
    pin.position.set(item.x, item.y, -9);
    pin.name = 'marker';
    this.group.add(pin);
  }

  renderLevel(dataList) {
    this.clear();
    dataList.forEach((item) => this.addPin(item));
  }

  clear() {
    while (this.group.children.length > 0) {
      const object = this.group.children[0];
      if (object.geometry) object.geometry.dispose();
      if (object.material) object.material.dispose();
      this.group.remove(object);
    }
  }

  getPins() {
    return this.group.children;
  }
}
