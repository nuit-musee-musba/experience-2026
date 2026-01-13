import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { CONFIG } from "@/config/webgl.js";

export class Map3D {
  constructor(scene) {
    this.scene = scene;
    this.url = "/models/models.glb";

    this.group = new THREE.Group();
    // Use a nested group to match MapPlane structure if needed for internal offset corrections,
    // although MapPlane has 'plane' (group) -> 'mapGroup' (group) -> 'group' (loaded svg).
    // Here we can stick to a similar structure: this.group is the main container (like 'plane'),
    // and we load the model into it (like 'mapGroup').

    this.loader = new GLTFLoader();
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath("/draco/");
    this.loader.setDRACOLoader(this.dracoLoader);

    this.init();
  }

  init() {
    this.scene.add(this.group);
    this.loadModel();
    this.update();
  }

  loadModel() {
    this.loader.load(this.url, (gltf) => {
      this.model = gltf.scene;

      // Apply initial internal consistency corrections if any are specific to the model source
      // For now, we assume the model itself is the "mapGroup" equivalent.

      // MapPlane applies corrections to 'mapGroup'.
      if (this.model) {
        this.model.scale.y = CONFIG.mapPlane.scaleY;
        this.model.position.x = CONFIG.mapPlane.correction.x;
        this.model.position.y = CONFIG.mapPlane.correction.y;
        this.model.position.z = CONFIG.mapPlane.correction.z;
      }

      this.group.add(this.model);
    });
  }

  update() {
    // Apply corrections to the whole plane group (rotation/position)
    // mirroring MapPlane.js update() logic
    this.group.rotation.x = CONFIG.mapPlane.planeRotationX;
    this.group.position.z = CONFIG.mapPlane.planePositionZ;

    // If we want to support dynamic updates of internal corrections like MapPlane:
    if (this.model) {
      this.model.position.x = CONFIG.mapPlane.correction.x;
      this.model.position.y = CONFIG.mapPlane.correction.y;
      this.model.position.z = CONFIG.mapPlane.correction.z;
    }
  }
}
