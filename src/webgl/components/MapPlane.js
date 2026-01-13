import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { CONFIG } from "@/config/webgl.js";

export class MapPlane {
  constructor(scene, url, width, height) {
    this.scene = scene;
    this.url = url;
    this.width = width;
    this.height = height;

    this.plane = new THREE.Group();
    this.mapGroup = new THREE.Group();
    this.plane.add(this.mapGroup);

    this.loader = new SVGLoader();

    this.initBackground();
    this.loadMap(this.url);

    this.scene.add(this.plane);

    this.update();
  }

  update() {
    if (this.bgPlane) {
      this.bgPlane.position.z = CONFIG.mapPlane.backgroundZ;
    }

    // Apply corrections to the whole plane group (rotation/position)
    this.plane.rotation.x = CONFIG.mapPlane.planeRotationX;
    this.plane.position.z = CONFIG.mapPlane.planePositionZ;

    // Apply corrections to the map group inside
    if (this.mapGroup && this.basePosition) {
      this.mapGroup.position.x =
        this.basePosition.x + CONFIG.mapPlane.correction.x;
      this.mapGroup.position.y =
        this.basePosition.y + CONFIG.mapPlane.correction.y;
      this.mapGroup.position.z =
        this.basePosition.z + CONFIG.mapPlane.correction.z;
    }
  }

  initBackground() {
    const bgGeometry = new THREE.PlaneGeometry(this.width, this.height);
    const bgMaterial = new THREE.MeshBasicMaterial({ color: 0xf0f0f0 });
    this.bgPlane = new THREE.Mesh(bgGeometry, bgMaterial);

    this.bgPlane.position.z = CONFIG.mapPlane.backgroundZ;
    this.plane.add(this.bgPlane);
  }

  loadMap(url) {
    this.loader.load(url, (data) => {
      const paths = data.paths;
      const group = new THREE.Group();
      group.scale.y = -1;
      group.position.z = 0;

      for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        const material = new THREE.MeshBasicMaterial({
          color: i === 239 || i === 73 || i === 190 ? 0xa9a9a9 : path.color,
          side: THREE.DoubleSide,
        });

        const shapes = SVGLoader.createShapes(path);

        for (let j = 0; j < shapes.length; j++) {
          const shape = shapes[j];
          const geometry = new THREE.ShapeGeometry(shape);
          const mesh = new THREE.Mesh(geometry, material);
          group.add(mesh);
        }
      }

      this.mapGroup.add(group);

      // Center the map
      const box = new THREE.Box3().setFromObject(group);
      const center = new THREE.Vector3();
      box.getCenter(center);

      this.basePosition = new THREE.Vector3(-center.x, -center.y, 0);

      this.mapGroup.position.copy(this.basePosition);
      this.update();
    });
  }
}
