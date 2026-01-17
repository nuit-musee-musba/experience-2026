import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { CONFIG } from "@/config/webgl.js";

export class MapPlane {
  constructor(scene) {
    this.scene = scene;
    this.config = CONFIG.mapPlane;

    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.loader = new SVGLoader();

    this.loadMap("/map.svg");
  }

  loadMap(url) {
    this.loader.load(url, (data) => {
      const paths = data.paths;
      const group = new THREE.Group();

      // Flip the map properly: SVG coordinates have Y going down, 3D has Y going up
      group.scale.y = -1;

      for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        const material = new THREE.MeshBasicMaterial({
          color: path.color,
          side: THREE.DoubleSide,
          depthWrite: false,
        });

        const shapes = SVGLoader.createShapes(path);

        for (let j = 0; j < shapes.length; j++) {
          const shape = shapes[j];
          const geometry = new THREE.ShapeGeometry(shape);
          const mesh = new THREE.Mesh(geometry, material);
          group.add(mesh);
        }

        // Add black stroke
        const strokeMaterial = new THREE.MeshBasicMaterial({
          color: 0x000000,
          depthWrite: false,
          side: THREE.DoubleSide,
        });

        for (const subPath of path.subPaths) {
          const strokeGeometry = SVGLoader.pointsToStroke(subPath.getPoints(), {
            stroke: "#000000",
            strokeWidth: 1,
          });

          if (strokeGeometry) {
            const strokeMesh = new THREE.Mesh(strokeGeometry, strokeMaterial);
            strokeMesh.position.z = 1; // Small offset to prevent z-fighting with fill
            group.add(strokeMesh);
          }
        }
      }

      // Center the map content
      const box = new THREE.Box3().setFromObject(group);
      const center = box.getCenter(new THREE.Vector3());

      group.position.x = -center.x;
      group.position.y = -center.y;
      group.position.z = 0; // Centered Z

      this.group.add(group);

      // Initial update to apply config
      this.update();
    });
  }

  update() {
    if (!this.group) return;

    // Apply global transforms from CONFIG
    const { correction, planeRotationX, planePositionZ, scale } = this.config;

    if (scale) {
      this.group.scale.set(scale, scale, scale);
    }

    this.group.rotation.x = planeRotationX;
    this.group.position.x = correction.x;
    this.group.position.y = correction.y;
    this.group.position.z = planePositionZ + correction.z;
  }
}
