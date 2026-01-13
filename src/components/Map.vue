<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import * as THREE from 'three';
import { MapPlane } from '@/webgl/components/MapPlane.js';
import { GUI } from '@/webgl/utils/GUI.js';
import { Stats } from '@/webgl/utils/Stats.js';
import { MapPins } from '@/webgl/components/MapPins.js';

import { CamerasManager } from '@/webgl/managers/CamerasManagers.js';
import { CONFIG } from '@/config/webgl.js';
import all from '@/assets/world/all.svg?url';

const containerRef = ref(null);
let scene, camera, renderer, camerasManager, animationId, stats;
let mapPlane, ambientLight, directionalLight;
let isZooming = false;
let lastCityMuseums = null;
const destinationCoordonates = new THREE.Vector3();
const targetDestination = new THREE.Vector3();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let isTraveling = false;
const currentStep = ref(0);
const stepPositions = [];

const axesHelper = new THREE.AxesHelper(CONFIG.axesHelperSize);

let mapPins;

const allPins = [
  { name: 'Bordeaux', x: -30, y: 9, museums: [{ name: 'Musba', x: -30, y: 5, model3d: 'church.glb', artworks: [{ name: 'oeuvre_1' }] }, { name: 'CAPC', x: -33, y: 8, artworks: [{ name: 'Fille a la perle' }] }] },
  { name: 'Paris', x: -20, y: 15, museums: [{ name: 'Orsay', x: -20, y: 12, artworks: [{ name: 'oeuvre_2' }] }, { name: 'Louvre', x: -23, y: 9, artworks: [{ name: 'Joconde' }] }] }
];

const createCircleTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = CONFIG.pins.circleTextureSize;
  canvas.height = CONFIG.pins.circleTextureSize;
  const ctx = canvas.getContext('2d');
  ctx.beginPath();
  ctx.arc(32, 32, CONFIG.pins.circleRadius, 0, 2 * Math.PI);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  return new THREE.CanvasTexture(canvas);
};

const circleTexture = createCircleTexture();

const addPin = (item) => {

  let geometry = null;
  let material = null;

  if (item.artworks) {
    geometry = new THREE.BoxGeometry(...CONFIG.pins.artworks.geometrySizes);
    material = new THREE.MeshBasicMaterial({ color: CONFIG.colors.pinGreen });

  } else {
    geometry = new THREE.SphereGeometry(CONFIG.pins.museums.sphereRadius, CONFIG.pins.museums.sphereWidthSegments, CONFIG.pins.museums.sphereHeightSegments);
    material = new THREE.MeshBasicMaterial({ color: CONFIG.colors.pinYellow });
  }

  const pin = new THREE.Mesh(geometry, material);
  pin.userData = item;
  pin.position.set(item.x, item.y, CONFIG.pins.defaultZ);
  pin.name = 'marker';
  pinsGroup.add(pin);

};

const initThree = () => {
  if (!containerRef.value) return;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(CONFIG.colors.background);
  scene.add(axesHelper);


  camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, containerRef.value.clientWidth / containerRef.value.clientHeight, CONFIG.camera.near, CONFIG.camera.far);
  // camera.position.set(-5, 5, 50);
  // camera.position.set(0, 50, 50);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight);
  renderer.setPixelRatio(1);
  containerRef.value.appendChild(renderer.domElement);

  stats = new Stats(containerRef.value);

  mapPlane = new MapPlane(scene, all, CONFIG.mapPlane.width, CONFIG.mapPlane.height);
  mapPlane.plane.rotation.x = CONFIG.mapPlane.planeRotationX;
  mapPlane.plane.position.z = CONFIG.mapPlane.planePositionZ;

  mapPins = new MapPins(scene);

  ambientLight = new THREE.AmbientLight(CONFIG.colors.ambientLight, CONFIG.lights.ambientIntensity);
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight(CONFIG.colors.directionalLight, CONFIG.lights.directionalIntensity);
  directionalLight.position.copy(CONFIG.lights.directionalPosition);
  scene.add(directionalLight);

  camerasManager = new CamerasManager(camera, renderer.domElement, 'map');
  camerasManager.controls.target.set(0, 0, 0);

  // camera.position.set(-5, 5, 50);
  // camera.position.set(0, 50, 50);
  camera.position.copy(CONFIG.camera.initialPosition);
  camerasManager.update();
  animate();
  window['__CAMERA_POS__'] = camera.position;
};

