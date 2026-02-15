<script setup>
import { onMounted, onBeforeUnmount, ref, watch, computed } from 'vue';
import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import SmartNavbar from "@/components/layouts/SmartNavbar.vue";
import { MapPlane } from '@/webgl/components/MapPlane.js';
import { MapPins } from '@/webgl/components/MapPins.js';
import { GUI } from '@/webgl/utils/GUI.js';
import { CONFIG } from '@/config/webgl.js';

import { useRouter, useRoute } from "vue-router";
import { allData } from '@/store.js';
import { Stats } from '@/webgl/utils/Stats.js';
import { firstFingerOfEvent } from '@/utils/touch/touch';
import BaseFrame from "@/components/layouts/BaseFrame.vue";
import IconArrowLeft from "@/components/icons/IconArrowLeft.vue";
import IconArrowRight from "@/components/icons/IconArrowRight.vue";

const route = useRoute();
const router = useRouter();
const isArtworkActive = computed(() => route.name === 'artwork-detail');

const containerRef = ref(null);
const props = defineProps(['path']);

let scene, camera, renderer, labelRenderer, controls, animationId, stats, gui;
let mapPins;
let allPins = null;
let mapPlane = null;
let isZooming = false;
let isTraveling = false;
const currentStep = ref(-1);
const activeCitySlug = ref(null);
const activeContinentSlug = ref('europe');

const destinationCoordonates = new THREE.Vector3();
const targetDestination = new THREE.Vector3();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// Positions de caméra pour chaque continent
const continentPositions = {
  europe: { camera: new THREE.Vector3(-5, 5, 50), target: new THREE.Vector3(-5, 5, -9.5) },
  amérique: { camera: new THREE.Vector3(-220, -16, 70), target: new THREE.Vector3(-220, -16, -9.5) },
  océan: { camera: new THREE.Vector3(50, -30, 50), target: new THREE.Vector3(50, -30, -9.5) }
};

watch([() => route.params, allData], ([params, data]) => {
  if (!data || !controls) return;

  const continentSlug = params.continentSlug || 'europe';
  activeContinentSlug.value = continentSlug;

  if (params.citySlug) {
    activeCitySlug.value = params.citySlug;
  }

  resetMapControls();

  const continent = data.find(c => c.Name.toLowerCase() === continentSlug);

  if (!continent) {
    console.warn('Continent non trouvé:', continentSlug);
    return;
  }

  if (params.citySlug && params.museumSlug) {
    // Niveau 2 : Vue musée
    const city = continent.cities.find(v => v.slug === params.citySlug);
    const museum = city?.museums.find(m => m.slug === params.museumSlug);

    if (museum) {
      targetDestination.set(museum.x, museum.y, -10.5);
      const width = containerRef.value.clientWidth;
      const height = containerRef.value.clientHeight;
      camera.setViewOffset(width, height, -width * 0.25, 0, width, height);

      const distance = 7;
      const diveAngle = Math.PI / 3;
      destinationCoordonates.set(
          museum.x,
          museum.y - (distance * Math.sin(diveAngle)),
          -9.5 + (distance * Math.cos(diveAngle))
      );

      controls.minAzimuthAngle = -Infinity;
      controls.maxAzimuthAngle = Infinity;
      controls.minPolarAngle = 0;
      controls.maxPolarAngle = Math.PI;

      renderLevel(city.museums);

      isTraveling = true;
      isZooming = true;
      currentStep.value = 2;
    }
  }
  else if (params.citySlug) {
    // Niveau 1 : Vue ville
    const city = continent.cities.find(v => v.slug === params.citySlug);
    if (city) {
      destinationCoordonates.set(city.x, city.y, -5);
      targetDestination.set(city.x, city.y, -9.5);
      renderLevel(city.museums);
      isTraveling = false;
      isZooming = true;
      currentStep.value = 1;
      activeCitySlug.value = city.slug;
    }
  }
  else if (params.continentSlug) {
    // Niveau 0 : Vue villes du continent
    const continentPos = continentPositions[continentSlug] || continentPositions.europe;
    destinationCoordonates.copy(continentPos.camera);
    targetDestination.copy(continentPos.target);
    renderLevel(continent.cities);
    isTraveling = false;
    isZooming = true;
    currentStep.value = 0;
  }
  else {
    // Vue par défaut sur Europe
    const continentPos = continentPositions.europe;
    destinationCoordonates.copy(continentPos.camera);
    targetDestination.copy(continentPos.target);

    const europeContinent = data.find(c => c.Name.toLowerCase() === 'europe');
    if (europeContinent) {
      renderLevel(europeContinent.cities);
    }

    isTraveling = false;
    isZooming = true;
    currentStep.value = 0;
  }
}, { immediate: true });

