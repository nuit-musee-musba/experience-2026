import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

export class Map3D {
  constructor(scene) {
    this.scene = scene;
    this.url = "/models/map.glb";

    this.group = new THREE.Group();

    this.loader = new GLTFLoader();
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath("/draco/");
    this.loader.setDRACOLoader(this.dracoLoader);

    this.params = {
      scale: 48.91,
      opacity: 1,
      visible: true,
      position: {
        x: -173,
        y: -2.3,
        z: -5.0,
      },
      groupPositionZ: -5.85,
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
    this.loader.load(this.url, (gltf) => {
      this.model = gltf.scene;
      this.model.traverse((child) => {
        child.material = this.material;
      });

      if (this.model) {
        this.updateTransformAndUniforms();
      }

      this.group.add(this.model);
      this.update();
    });
  }

  setCityData(data) {
    this.data = data;
  }

  updateTransformAndUniforms() {
    if (this.model) {
      this.model.scale.set(
        this.params.scale,
        this.params.scale,
        this.params.scale,
      );
      this.model.position.set(
        this.params.position.x,
        this.params.position.y,
        this.params.position.z,
      );
    }
  }

  update() {
    this.group.rotation.x = this.params.rotationX;
    this.group.position.z = this.params.groupPositionZ;

    this.updateTransformAndUniforms();
  }
}
