import { Pane } from "tweakpane";
import { CONFIG } from "@/config/webgl.js";

export class GUI {
  constructor() {
    this.pane = new Pane({ title: "Experience Config", expanded: true });
  }

  addMap(map3D) {
    if (!map3D) return;

    const mapFolder = this.pane.addFolder({ title: "Map 3D" });

    mapFolder
      .addBinding(map3D.params, "scale", { min: 0, max: 100 })
      .on("change", () => map3D.update());

    mapFolder
      .addBinding(map3D.params, "groupPositionZ", { min: -100, max: 0 })
      .on("change", () => map3D.update());

    mapFolder
      .addBinding(map3D.params, "rotationX", {
        min: -Math.PI,
        max: Math.PI,
      })
      .on("change", () => map3D.update());

    mapFolder
      .addBinding(map3D.params, "position", {
        x: { min: -500, max: 500,  },
        y: { min: -500, max: 500 },
        z: { min: -500, max: 500 },
      })
      .on("change", () => map3D.update());
  }

  addLights(ambientLight, directionalLight) {
    const lightsFolder = this.pane.addFolder({ title: "Lights" });

    lightsFolder
      .addBinding(CONFIG.lights, "ambientIntensity", { min: 0, max: 2 })
      .on("change", (ev) => {
        if (ambientLight) ambientLight.intensity = ev.value;
      });
    lightsFolder
      .addBinding(CONFIG.lights, "directionalIntensity", { min: 0, max: 5 })
      .on("change", (ev) => {
        if (directionalLight) directionalLight.intensity = ev.value;
      });
    lightsFolder
      .addBinding(CONFIG.lights, "directionalPosition", {
        x: { min: -50, max: 50 },
        y: { min: -50, max: 50 },
        z: { min: -50, max: 50 },
      })
      .on("change", (ev) => {
        if (directionalLight) directionalLight.position.copy(ev.value);
      });
  }

  addCamera(camera, onUpdate) {
    const cameraFolder = this.pane.addFolder({ title: "Camera" });

    cameraFolder.addBinding(CONFIG.camera, "homePosition", {
      x: { min: -100, max: 100 },
      y: { min: -100, max: 100 },
      z: { min: 0, max: 200 },
    });
    cameraFolder
      .addBinding(CONFIG.camera, "fov", { min: 10, max: 120 })
      .on("change", (ev) => {
        if (camera) {
          camera.fov = ev.value;
          camera.updateProjectionMatrix();
        }
      });

    const museumFolder = cameraFolder.addFolder({ title: "Museum View" });
    museumFolder
      .addBinding(CONFIG.camera.museumView, "diveAngle", {
        min: 0,
        max: Math.PI / 2,
      })
      .on("change", () => {
        if (onUpdate) onUpdate();
      });
    museumFolder
      .addBinding(CONFIG.camera.museumView, "distance", { min: 1, max: 50 })
      .on("change", () => {
        if (onUpdate) onUpdate();
      });
  }

  addCameraDebug(camerasManager) {
    const folder = this.pane.addFolder({ title: "Debug Camera" });
    const PARAMS = { mode: camerasManager.cameraType };

    folder
      .addBinding(PARAMS, "mode", {
        options: {
          Default: "map",
          Debug: "debug",
        },
      })
      .on("change", (ev) => {
        camerasManager.setCameraType(ev.value);
      });
  }

  addPins() {
    const pinsFolder = this.pane.addFolder({ title: "Pins" });

    // pinsFolder.addBinding(CONFIG.pins, 'hoverDestinationZ', { min: 0, max: 50 });
    pinsFolder.addBinding(CONFIG.pins, "travelDestinationZ", {
      min: -50,
      max: 10,
    });
    pinsFolder.addBinding(CONFIG.pins.artworks, "travelOffsetY", {
      min: -10,
      max: 10,
    });
  }

  addExport() {
    this.pane
      .addButton({ title: "Export Config to Console" })
      .on("click", () => {
        console.log("--- UPDATED CONFIG ---");
        console.log(JSON.stringify(CONFIG, null, 2));
      });
  }
}
