<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import * as THREE from 'three';
import { CamerasManager } from '@/webgl/managers/CamerasManagers.js';
import { MapPlane } from '@/webgl/components/MapPlane.js';
import { Map3D } from '@/webgl/components/Map3D.js';
import { MapPins } from '@/webgl/components/MapPins.js';
import { CONFIG } from '@/config/webgl.js';
import all from '@/assets/world/all.svg?url';
import BaseButton from '@/components/buttons/Button.vue';
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";
import { allData } from '@/store.js';
import { GUI } from '@/webgl/utils/GUI.js';
import { Stats } from '@/webgl/utils/Stats.js';

const route = useRoute()
const router = useRouter();
const containerRef = ref(null);
let scene, camera, renderer, camerasManager, animationId, stats;
let mapPlane, ambientLight, directionalLight;
let map3D;
let isZooming = false;
const activeCitySlug = ref(null);
const destinationCoordonates = new THREE.Vector3();
const targetDestination = new THREE.Vector3();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let isTraveling = false;
const currentStep = ref(0);

let mapPins;

watch([() => route.params, allData], ([params, data]) => {
  if (!data) return;
  if (params.citySlug && params.museumSlug) {
    const city = data.find(v => v.slug === params.citySlug);
    const museum = city?.museums.find(m => m.slug === params.museumSlug);

    if (museum) {
      destinationCoordonates.set(museum.x, museum.y - 2, -9);
      targetDestination.set(museum.x, museum.y, -9.5);
      isTraveling = true;
      isZooming = true;
      currentStep.value = 2;
      camerasManager?.setCameraType('orbit', targetDestination);
    }
  }
  else if (params.citySlug) {
    const city = data.find(v => v.slug === params.citySlug);
    if (city) {
      destinationCoordonates.set(city.x, city.y, 6);
      renderLevel(city.museums);
      isTraveling = false;
      isZooming = true;
      currentStep.value = 1;
      activeCitySlug.value = city.slug;
      camerasManager?.setCameraType('map');
    }
  }
  else {
    destinationCoordonates.set(-5, 5, 50);
    renderLevel(data);
    isTraveling = false;
    isZooming = true;
    currentStep.value = 0;
    camerasManager?.setCameraType('map');
  }
}, { immediate: true, deep: true });

async function ShowInfo() {
  const response = await fetch("/content/content.json");
  const content = await response.json();
  return content;
}

let allPins = null;



const initThree = () => {
  if (!containerRef.value) return;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(CONFIG.colors.background);

  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, containerRef.value.clientWidth / containerRef.value.clientHeight, CONFIG.camera.near, CONFIG.camera.far);
  camera.position.copy(CONFIG.camera.homePosition);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight);
  renderer.setPixelRatio(1);
  containerRef.value.appendChild(renderer.domElement);

  stats = new Stats(containerRef.value);


  mapPlane = new MapPlane(scene, all, CONFIG.mapPlane.width, CONFIG.mapPlane.height);

  mapPins = new MapPins(scene);

  ambientLight = new THREE.AmbientLight(CONFIG.colors.ambientLight, CONFIG.lights.ambientIntensity);
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight(CONFIG.colors.directionalLight, CONFIG.lights.directionalIntensity);
  directionalLight.position.copy(CONFIG.lights.directionalPosition);
  scene.add(directionalLight);

  camerasManager = new CamerasManager(camera, renderer.domElement, 'map');
  camera.position.copy(CONFIG.camera.homePosition);

  map3D = new Map3D(scene);

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
      router.push(`/map/${clickedObject.userData.slug}`);
    }
    if (clickedObject.userData.artworks) {
      router.push(`/map/${activeCitySlug.value}/${clickedObject.userData.slug}`);
    }
  } else {
    // Check for 3D map interactables
    if (!map3D) return;
    const interactables = map3D.getInteractables();
    if (interactables && interactables.length > 0) {
      const intersects3D = raycaster.intersectObjects(interactables, true);
      if (intersects3D.length > 0) {
        const clicked3D = intersects3D[0].object;
        if (clicked3D.userData.type === 'city') {
          router.push(`/map/${clicked3D.userData.slug}`);

        }
      }
    }
  }
};

const goBack = () => {
  if (currentStep.value === 1) {
    router.push(`/map`);
  }
  if (currentStep.value === 2) {
    router.push(`/map/${activeCitySlug.value}`);
  }
  if (currentStep.value === 0) {
    router.push(`/`);
  }
}

const animate = () => {
  stats.begin();
  animationId = requestAnimationFrame(animate);
  if (isZooming) {
    camera.position.lerp(destinationCoordonates, 0.05);
    if (isTraveling && camerasManager.controls) {
      camerasManager.controls.target.lerp(new THREE.Vector3(targetDestination.x, targetDestination.y, targetDestination.z), 0.05);
    } else if (camerasManager.controls) {
      camerasManager.controls.target.lerp(new THREE.Vector3(destinationCoordonates.x, destinationCoordonates.y, -9.5), 0.05);
    }
  }

  if (camera.position.distanceTo(destinationCoordonates) < 0.1) {
    isZooming = false;
    camerasManager.update();
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


onMounted(async () => {
  initThree();
  allPins = await ShowInfo();
  allData.value = allPins;
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
  <BaseButton v-show="currentStep > 0" @click="goBack" variant="black" class="back-button">
    Retour
  </BaseButton>
  <router-view></router-view>
</template>

<style lang="scss" scoped>
@use "@/styles/colors.scss" as *;

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
}
</style>