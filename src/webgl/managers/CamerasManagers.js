import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { MapControls } from "three/examples/jsm/Addons.js";

export class CamerasManager {
  constructor(camera, rendererDomElement, cameraType = "orbit", target = null) {
    this.cameraType = cameraType;
    this.camera = camera;
    this.rendererDomElement = rendererDomElement;
    this.controls = null;
    this.target = target;
    this.initControls();
  }

  initControls() {
    this.dispose();
    if (this.cameraType === "orbit") {
      this.controls = null;
      this.orbitControls();
    } else if (this.cameraType === "map") {
      this.controls = null;
      this.mapControls();
    }
  }

  setCameraType(type, target = null) {
    if (this.cameraType === type && !target) return;
    this.cameraType = type;
    if (target) {
      this.target = target;
    }
    this.initControls();
  }

  dispose() {
    if (this.controls) {
      this.controls.dispose();
      this.controls = null;
    }
  }

  orbitControls() {
    this.controls = new OrbitControls(this.camera, this.rendererDomElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 10;

    this.controls.target.set(this.target?.x || 0, this.target?.y || 0, this.target?.z || 0);

    // this.controls.maxPolarAngle = Math.PI;
  }

  mapControls() {
    this.controls = new MapControls(this.camera, this.rendererDomElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = true;
    this.controls.minDistance = 10;
    this.controls.maxDistance = 200;
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.minAzimuthAngle = -0.05;
    this.controls.zoomToCursor = false;
  }

  update() {
    if (this.controls) {
      this.controls.update();
    }
  }
}
