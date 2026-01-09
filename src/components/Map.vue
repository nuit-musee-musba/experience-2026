<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import { MapPlane } from '@/webgl/components/MapPlane.js';
import { MapPins } from '@/webgl/components/MapPins.js';
import all from '@/assets/world/all.svg';

const containerRef = ref(null);
let scene, camera, renderer, controls, animationId;
let isZooming = false;
let lastCityMuseums = null;
const destinationCoordonates = new THREE.Vector3();
const targetDestination = new THREE.Vector3();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let isTraveling = false;
let currentStep = 0;

let mapPins;

const allPins = [
  { name: 'Bordeaux', x: -30, y: 9, museums: [{ name: 'Musba', x: -30, y: 5, model3d: 'church.glb', artworks: [{ name: 'oeuvre_1' }] }, { name: 'CAPC', x: -33, y: 8, artworks: [{ name: 'Fille a la perle' }] }] },
  { name: 'Paris', x: -20, y: 15, museums: [{ name: 'Orsay', x: -20, y: 12, artworks: [{ name: 'oeuvre_2' }] }, { name: 'Louvre', x: -23, y: 9, artworks: [{ name: 'Joconde' }] }] }
];

const initThree = () => {
  if (!containerRef.value) return;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  camera = new THREE.PerspectiveCamera(75, containerRef.value.clientWidth / containerRef.value.clientHeight, 0.1, 10000);
  camera.position.set(-5, 5, 50);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight);
  renderer.setPixelRatio(1);
  containerRef.value.appendChild(renderer.domElement);

  const mapPlane = new MapPlane(scene, all, 1000, 700);
  mapPlane.plane.position.z = -10;

  mapPins = new MapPins(scene);

  const ambientLight = new THREE.AmbientLight(0xf0f0f0, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xf0f0f0, 1);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  controls = new MapControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;

  controls.minDistance = 0;
  controls.maxDistance = 130;

  controls.maxAzimuthAngle = 0.05;
  controls.minAzimuthAngle = -0.05;

  controls.zoomToCursor = false;
  controls.screenSpacePanning = true;

  camera.position.set(-5, 5, 50);
  controls.update();

  animate();
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
      currentStep = 1;
      destinationCoordonates.set(vector.x, vector.y, 6);
      lastCityMuseums = clickedObject.userData.museums;
    }
    if (clickedObject.userData.artworks) {
      currentStep = 2;
      destinationCoordonates.set(vector.x, vector.y - 5, -4);
      targetDestination.set(vector.x, vector.y, -6.5);
      isTraveling = true;
    }
    isZooming = true;
    if (clickedObject.userData.museums) renderLevel(clickedObject.userData.museums);
  }
};

const goBack = () => {
  if (currentStep === 1) {
    renderLevel(lastCityMuseums);
    isZooming = true;
    isTraveling = false;
  }

  if (currentStep === 2) {
    renderLevel(allPins);
    isZooming = true;
    destinationCoordonates.set(-5, 5, 50);
  }

}

const animate = () => {
  animationId = requestAnimationFrame(animate);
  if (isZooming) {
    camera.position.lerp(destinationCoordonates, 0.05);
    if (isTraveling) {
      controls.target.lerp(new THREE.Vector3(targetDestination.x, targetDestination.y, targetDestination.z), 0.05);
    } else {
      controls.target.lerp(new THREE.Vector3(destinationCoordonates.x, destinationCoordonates.y, 0), 0.05);
    }

  }
  controls.update();
  renderer.render(scene, camera);
};

const handleResize = () => {
  if (!containerRef.value) return;
  camera.aspect = containerRef.value.clientWidth / containerRef.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight);
};

onMounted(() => {
  initThree();
  mapPins.renderLevel(allPins);
  window.addEventListener('click', onMapClick);
  window.addEventListener('resize', handleResize);
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
  z-index: 999;
  background: white;
  padding: 12px 24px;
}
</style>