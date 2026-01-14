import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { CONFIG } from "@/config/webgl.js";

export class Map3D {
  constructor(scene) {
    this.scene = scene;
    this.url = "/models/models.glb";

    this.group = new THREE.Group();

    this.loader = new GLTFLoader();
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath("/draco/");
    this.loader.setDRACOLoader(this.dracoLoader);

    this.init();

    this.material = new THREE.MeshMatcapMaterial({
      matcap: new THREE.TextureLoader().load("/textures/matcap.png"),
    });
  }

  init() {
    this.scene.add(this.group);
    this.loadModel();
    this.update();
  }

  loadModel() {
    this.interactables = [];

    this.loader.load(this.url, (gltf) => {
      this.model = gltf.scene;

      this.model.traverse((child) => {
        child.material = this.material;
        if (child.name === "new-york") {
          this.interactables.push(child);
          child.userData = {
            slug: "new-york",
            type: "city",
          };
        }
      });

      // const materials = {};
      // this.model.traverse((object) => {
      //   if (object.isMesh) {
      //     materials[object.material.name] = this.material;
      //   }
      // });

      if (this.model) {
        const s = CONFIG.mapPlane.scale;
        this.model.scale.set(s, s, s);
        this.model.position.x = CONFIG.mapPlane.correction.x;
        this.model.position.y = CONFIG.mapPlane.correction.y;
        this.model.position.z = CONFIG.mapPlane.correction.z;
      }

      this.group.add(this.model);
      this.update(); // Set initial state
    });
  }

  getInteractables() {
    return this.interactables;
  }

  update() {
    this.group.rotation.x = Math.PI / 2;
    this.group.position.z = CONFIG.mapPlane.planePositionZ;

    if (this.model) {
      this.model.position.x = CONFIG.mapPlane.correction.x;
      this.model.position.y = CONFIG.mapPlane.correction.y;
      this.model.position.z = CONFIG.mapPlane.correction.z;

      const s = CONFIG.mapPlane.scale;
      this.model.scale.set(50, 50, 50);
    }
  }
}
