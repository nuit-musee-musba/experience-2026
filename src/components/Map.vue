<script setup>
import { onMounted, onBeforeUnmount, ref, watch, computed } from 'vue';
import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import { MapPlane } from '@/webgl/components/MapPlane.js';
import { MapPins } from '@/webgl/components/MapPins.js';
import { CONFIG } from '@/config/webgl.js';
import all from '@/assets/world/all.svg?url';
import BaseButton from '@/components/buttons/Button.vue';
import { useRouter, useRoute } from "vue-router";
import { allData } from '@/store.js';
import { Stats } from '@/webgl/utils/Stats.js';

const route = useRoute();
const router = useRouter();
const isArtworkActive = computed(() => route.name === 'artwork-detail');

const containerRef = ref(null);
const props = defineProps(['path']);

let scene, camera, renderer, controls, animationId, stats;
let mapPlane, mapPins;
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
  if (!data || !controls) return;

  resetMapControls();

  if (params.citySlug && params.museumSlug) {
    const city = data.find(v => v.slug === params.citySlug);
    const museum = city?.museums.find(m => m.slug === params.museumSlug);

    if (museum) {
      targetDestination.set(museum.x, museum.y, -9.5);

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
    renderLevel(data);
    isTraveling = false;
    isZooming = true;
    currentStep.value = 0;
  }
}, { immediate: true, deep: true });

const resetMapControls = () => {
  if (!controls) return;
  if(camera) camera.clearViewOffset();

  controls.minAzimuthAngle = CONFIG.controls.map.minAzimuthAngle;
  controls.maxAzimuthAngle = CONFIG.controls.map.maxAzimuthAngle;
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI / 2;
  controls.minDistance = 0;
  controls.maxDistance = Infinity;
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
  mapPlane = new MapPlane(scene, all, CONFIG.mapPlane.width, CONFIG.mapPlane.height);
  mapPins = new MapPins(scene);

  scene.add(new THREE.AmbientLight(CONFIG.colors.ambientLight, CONFIG.lights.ambientIntensity));
  const dirLight = new THREE.DirectionalLight(CONFIG.colors.directionalLight, CONFIG.lights.directionalIntensity);
  dirLight.position.copy(CONFIG.lights.directionalPosition);
  scene.add(dirLight);

  controls = new MapControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = true;

  resetMapControls();
  camera.position.copy(CONFIG.camera.homePosition);
  animate();
};

const animate = () => {
  stats.begin();
  animationId = requestAnimationFrame(animate);

  if (isZooming) {
    camera.position.lerp(destinationCoordonates, 0.07);
    controls.target.lerp(targetDestination, 0.07);

    if (camera.position.distanceTo(destinationCoordonates) < 0.01) {
      isZooming = false;
      if (currentStep.value === 2) {
        controls.minPolarAngle = Math.PI / 3;
        controls.maxPolarAngle = Math.PI / 3;
        controls.minDistance = 4;
        controls.maxDistance = 12;
        controls.maxPolarAngle = Math.PI / 2;
      }

      if (currentStep.value === 1) {
        controls.minDistance = 8;
        controls.maxDistance = 24;
        controls.maxPolarAngle = 0;
      }

      if (currentStep.value === 0) {
        controls.minDistance = 30;
        controls.maxDistance = 60;
        controls.maxPolarAngle = 0;
      }
    }
  } else {
    if (currentStep.value === 2) {
      controls.target.lerp(targetDestination, 0.05);

      const idealDistance = 7;
      const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
      const currentDistance = offset.length();

      if (Math.abs(currentDistance - idealDistance) > 0.001) {
        const newDistance = THREE.MathUtils.lerp(currentDistance, idealDistance, 0.04);
        offset.setLength(newDistance);
        camera.position.copy(controls.target).add(offset);
      }
    }

    if (currentStep.value === 1) {
      controls.target.lerp(targetDestination, 0.05);

      const idealDistance = 18;
      const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
      const currentDistance = offset.length();

      if (Math.abs(currentDistance - idealDistance) > 0.001) {
        const newDistance = THREE.MathUtils.lerp(currentDistance, idealDistance, 0.04);
        offset.setLength(newDistance);
        camera.position.copy(controls.target).add(offset);
      }
    }

    if (currentStep.value === 0) {
      controls.target.lerp(targetDestination, 0.05);

      const idealDistance = 50;
      const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
      const currentDistance = offset.length();

      if (Math.abs(currentDistance - idealDistance) > 0.001) {
        const newDistance = THREE.MathUtils.lerp(currentDistance, idealDistance, 0.04);
        offset.setLength(newDistance);
        camera.position.copy(controls.target).add(offset);
      }
    }
  }

  controls.update();
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
  const width = containerRef.value.clientWidth;
  const height = containerRef.value.clientHeight;

  camera.aspect = width / height;
  if (currentStep.value === 2) {
    camera.setViewOffset(width, height, -width * 0.25, 0, width, height);
  }

  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
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
</style>