const resetMapControls = () => {
  if (!controls) return;
  if (camera) camera.clearViewOffset();

  controls.minAzimuthAngle = CONFIG.controls.map.minAzimuthAngle;
  controls.maxAzimuthAngle = CONFIG.controls.map.maxAzimuthAngle;
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI / 2;
  controls.minDistance = 0;
  controls.maxDistance = Infinity;
};

const handlePinClick = (item) => {
  const continent = route.params.continentSlug || activeContinentSlug.value;
  const city = route.params.citySlug || activeCitySlug.value;

  if (item.museums) {
    router.push(`/${continent}/${item.slug}`);
  }
  else if (item.artworks) {
    if (city) {
      router.push(`/${continent}/${city}/${item.slug}`);
    }
  }
};

const navigateToContinent = (continentSlug) => {
  router.push(`/${continentSlug}`);
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

  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  labelRenderer.domElement.style.pointerEvents = 'none';
  containerRef.value.appendChild(labelRenderer.domElement);

  stats = new Stats(containerRef.value);
  mapPlane = new MapPlane(scene);
  gui = new GUI();
  gui.addMap(mapPlane);
  mapPins = new MapPins(scene, handlePinClick);

  scene.add(new THREE.AmbientLight(CONFIG.colors.ambientLight, CONFIG.lights.ambientIntensity));
  const dirLight = new THREE.DirectionalLight(CONFIG.colors.directionalLight, CONFIG.lights.directionalIntensity);
  dirLight.position.copy(CONFIG.lights.directionalPosition);
  scene.add(dirLight);

  controls = new MapControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = true;

  // DÉSACTIVER LE ZOOM
  controls.enableZoom = false;

  // Permettre la rotation
  controls.enableRotate = true;

  resetMapControls();

  const europePos = continentPositions.europe;
  camera.position.copy(europePos.camera);
  controls.target.copy(europePos.target);

  animate();
};

const animate = () => {
  animationId = requestAnimationFrame(animate);

  if (isArtworkActive.value) {
    return;
  }

  stats.begin();

  let needsUpdate = false;

  if (isZooming) {
    camera.position.lerp(destinationCoordonates, 0.07);
    controls.target.lerp(targetDestination, 0.07);
    needsUpdate = true;

    if (camera.position.distanceTo(destinationCoordonates) < 0.01) {
      isZooming = false;
      applyStepConstraints();
    }
  } else {
    if (controls.update()) {
      needsUpdate = true;
    }

    // Garder le target centré
    if (controls.target.distanceTo(targetDestination) > 0.01) {
      controls.target.lerp(targetDestination, 0.05);
      needsUpdate = true;
    }

    // Correction du drift : maintenir la distance au niveau musée
    if (currentStep.value === 2) {
      const targetDistance = 7; // Distance définie dans le watch
      const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
      const currentDistance = offset.length();

      if (Math.abs(currentDistance - targetDistance) > 0.1) {
        offset.setLength(targetDistance);
        camera.position.copy(controls.target).add(offset);
        needsUpdate = true;
      }
    }
  }

  if (needsUpdate || isZooming) {
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  }

  stats.end();
};

const applyStepConstraints = () => {
  if (currentStep.value === 2) {
    // Vue musée : permettre rotation libre
    controls.minPolarAngle = controls.maxPolarAngle = Math.PI / 3;
  } else {
    // Vue ville/continent : limiter l'angle
    controls.maxPolarAngle = 0;
  }
};

const renderLevel = (dataList) => {
  if (mapPins && dataList) mapPins.renderLevel(dataList);
};

