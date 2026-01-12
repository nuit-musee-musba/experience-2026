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
  }

  initBackground() {
    const bgGeometry = new THREE.PlaneGeometry(this.width, this.height);
    const bgMaterial = new THREE.MeshBasicMaterial({ color: CONFIG.colors.mapPlaneBackground });
    this.bgPlane = new THREE.Mesh(bgGeometry, bgMaterial);

    this.bgPlane.position.z = CONFIG.mapPlane.backgroundZ;
    this.plane.add(this.bgPlane);
  }

  update() {
    if (this.bgPlane) {
      this.bgPlane.position.z = CONFIG.mapPlane.backgroundZ;
    }
    if (this.center) {
      this.mapGroup.position.x = -this.center.x + CONFIG.mapPlane.correction.x;
      this.mapGroup.position.y = -this.center.y + CONFIG.mapPlane.correction.y;
      this.mapGroup.position.z = CONFIG.mapPlane.correction.z;
    }
    this.plane.position.z = CONFIG.mapPlane.planePositionZ;
    this.plane.rotation.x = CONFIG.mapPlane.planeRotationX;
  }

  loadMap(url) {
    this.loader.load(url, (data) => {
      const paths = data.paths;
      const group = new THREE.Group();
      group.scale.y = CONFIG.mapPlane.scaleY;
      group.position.z = CONFIG.mapPlane.positionZ;

      for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        const material = new THREE.MeshBasicMaterial({
          color: i === 239 || i === 73 || i === 190 ? CONFIG.colors.grey : path.color,
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
      this.center = new THREE.Vector3();
      const boxHelper = new THREE.Box3Helper(box, CONFIG.colors.boxHelper);
      box.getCenter(this.center);
      
      this.scene.add(boxHelper);
      
      this.update();
    });
  }
}
