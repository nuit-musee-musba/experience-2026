<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import { MapPlane } from '@/webgl/components/MapPlane.js';
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
const currentStep = ref(0);
let previousDestination = new THREE.Vector3();

const pinsGroup = new THREE.Group();

const allPins = [
  { name: 'Bordeaux', x: -30, y: 9, museums: [{ name: 'Musba', x: -30, y: 5, artworks: [{ name: 'oeuvre_1' }] }, { name: 'CAPC', x: -33, y: 8, artworks: [{ name: 'Fille a la perle' }] }] },
  { name: 'Paris', x: -20, y: 15, museums: [{ name: 'Orsay', x: -20, y: 12, artworks: [{ name: 'oeuvre_2' }] }, { name: 'Louvre', x: -23, y: 9, artworks: [{ name: 'Joconde' }] }] }
];

const createCircleTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.beginPath();
  ctx.arc(32, 32, 28, 0, 2 * Math.PI);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  return new THREE.CanvasTexture(canvas);
};

const circleTexture = createCircleTexture();

const addPin = (item) => {

  let geometry = null;
  let material = null;

  if(item.artworks) {
    geometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5 );
    material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

  } else {
    geometry = new THREE.SphereGeometry( 1, 32, 16 );
    material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
  }

  const pin = new THREE.Mesh( geometry, material );
  pin.userData = item;
  pin.position.set(item.x, item.y, -9.5);
  pin.name = 'marker';
  pinsGroup.add(pin);



};

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

  scene.add(pinsGroup);

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

  //controls.maxPolarAngle = Math.PI / 2 + 0.05;
  //controls.minPolarAngle = Math.PI / 2 - 0.05;

  controls.maxAzimuthAngle = 0.05;
  controls.minAzimuthAngle = -0.05;

  controls.zoomToCursor = false;
  controls.screenSpacePanning = true;

  camera.position.set(-5, 5, 50);
  controls.update();

  animate();
};

const renderLevel = (dataList) => {
  while (pinsGroup.children.length > 0) pinsGroup.remove(pinsGroup.children[0]);
  dataList.forEach(addPin);
};

const onMapClick = (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(pinsGroup.children, true);

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;
    const vector = new THREE.Vector3();
    clickedObject.getWorldPosition(vector);
    if (clickedObject.userData.museums) {
      previousDestination.copy(destinationCoordonates)
      currentStep.value = 1;
      destinationCoordonates.set(vector.x, vector.y, 6);
      lastCityMuseums = clickedObject.userData.museums;
    }
    if (clickedObject.userData.artworks) {
      previousDestination.copy(destinationCoordonates)
      currentStep.value = 2;
      destinationCoordonates.set(vector.x, vector.y - 2, -9);
      targetDestination.set(vector.x, vector.y, -9.5);
      isTraveling = true;
    }
    isZooming = true;
    if (clickedObject.userData.museums) renderLevel(clickedObject.userData.museums);
  }
};

const goBack = () => {
  if(currentStep.value === 1) {
    renderLevel(allPins);
    isZooming = true;
    destinationCoordonates.set(-5, 5, 50);
    currentStep.value = 0
  }

  if(currentStep.value === 2) {
    renderLevel(lastCityMuseums);
    isZooming = true;
    isTraveling = false;
    currentStep.value = 1;
    destinationCoordonates.set(previousDestination.x, previousDestination.y, previousDestination.z)
  }

}

const animate = () => {
  animationId = requestAnimationFrame(animate);
  if (isZooming) {
    camera.position.lerp(destinationCoordonates, 0.05);
    if (isTraveling) {
      controls.target.lerp(new THREE.Vector3(targetDestination.x, targetDestination.y, targetDestination.z), 0.05);
    } else {
      controls.target.lerp(new THREE.Vector3(destinationCoordonates.x, destinationCoordonates.y, -9.5), 0.05);
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
  allPins.forEach(addPin);
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
  <button v-show="currentStep > 0"  @click="goBack" class="back-button">Retour</button>
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