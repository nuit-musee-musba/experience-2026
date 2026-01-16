import { Pane } from "tweakpane";
import { CONFIG } from "@/config/webgl.js";

export class GUI {
  constructor() {
    this.pane = new Pane({ title: "Experience Config", expanded: false });
  }

  addMap(mapPlane) {
    const mapFolder = this.pane.addFolder({ title: "Map" });

    mapFolder
      .addBinding(CONFIG.mapPlane, "correction", {
        x: { min: -500, max: 500 },
        y: { min: -500, max: 500 },
        z: { min: -500, max: 500 },
      })
      .on("change", () => {
        if (mapPlane) mapPlane.update();
      });

    mapFolder
      .addBinding(CONFIG.mapPlane, "planePositionZ", { min: -1000, max: 0 })
      .on("change", () => {
        if (mapPlane) mapPlane.update();
      });
    mapFolder
      .addBinding(CONFIG.mapPlane, "planeRotationX", {
        min: -Math.PI,
        max: Math.PI,
      })
      .on("change", () => {
        if (mapPlane) mapPlane.update();
      });
    mapFolder
      .addBinding(CONFIG.mapPlane, "backgroundZ", { min: -100, max: 10 })
      .on("change", () => {
        if (mapPlane) mapPlane.update();
      });
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

  addCamera(camera) {
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
  addDebug(callback) {
    const debugFolder = this.pane.addFolder({ title: "Debug" });

    const params = {
      debugCamera: false,
    };

    debugFolder.addBinding(params, "debugCamera").on("change", (ev) => {
      callback(ev.value);
    });
  }
}
