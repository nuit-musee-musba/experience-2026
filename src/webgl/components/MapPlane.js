import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { CONFIG } from "@/config/webgl.js";

export class MapPlane {
  constructor(scene, onLoad = null) {
    this.scene = scene;
    this.config = CONFIG.mapPlane;

    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.onLoad = onLoad;
    this.loader = new SVGLoader();

    this.loadMap("/map.svg");
  }

  loadMap(url) {
    this.loader.load(url, (data) => {
      const paths = data.paths;
      const group = new THREE.Group();

      group.scale.y = -1;

      const geometriesByColor = {};
      const strokeGeometries = [];

      for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        const color = path.color.getHex();

        const shapes = SVGLoader.createShapes(path);

        for (let j = 0; j < shapes.length; j++) {
          const shape = shapes[j];
          const geometry = new THREE.ShapeGeometry(shape);

          if (!geometriesByColor[color]) {
            geometriesByColor[color] = [];
          }
          geometriesByColor[color].push(geometry);
        }

        for (const subPath of path.subPaths) {
          const strokeGeometry = SVGLoader.pointsToStroke(subPath.getPoints(), {
            stroke: "#000000",
            strokeWidth: 1,
          });

          if (strokeGeometry) {
            strokeGeometries.push(strokeGeometry);
          }
        }
      }

      // Merge fill geometries
      for (const color in geometriesByColor) {
        const geometries = geometriesByColor[color];
        if (geometries.length > 0) {
          const mergedGeometry =
            BufferGeometryUtils.mergeGeometries(geometries);
          const material = new THREE.MeshBasicMaterial({
            color: parseInt(color),
            side: THREE.DoubleSide,
            depthWrite: false,
          });
          const mesh = new THREE.Mesh(mergedGeometry, material);
          group.add(mesh);
        }
      }

      if (strokeGeometries.length > 0) {
        const mergedStrokeGeometry =
          BufferGeometryUtils.mergeGeometries(strokeGeometries);
        const strokeMaterial = new THREE.MeshBasicMaterial({
          color: 0x000000,
          depthWrite: false,
          side: THREE.DoubleSide,
          depthTest: false,
          transparent: true,
        });
        const strokeMesh = new THREE.Mesh(mergedStrokeGeometry, strokeMaterial);
        strokeMesh.position.z = 1;
        group.add(strokeMesh);
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

      if (this.onLoad) {
        this.onLoad();
      }
    });
  }

  delete() {
    this.group.clear();
    this.group = new THREE.Group();
    this.scene.add(this.group);
  }

  reload() {
    this.delete();
    this.loadMap("/map.svg");
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
