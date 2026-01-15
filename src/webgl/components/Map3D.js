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

      if (this.model) {
        const s = CONFIG.mapPlane.scale;
        this.model.scale.set(s, s, s);
        this.model.position.x = CONFIG.mapPlane.correction.x;
        this.model.position.y = CONFIG.mapPlane.correction.y;
        this.model.position.z = CONFIG.mapPlane.correction.z;
      }

      this.group.add(this.model);
      this.refreshInteractables();
      this.update(); // Set initial state
    });
  }

  setCityData(data) {
    this.data = data;
    this.refreshInteractables();
  }

  refreshInteractables() {
    if (!this.model) return;

    console.log("Refreshing interactables. City Data:", this.data);

    this.interactables = [];

    this.model.traverse((child) => {
      console.log("Traversing child:", child.name); // Log EVERY child name

      // Check for sphere- specifically for interaction
      if (child.name.startsWith("sphere-")) {
        // Attempt to match the part after "sphere-" to a city slug
        // logic: if child.name is "sphere-bordeaux", we look for "bordeaux"
        // logic: if child.name is "sphere-new-york", we look for "new-york"

        const possibleSlug = child.name.replace("sphere-", "");
        let city = this.data.find(
          (c) => c.slug === possibleSlug || possibleSlug.startsWith(c.slug)
        );

        if (!city) {
          console.warn(
            `Sphere ${child.name} found but no data in content.json. Creating default interaction.`
          );
          city = {
            slug: possibleSlug,
            museums: [], // Empty museums acts as a flag for "City" type in Map.vue
          };
        }

        console.log(
          `Matched interactive sphere ${child.name} to slug ${city.slug}`
        );

        // Make invisible but interactable
        child.material = new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0,
          depthWrite: false,
        });

        this.interactables.push(child);
        child.userData = {
          ...child.userData,
          ...city,
          type: "city",
        };
        return; // Stop processing this child
      }

      // Keep original material for other meshes
      child.material = this.material;
    });
    console.log("Total Interactables in Map3D:", this.interactables);
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
