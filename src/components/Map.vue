<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

const containerRef = ref(null);
let scene, camera, renderer, controls, animationId;
let isZooming = false;
const destinationCoordonates = new THREE.Vector3();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// INITIALISATION IMMÉDIATE pour éviter le "undefined"
const pinsGroup = new THREE.Group();
const mapGroup = new THREE.Group();
const plane = new THREE.Group();

const allPins = [
  { name: 'Bordeaux', x: -30, y: 9, museums: [{ name: 'Musba', x: -30, y: 5, artworks: [{name: 'oeuvre_1'}] }, { name: 'CAPC', x: -30, y: 6 }] },
  { name: 'Paris', x: -20, y: 15, museums: [{ name: 'Orsay', x: -30, y: 5, artworks: [{name: 'oeuvre_2'}] }, { name: 'Louvre', x: -30, y: 6 }] }
];

const addPin = (item) => {
  const geometry = new THREE.SphereGeometry(1, 32, 16);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const pin = new THREE.Mesh(geometry, material);
  pin.userData = item;
  pin.position.set(item.x, item.y, 2);
  pin.name = 'marker';
  pinsGroup.add(pin);
};

const renderLevel = (dataList) => {
  while(pinsGroup.children.length > 0) pinsGroup.remove(pinsGroup.children[0]);
  dataList.forEach(addPin);
};

const initThree = () => {
  if (!containerRef.value) return;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  camera = new THREE.PerspectiveCamera(75, containerRef.value.clientWidth / containerRef.value.clientHeight, 0.1, 10000);
  camera.position.set(-5, 5, 50);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  containerRef.value.appendChild(renderer.domElement);

  // Montage de la hiérarchie
  scene.add(pinsGroup);
  scene.add(plane);
  plane.add(mapGroup);

  const loader = new SVGLoader();
  loader.load('/src/assets/world/all.svg', (data) => {
    const paths = data.paths;
    const group = new THREE.Group();
    group.scale.y = -1;

    paths.forEach((path, i) => {
      const material = new THREE.MeshBasicMaterial({
        color: [239, 73, 190].includes(i) ? 0xa9a9a9 : path.color,
        side: THREE.DoubleSide
      });
      const shapes = SVGLoader.createShapes(path);
      shapes.forEach(shape => {
        const geometry = new THREE.ShapeGeometry(shape);
        group.add(new THREE.Mesh(geometry, material));
      });
    });
    mapGroup.add(group);
  });

  const ambientLight = new THREE.AmbientLight(0xf0f0f0, 0.8);
  scene.add(ambientLight);

  controls = new MapControls(camera, renderer.domElement);
  controls.enableDamping = true;

  animate();
};

const onMapClick = (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(pinsGroup.children, true);

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;
    destinationCoordonates.set(clickedObject.position.x, clickedObject.position.y, 15);
    isZooming = true;
    if (clickedObject.userData.museums) renderLevel(clickedObject.userData.museums);
  }
};

const animate = () => {
  animationId = requestAnimationFrame(animate);
  if (isZooming) {
    camera.position.lerp(destinationCoordonates, 0.05);
    controls.target.lerp(new THREE.Vector3(destinationCoordonates.x, destinationCoordonates.y, 0), 0.05);
    if (camera.position.distanceTo(destinationCoordonates) < 0.5) isZooming = false;
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
</template>

<style scoped>
.scene-container {
  width: 100%;
  height: 100vh;
  outline: none;
}
</style>