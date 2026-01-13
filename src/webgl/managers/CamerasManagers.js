import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { MapControls } from "three/examples/jsm/Addons.js";
import { CONFIG } from "@/config/webgl.js";

export class CamerasManager {
  constructor(camera, rendererDomElement, cameraType = "orbit", target = null) {
    this.cameraType = cameraType;
    this.camera = camera;
    this.rendererDomElement = rendererDomElement;
    this.controls = null;
    this.target = target;
    this.enabled = true;
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
    if (this.controls) {
      this.controls.enabled = this.enabled;
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
    this.controls.dampingFactor = CONFIG.controls.dampingFactor;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = CONFIG.controls.minDistance;

    this.controls.target.set(
      this.target?.x || 0,
      this.target?.y || 0,
      this.target?.z || 0
    );

    // this.controls.maxPolarAngle = Math.PI;
  }

  // Dans CamerasManager.js
  mapControls() {
    this.controls = new MapControls(this.camera, this.rendererDomElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = CONFIG.controls.dampingFactor;
    this.controls.screenSpacePanning = true;

    // Limites de distance (Zoom)
    this.controls.minDistance = CONFIG.controls.minDistance;
    this.controls.maxDistance = CONFIG.controls.map.maxDistance;

    // Limites d'inclinaison (Vue plongée)
    this.controls.minPolarAngle = CONFIG.controls.map.minPolarAngle || 0;
    this.controls.maxPolarAngle = CONFIG.controls.map.maxPolarAngle;

    // Optionnel : Bloquer la rotation horizontale pour garder la carte "droite"
    this.controls.enableRotate = true; // Gardez à true si vous voulez une légère inclinaison manuelle

    this.controls.zoomToCursor = false;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (this.controls) {
      this.controls.enabled = enabled;
    }
  }

  update() {
    if (this.controls) {
      this.controls.update();
    }
  }
}
