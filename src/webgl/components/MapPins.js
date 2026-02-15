import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { CONFIG } from "@/config/webgl.js";

const PIN_SVG = `
<svg width="90" height="124" viewBox="0 0 90 124" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M44.6917 0C20.0091 0 0 20.0091 0 44.6917C0 50.9269 3.60864 59.8328 6.53594 65.3846L37.9286 120.498C41.5625 124.334 47.9218 124.839 50.95 120.498L82.6455 65.3846C86.2794 57.814 89.3833 50.9269 89.3833 44.6917C89.3833 20.0091 69.3742 0 44.6917 0Z" fill="#F5AEBC"/>
<path d="M44.6919 15.1919C60.9842 15.192 74.1919 28.3995 74.1919 44.6919C74.1918 60.9841 60.9841 74.1918 44.6919 74.1919C28.3995 74.1919 15.192 60.9842 15.1919 44.6919C15.1919 28.3995 28.3995 15.1919 44.6919 15.1919Z" stroke="white" stroke-width="4.84517"/>
<path d="M25.5381 44.6919C31.2842 36.7112 38.6264 31.9229 44.6917 31.9229C50.757 31.9229 58.0992 36.7112 63.8452 44.6919C58.0992 52.6726 50.757 57.4609 44.6917 57.4609C38.6264 57.4609 31.2842 52.6726 25.5381 44.6919Z" stroke="white" stroke-width="5.74607" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M44.6917 51.0762C48.2177 51.0762 51.0762 48.2177 51.0762 44.6917C51.0762 41.1656 48.2177 38.3071 44.6917 38.3071C41.1656 38.3071 38.3071 41.1656 38.3071 44.6917C38.3071 48.2177 41.1656 51.0762 44.6917 51.0762Z" fill="white"/>
</svg>
`;

export class MapPins {
  constructor(scene, onClick) {
    this.scene = scene;
    this.onClick = onClick;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.loader = new GLTFLoader();
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath("/draco/");
    this.loader.setDRACOLoader(this.dracoLoader);
  }

  addPin(item) {
    if (item.model3d) {
      this.loader.load(`/models/${item.model3d}`, (gltf) => {
        const model = gltf.scene;
        model.position.set(item.x, item.y, CONFIG.pins.onceClickedZ);
        model.scale.set(0.05, 0.05, 0.05);
        model.rotation.set(Math.PI / 2, Math.PI / 2, 0);

        model.traverse((child) => {
          if (child.isMesh) {
            child.userData = item;
          }
        });
        model.userData = item;
        this.group.add(model);
      });
    } else {
      if (item.artworks) {
        const geometry = new THREE.BoxGeometry(
            CONFIG.pins.artworks.geometrySizes[0],
            CONFIG.pins.artworks.geometrySizes[1],
            CONFIG.pins.artworks.geometrySizes[2]
        );
        const material = new THREE.MeshBasicMaterial({
          color: CONFIG.colors.pinGreen,
        });
        const pin = new THREE.Mesh(geometry, material);
        pin.userData = item;
        pin.position.set(item.x, item.y, CONFIG.pins.defaultZ);
        pin.name = "pin";
        this.group.add(pin);
      } else {
        const container = document.createElement("div");
        container.style.position = "relative";
        container.style.cursor = "pointer";
        container.style.pointerEvents = "auto";
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.alignItems = "center";

        if (item.name) {
          const label = document.createElement("div");
          label.textContent = item.name;
          label.style.fontFamily = "Arial, sans-serif";
          label.style.fontSize = "24px";
          label.style.fontWeight = "bold";
          label.style.color = "#000";
          label.style.marginBottom = "75px";
          label.style.whiteSpace = "nowrap";
          label.style.textAlign = "center";
          container.appendChild(label);
        }

        const pinWrapper = document.createElement("div");
        pinWrapper.innerHTML = PIN_SVG;
        pinWrapper.style.transform = "translateY(-50%)";
        if (CONFIG.pins.htmlScale) {
          pinWrapper.style.scale = CONFIG.pins.htmlScale;
        }
        container.appendChild(pinWrapper);

        container.addEventListener("click", (e) => {
          e.stopPropagation();
          console.log("Pin clicked", item);
          if (this.onClick) {
            this.onClick(item);
          }
        });

        container.addEventListener(
            "touchstart",
            (e) => {
              e.stopPropagation();
              if (this.onClick) {
                this.onClick(item);
              }
            },
            { passive: false }
        );

        const css2dObject = new CSS2DObject(container);
        css2dObject.position.set(item.x, item.y, CONFIG.pins.defaultZ);
        css2dObject.userData = item;

        this.group.add(css2dObject);
      }
    }
  }

  renderLevel(dataList) {
    this.clear();
    dataList.forEach((item) => this.addPin(item));
  }

  clear() {
    while (this.group.children.length > 0) {
      const object = this.group.children[0];

      if (object.traverse) {
        object.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (child.material.length) {
              child.material.forEach((m) => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }

      this.group.remove(object);

      if (object.element && object.element.parentNode) {
        object.element.parentNode.removeChild(object.element);
      }
    }
  }

  getPins() {
    return this.group.children;
  }
}