const renderLevel = (dataList) => {
  mapPins.renderLevel(dataList);
};

const onMapClick = (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(mapPins.getPins(), true);

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;
    const vector = new THREE.Vector3();
    clickedObject.getWorldPosition(vector);
    if (clickedObject.userData.museums) {
      stepPositions.push(camera.position.clone()); // Save current position
      currentStep.value = 1;
      destinationCoordonates.set(vector.x, vector.y + CONFIG.pins.museums.hoverOffsetY, CONFIG.pins.museums.hoverZ);
      lastCityMuseums = clickedObject.userData.museums;
    }
    if (clickedObject.userData.artworks) {
      stepPositions.push(camera.position.clone()); // Save current position
      destinationCoordonates.set(vector.x, vector.y + CONFIG.pins.artworks.travelOffsetY, CONFIG.pins.travelDestinationZ);
      targetDestination.set(vector.x, vector.y, CONFIG.pins.defaultZ);
      currentStep.value = 2;
      isTraveling = true;
    }
    isZooming = true;
    camerasManager.setEnabled(false);
    if (clickedObject.userData.museums) renderLevel(clickedObject.userData.museums);
  }
};

const goBack = () => {
  if (stepPositions.length > 0) {
    const previousPos = stepPositions.pop();
    destinationCoordonates.copy(previousPos);
    isZooming = true;
    camerasManager.setEnabled(false);

    if (currentStep.value === 1) {
      renderLevel(allPins);
      currentStep.value = 0;
    } else if (currentStep.value === 2) {
      renderLevel(lastCityMuseums);
      isTraveling = false;
      currentStep.value = 1;
    }
  }
}

const animate = () => {
  stats.begin();
  animationId = requestAnimationFrame(animate);

  if (isZooming) {
    // Interpolation de la position
    camera.position.lerp(destinationCoordonates, CONFIG.camera.zoomLerpFactor);

    // Interpolation de la cible (target)
    const target = isTraveling ? targetDestination : new THREE.Vector3(destinationCoordonates.x, destinationCoordonates.y, CONFIG.pins.defaultZ);
    camerasManager.controls.target.lerp(target, CONFIG.camera.zoomLerpFactor);

    // CONDITION DE SORTIE : Si on est très proche de la destination
    if (camera.position.distanceTo(destinationCoordonates) < 0.1) {
      camera.position.copy(destinationCoordonates);
      isZooming = false;
      camerasManager.setEnabled(true);
      console.log('Arrivé à destination');
    }
  }

  camerasManager.update();
  renderer.render(scene, camera);

  stats.end();
};

const handleResize = () => {
  if (!containerRef.value) return;
  camera.aspect = containerRef.value.clientWidth / containerRef.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight);
};

const initDebug = () => {
  const gui = new GUI();
  gui.addMap(mapPlane);
  gui.addLights(ambientLight, directionalLight);
  gui.addCamera(camera);
  gui.addPins();
  gui.addExport();
};

watch(currentStep, (val) => {
  console.log('Watcher triggered! New step:', val, 'CamerasManager:', !!camerasManager);
  if (!camerasManager) {
    console.error('CamerasManager is missing!');
    return;
  }
  if (val === 2) {
    console.log('Switching to orbit controls');
    camerasManager.setCameraType('orbit', targetDestination);
  } else {
    console.log('Switching to map controls');
    camerasManager.setCameraType('map');
  }
});


onMounted(() => {
  initThree();
  mapPins.renderLevel(allPins);
  window.addEventListener('click', onMapClick);
  window.addEventListener('resize', handleResize);
  initDebug();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('click', onMapClick);
  cancelAnimationFrame(animationId);
  if (renderer) renderer.dispose();
});
</script>

<template>
  <div ref="containerRef" class="scene-container"></div>
  <button @click="goBack" class="back-button">Retour</button>
</template>

<style scoped>
.scene-container {
  width: 100%;
  height: 100vh;
  outline: none;
}

.back-button {
  position: fixed;
  right: 20px;
  top: 20px;
  z-index: 10000;
  background: white;
  color: black;
  border: 1px solid #ccc;
  padding: 12px 24px;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  font-weight: bold;
}
</style>