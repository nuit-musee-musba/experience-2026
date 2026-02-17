import CameraControls from "camera-controls";
import * as THREE from "three";
import { CONFIG } from "@/config/webgl.js";

CameraControls.install({ THREE: THREE });

export class CamerasManager {
  constructor(camera, rendererDomElement) {
    this.camera = camera;
    this.rendererDomElement = rendererDomElement;
    this.controls = null;
    this.initControls();
  }

  initControls() {
    this.controls = new CameraControls(this.camera, this.rendererDomElement);

    // Default config
    this.controls.minDistance = CONFIG.controls.minDistance;
    this.controls.maxDistance = CONFIG.controls.map.continent.maxDistance;

    this.controls.smoothTime = 0.25;
    this.controls.draggingSmoothTime = 0.35;

    // Map controls
    this.controls.mouseButtons.wheel = CameraControls.ACTION.DOLLY;
    this.controls.touches.two = CameraControls.ACTION.TOUCH_DOLLY_TRUCK;
    this.controls.verticalDragToForward = true;
  }

  setConstraints(config = {}) {
    if (config.minAzimuthAngle !== undefined)
      this.controls.minAzimuthAngle = config.minAzimuthAngle;
    if (config.maxAzimuthAngle !== undefined)
      this.controls.maxAzimuthAngle = config.maxAzimuthAngle;

    if (config.minPolarAngle !== undefined)
      this.controls.minPolarAngle = config.minPolarAngle;
    if (config.maxPolarAngle !== undefined)
      this.controls.maxPolarAngle = config.maxPolarAngle;

    if (config.minDistance !== undefined)
      this.controls.minDistance = config.minDistance;
    if (config.maxDistance !== undefined)
      this.controls.maxDistance = config.maxDistance;

    this.controls.enabled = config.enabled !== false;
  }

  setLookAt(position, target, enableTransition = true) {
    this.controls
      .normalizeRotations()
      .setLookAt(
        position.x,
        position.y,
        position.z,
        target.x,
        target.y,
        target.z,
        enableTransition,
      );
  }

  update(delta) {
    return this.controls.update(delta);
  }

  dispose() {
    if (this.controls) {
      this.controls.dispose();
      this.controls = null;
    }
  }
}