const onMapClick = (event) => {
  let clientX, clientY;
  if (window.TouchEvent && event instanceof TouchEvent) {
    const finger = firstFingerOfEvent(event);
    if (!finger) return;
    clientX = finger.clientX;
    clientY = finger.clientY;
  } else {
    clientX = event.clientX;
    clientY = event.clientY;
  }

  pointer.x = (clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  const interactables = [...mapPins.getPins()];
  const intersects = raycaster.intersectObjects(interactables, true);

  if (intersects.length > 0) {
    if (event.cancelable) event.preventDefault();
    const clickedObject = intersects[0].object;
    const continent = route.params.continentSlug || activeContinentSlug.value;

    if (clickedObject.userData.museums) {
      router.push(`/${continent}/${clickedObject.userData.slug}`);
    }
    else if (clickedObject.userData.artworks) {
      router.push(`/${activeContinentSlug.value}/${activeCitySlug.value}/${clickedObject.userData.slug}`);
    }
    else if (clickedObject.userData.type === 'city') {
      router.push(`/${continent}/${clickedObject.userData.slug}`);
    }
  }
};

const handleResize = () => {
  if (!containerRef.value) return;
  const width = containerRef.value.clientWidth;
  const height = containerRef.value.clientHeight;
  camera.aspect = width / height;
  if (currentStep.value === 2) camera.setViewOffset(width, height, -width * 0.25, 0, width, height);
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  labelRenderer.setSize(width, height);
};

onMounted(async () => {
  initThree();
  const response = await fetch("/content/content.json");
  allPins = await response.json();
  allData.value = allPins.data;

  const europeContinent = allPins.data.find(c => c.Name.toLowerCase() === 'europe');
  if (europeContinent) {
    renderLevel(europeContinent.cities);
  }

  if (containerRef.value) {
    containerRef.value.addEventListener('click', onMapClick);
    containerRef.value.addEventListener('touchstart', onMapClick, { passive: false });
  }
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  if (containerRef.value) {
    containerRef.value.removeEventListener('click', onMapClick);
    containerRef.value.removeEventListener('touchstart', onMapClick);
  }
  cancelAnimationFrame(animationId);
  if (renderer) renderer.dispose();
  if (gui) gui.destroy();
  if (labelRenderer && labelRenderer.domElement) labelRenderer.domElement.remove();
});

defineExpose({
  navigateToContinent
});
</script>

<template>
  <div ref="containerRef" class="scene-container" :class="{ 'map-frozen': isArtworkActive }"></div>

  <button
      @click="navigateToContinent('europe')"
      class="continent-btn continent-btn-europe"
      :class="{ active: activeContinentSlug === 'europe' }"
      v-if="currentStep === 0"
  >
    <IconArrowRight />
  </button>
  <button
      @click="navigateToContinent('amérique')"
      class="continent-btn continent-btn-america"
      :class="{ active: activeContinentSlug === 'amérique' }"
      v-if="currentStep === 0"
  >
    <IconArrowLeft />
  </button>
  <button
      @click="navigateToContinent('océan')"
      class="continent-btn continent-btn-ocean"
      :class="{ active: activeContinentSlug === 'océan' }"
      v-if="currentStep === 0"
  >
    Océan
  </button>

  <SmartNavbar />

  <router-view :key="route.fullPath"></router-view>
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

.continent-btn-europe {
  position: fixed;
  right: 80px;
  top: 0;
  bottom: 0;
  height: 115px;
  width: 150px;
  background-color: black;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-block: auto;
  z-index: 100;
  cursor: pointer;
  border: none;
  font-size: 18px;
  font-weight: bold;

  &:hover {
    background-color: #333;
  }

  &.active {
    display: none;
  }
}

.continent-btn {
  svg {
    width: 85px;
    height: 85px;
  }
}

.continent-btn-america {
  position: fixed;
  left: 80px;
  top: 0;
  bottom: 0;
  height: 115px;
  width: 150px;
  background-color: black;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-block: auto;
  z-index: 100;
  cursor: pointer;
  border: none;
  font-size: 18px;
  font-weight: bold;

  &:hover {
    background-color: #333;
  }

  &.active {
    display: none;
  }
}
</style>