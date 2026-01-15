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

    // Initialize parameters with defaults (prioritizing what was working/hardcoded)
    this.params = {
      scale: 48.91, // Matches previous hardcoded value
      opacity: 1,
      visible: true,
      position: {
        x: -173,
        y: -2.3,
        z: -5.0,
      },
      groupPositionZ: CONFIG.mapPlane.planePositionZ,
      rotationX: Math.PI / 2,
    };

    this.init();

    this.material = new THREE.MeshMatcapMaterial({
      matcap: new THREE.TextureLoader().load("/textures/matcap.png"),
    });

    this.cityMaterial = new THREE.MeshMatcapMaterial({
      matcap: new THREE.TextureLoader().load("/textures/matcap.png"),
      color: 0xff0000,
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
        this.updateTransformAndUniforms();
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
      // console.log("Traversing child:", child.name); // Log EVERY child name

      if (child.name.startsWith("sphere-")) {
        // Attempt to match the part after "sphere-" to a city slug
        // logic: if child.name is "sphere-bordeaux", we look for "bordeaux"

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
            museums: [],
          };
        }

        console.log(
          `Matched interactive sphere ${child.name} to slug ${city.slug}`
        );

        // Make invisible but interactable
        // Apply distinct city material
        child.material = this.cityMaterial;

        this.interactables.push(child);
        child.userData = {
          ...child.userData,
          ...city,
          type: "city",
        };
        return;
      }

      child.material = this.material;
    });
    console.log("Total Interactables in Map3D:", this.interactables);
  }

  getInteractables() {
    return this.interactables;
  }

  updateTransformAndUniforms() {
    if (this.model) {
      this.model.scale.set(
        this.params.scale,
        this.params.scale,
        this.params.scale
      );
      this.model.position.set(
        this.params.position.x,
        this.params.position.y,
        this.params.position.z
      );
    }
  }

  update() {
    this.group.rotation.x = this.params.rotationX;
    this.group.position.z = this.params.groupPositionZ;

    this.updateTransformAndUniforms();
  }
}
