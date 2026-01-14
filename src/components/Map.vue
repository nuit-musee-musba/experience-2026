<script setup>
import { onMounted, onBeforeUnmount, ref, watch, computed } from 'vue';

import * as THREE from 'three';
import { CamerasManager } from '@/webgl/managers/CamerasManagers.js';
import { Map3D } from '@/webgl/components/Map3D.js';
import { MapPlane } from '@/webgl/components/MapPlane.js';
import all from '@/assets/world/all.svg?url';
import { MapPins } from '@/webgl/components/MapPins.js';
import { CONFIG } from '@/config/webgl.js';
import BaseButton from '@/components/buttons/Button.vue';
import { useRouter, useRoute } from "vue-router";
import { allData } from '@/store.js';
import { Stats } from '@/webgl/utils/Stats.js';
import { GUI } from '@/webgl/utils/GUI.js';

const route = useRoute();
const router = useRouter();
const isArtworkActive = computed(() => {
  return route.name === 'artwork-detail';
});

const containerRef = ref(null);
const props = defineProps(['path']);

let scene, camera, renderer, animationId, stats;
let map3D, mapPlane, ambientLight, directionalLight, mapPins, gui, camerasManager;
let allPins = null;

let isZooming = false;
let isTraveling = false;
const currentStep = ref(0);
const activeCitySlug = ref(null);

const destinationCoordonates = new THREE.Vector3();
const targetDestination = new THREE.Vector3();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

watch([() => route.params, allData], ([params, data]) => {
  if (!data || !camerasManager) return;

  if (params.citySlug && params.museumSlug) {
    const city = data.find(v => v.slug === params.citySlug);
    const museum = city?.museums.find(m => m.slug === params.museumSlug);

    if (museum) {
      targetDestination.set(museum.x, museum.y, -9.5);
      const distance = 7;
      const diveAngle = Math.PI / 3;

      const offsetZ = distance * Math.cos(diveAngle);
      const offsetY = distance * Math.sin(diveAngle);

      destinationCoordonates.set(
        museum.x,
        museum.y - offsetY,
        -9.5 + offsetZ
      );

      camerasManager.controls.minAzimuthAngle = -Infinity;
      camerasManager.controls.maxAzimuthAngle = Infinity;
      camerasManager.controls.minPolarAngle = 0;
      camerasManager.controls.maxPolarAngle = Math.PI;

      isTraveling = true;
      isZooming = true;
      currentStep.value = 2;
    }
  }
  else if (params.citySlug) {
    const city = data.find(v => v.slug === params.citySlug);
    if (city) {
      destinationCoordonates.set(city.x, city.y, 6);
      targetDestination.set(city.x, city.y, -9.5);
      resetMapControls();
      renderLevel(city.museums);
      isTraveling = false;
      isZooming = true;
      currentStep.value = 1;
      activeCitySlug.value = city.slug;
    }
  }
  else {
    destinationCoordonates.set(-5, 5, 50);
    targetDestination.set(-5, 5, -9.5);
    resetMapControls();
    renderLevel(data);
    isTraveling = false;
    isZooming = true;
    currentStep.value = 0;
  }
}, { immediate: true, deep: true });

const resetMapControls = () => {
  if (!camerasManager || !camerasManager.controls) return;
  camerasManager.controls.minAzimuthAngle = CONFIG.controls.map.minAzimuthAngle;
  camerasManager.controls.maxAzimuthAngle = CONFIG.controls.map.maxAzimuthAngle;
  camerasManager.controls.minPolarAngle = 0;
  camerasManager.controls.maxPolarAngle = Math.PI / 2;
};

const initThree = () => {
  if (!containerRef.value) return;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(CONFIG.colors.background);

  camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, containerRef.value.clientWidth / containerRef.value.clientHeight, CONFIG.camera.near, CONFIG.camera.far);
  camera.up.set(0, 0, 1);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight);
  renderer.setPixelRatio(1);
  containerRef.value.appendChild(renderer.domElement);

  stats = new Stats(containerRef.value);
  gui = new GUI(containerRef.value);
  mapPlane = new MapPlane(scene, all, CONFIG.mapPlane.width, CONFIG.mapPlane.height);
  map3D = new Map3D(scene);
  gui.addMap(map3D);
  mapPins = new MapPins(scene);

  scene.add(new THREE.AmbientLight(CONFIG.colors.ambientLight, CONFIG.lights.ambientIntensity));
  const dirLight = new THREE.DirectionalLight(CONFIG.colors.directionalLight, CONFIG.lights.directionalIntensity);
  dirLight.position.copy(CONFIG.lights.directionalPosition);
  scene.add(dirLight);

  camerasManager = new CamerasManager(camera, renderer.domElement, 'map');
  gui.addCameraDebug(camerasManager);

  resetMapControls();
  camera.position.copy(CONFIG.camera.homePosition);
  animate();
};

const animate = () => {
  stats.begin();
  animationId = requestAnimationFrame(animate);

  if (isZooming && camerasManager.controls) {
    camera.position.lerp(destinationCoordonates, 0.07);
    camerasManager.controls.target.lerp(targetDestination, 0.07);
    const dist = camera.position.distanceTo(destinationCoordonates);
    if (dist < 0.01) {
      isZooming = false;

      if (currentStep.value === 2) {
        const diveAngle = Math.PI / 3;
        camerasManager.controls.minPolarAngle = diveAngle;
        camerasManager.controls.maxPolarAngle = diveAngle;
      }
    }
  }

  camerasManager.update();
  renderer.render(scene, camera);
  stats.end();
};

const renderLevel = (dataList) => {
  if (mapPins && dataList) mapPins.renderLevel(dataList);
};

const onMapClick = (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(mapPins.getPins(), true);
  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;
    if (clickedObject.userData.museums) router.push(`/${clickedObject.userData.slug}`);
    else if (clickedObject.userData.artworks) router.push(`/${activeCitySlug.value}/${clickedObject.userData.slug}`);
  }
};

const goBack = () => {
  if (currentStep.value === 1) router.push(`/`);
  else if (currentStep.value === 2) router.push(`/${activeCitySlug.value}`);
  else router.push(`/`);
};

const handleResize = () => {
  if (!containerRef.value) return;
  camera.aspect = containerRef.value.clientWidth / containerRef.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight);
};

onMounted(async () => {
  initThree();
  const response = await fetch("/public/content/content.json");
  allPins = await response.json();
  allData.value = allPins.data;
  renderLevel(allPins.data);
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
  <div ref="containerRef" class="scene-container" :class="{ 'map-frozen': isArtworkActive }"></div>

  <BaseButton v-show="currentStep > 0" @click="goBack" variant="black" class="back-button">
    Retour
  </BaseButton>
  <router-view></router-view>
</template>

<style lang="scss" scoped>
.scene-container {
  width: 100%;
  height: 100vh;
  outline: none;

  &.map-frozen {
    pointer-events: none;
  }
}


.back-button {
  position: fixed;
  right: 20px;
  top:
    20px;
  z-index: 999;
}
</style>