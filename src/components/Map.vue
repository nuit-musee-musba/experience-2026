<script setup>
import { onMounted, onBeforeUnmount, ref, watch, computed } from "vue";
import * as THREE from "three";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import SmartNavbar from "@/components/layouts/SmartNavbar.vue";
import { MapPlane } from "@/webgl/components/MapPlane.js";
import { MapPins } from "@/webgl/components/MapPins.js";
import { CONFIG } from "@/config/webgl.js";
import { CamerasManager } from "@/webgl/managers/CamerasManagers.js";

import { useRouter, useRoute } from "vue-router";
import { allData } from "@/store.js";
import { firstFingerOfEvent } from "@/utils/touch/touch";
import IconArrowLeft from "@/components/icons/IconArrowLeft.vue";
import IconArrowRight from "@/components/icons/IconArrowRight.vue";

const route = useRoute();
const router = useRouter();
const isArtworkActive = computed(() => route.name === "artwork-detail");

const containerRef = ref(null);

let scene, camera, renderer, labelRenderer, camerasManager, animationId;
let mapPins;
let allPins = null;
let mapPlane = null;
let needsRender = false;
const clock = new THREE.Clock();
const currentStep = ref(-1);
const activeCitySlug = ref(null);
const activeContinentSlug = ref("europe");

let clickCooldown = false;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const continentPositions = {
  europe: {
    camera: new THREE.Vector3(-5, 8, 100),
    target: new THREE.Vector3(-5, 8, -9.9),
  },
  amérique: {
    camera: new THREE.Vector3(-220, -16, 100),
    target: new THREE.Vector3(-220, -16, -9.9),
  },
};

defineProps(['path']);

watch(
  [() => route.params, allData],
  ([params, data]) => {
    if (!data || !camerasManager) return;

    const continentSlug = params.continentSlug || "europe";
    activeContinentSlug.value = continentSlug;

    if (params.citySlug) {
      activeCitySlug.value = params.citySlug;
    }

    const continent = data.find((c) => c.Name.toLowerCase() === continentSlug);

    if (!continent) return;

    if (params.citySlug) {
      const city = continent.cities.find((v) => v.slug === params.citySlug);
      const museum = city?.museums.find((m) => m.slug === params.museumSlug);

      if (camera) camera.clearViewOffset();

      const distance = CONFIG.controls.map.city.minDistance;

      const targetPos = new THREE.Vector3(city.x, city.y, -9.9);
      const camPos = new THREE.Vector3(
        city.x,
        city.y - distance * Math.sin(CONFIG.controls.map.city.maxPolarAngle),
        -9.9 + distance * Math.cos(CONFIG.controls.map.city.maxPolarAngle),
      );

      camerasManager.setLookAt(camPos, targetPos, true);

      // ✅ On affiche uniquement les musées de cette ville,
      // les pins des autres villes sont ainsi effacés
      renderLevel(city.museums);

      currentStep.value = 1;
      activeCitySlug.value = city.slug;

      applyStepConstraints();

      if (params.museumSlug) {
        if (museum) {
          const width = containerRef.value.clientWidth;
          const height = containerRef.value.clientHeight;
          camera.setViewOffset(width, height, -width * 0.25, 0, width, height);

          const distance = CONFIG.controls.map.museum.defaultDistance;

          const targetPos = new THREE.Vector3(museum.x, museum.y, -9.9);
          const camPos = new THREE.Vector3(
            museum.x,
            museum.y - distance * Math.sin(CONFIG.controls.map.museum.maxPolarAngle),
            -9.9 + distance * Math.cos(CONFIG.controls.map.museum.maxPolarAngle),
          );

          camerasManager.setLookAt(camPos, targetPos, true);

          hidePoiPin();
        }

        currentStep.value = 2;
        applyStepConstraints();
      }
    } else if (params.continentSlug) {
      if (camera) camera.clearViewOffset();

      const continentPos = continentPositions[continentSlug] || continentPositions.europe;
      camerasManager.setLookAt(continentPos.camera, continentPos.target, true);

      // ✅ Retour au niveau continent : on réaffiche toutes les villes
      renderLevel(continent.cities);

      currentStep.value = 0;
      applyStepConstraints();
    } else {
      if (camera) camera.clearViewOffset();

      const continentPos = continentPositions.europe;
      camerasManager.setLookAt(continentPos.camera, continentPos.target, true);

      const europeContinent = data.find((c) => c.Name.toLowerCase() === "europe");
      if (europeContinent) {
        renderLevel(europeContinent.cities);
      }

      currentStep.value = 0;
      applyStepConstraints();
    }
  },
  { immediate: true },
);

const resolvePinTarget = (item) => {
  if (item.museums && item.museums.length === 1) {
    return item.museums[0].path;
  }
  return item.path;
};

const handlePinClick = (item) => {
  if (clickCooldown) return;
  clickCooldown = true;
  setTimeout(() => { clickCooldown = false; }, 300);

  if (item.museums) {
    router.push(resolvePinTarget(item));
  } else if (item.artworks) {
    const city = item.model3d.split("_")[0];
    if (city) {
      router.push(resolvePinTarget(item));
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

  camera = new THREE.PerspectiveCamera(
    CONFIG.camera.fov,
    containerRef.value.clientWidth / containerRef.value.clientHeight,
    CONFIG.camera.near,
    CONFIG.camera.far,
  );
  camera.up.set(0, 0, 1);

  renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight);
  renderer.setPixelRatio(1);
  containerRef.value.appendChild(renderer.domElement);

  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight);
  labelRenderer.domElement.style.position = "absolute";
  labelRenderer.domElement.style.top = "0px";
  labelRenderer.domElement.style.pointerEvents = "none";
  labelRenderer.domElement.style.zIndex = "0";
  containerRef.value.appendChild(labelRenderer.domElement);

  const requestRender = () => { needsRender = true; };

  mapPlane = new MapPlane(scene, requestRender);
  mapPins = new MapPins(scene, handlePinClick, requestRender);

  scene.add(new THREE.AmbientLight(CONFIG.colors.ambientLight, CONFIG.lights.ambientIntensity));
  const dirLight = new THREE.DirectionalLight(CONFIG.colors.directionalLight, CONFIG.lights.directionalIntensity);
  dirLight.position.copy(CONFIG.lights.directionalPosition);
  scene.add(dirLight);

  camerasManager = new CamerasManager(camera, renderer.domElement);

  const europePos = continentPositions.europe;
  camerasManager.setLookAt(europePos.camera, europePos.target, true);

  applyStepConstraints();
  animate();
};

const animate = () => {
  animationId = requestAnimationFrame(animate);

  if (isArtworkActive.value) return;

  const delta = clock.getDelta();
  const hasUpdated = camerasManager.update(delta);

  if (hasUpdated || needsRender) {
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
    needsRender = false;
  }
};

const applyStepConstraints = () => {
  if (!camerasManager) return;

  if (currentStep.value === 2) {
    const targetY = allData.value
      .find((c) => c.Name.toLowerCase() === activeContinentSlug.value)
      ?.cities.find((v) => v.slug === activeCitySlug.value)
      ?.museums.find((m) => m.slug === route.params.museumSlug)?.y || 0;

    const targetX = allData.value
      .find((c) => c.Name.toLowerCase() === activeContinentSlug.value)
      ?.cities.find((v) => v.slug === activeCitySlug.value)
      ?.museums.find((m) => m.slug === route.params.museumSlug)?.x || 0;

    const boundary = new THREE.Box3();
    boundary.min.set(targetX - 0.05, targetY - 0.05, -50);
    boundary.max.set(targetX + 0.05, targetY + 0.05, 50);
    camerasManager.setConstraints({
      minPolarAngle: CONFIG.controls.map.museum.minPolarAngle,
      maxPolarAngle: CONFIG.controls.map.museum.maxPolarAngle,
      minAzimuthAngle: CONFIG.controls.map.museum.minAzimuthAngle,
      maxAzimuthAngle: CONFIG.controls.map.museum.maxAzimuthAngle,
      minDistance: CONFIG.controls.map.museum.minDistance,
      maxDistance: CONFIG.controls.map.museum.maxDistance,
      boundary,
    });
  } else if (currentStep.value === 1) {
    const targetY = allData.value
      .find((c) => c.Name.toLowerCase() === activeContinentSlug.value)
      ?.cities.find((v) => v.slug === activeCitySlug.value)?.y || 0;

    const targetX = allData.value
      .find((c) => c.Name.toLowerCase() === activeContinentSlug.value)
      ?.cities.find((v) => v.slug === activeCitySlug.value)?.x || 0;

    const boundary = new THREE.Box3();
    boundary.min.set(targetX - 0.1, targetY - 0.1, -50);
    boundary.max.set(targetX + 0.1, targetY + 0.1, 50);
    camerasManager.setConstraints({
      minPolarAngle: CONFIG.controls.map.city.minPolarAngle,
      maxPolarAngle: CONFIG.controls.map.city.maxPolarAngle,
      minAzimuthAngle: CONFIG.controls.map.city.minAzimuthAngle,
      maxAzimuthAngle: CONFIG.controls.map.city.maxAzimuthAngle,
      minDistance: CONFIG.controls.map.city.minDistance,
      maxDistance: CONFIG.controls.map.city.maxDistance,
      boundary,
    });
  } else {
    const targetY = continentPositions[activeContinentSlug.value]?.target.y || continentPositions.europe.target.y;
    const targetX = continentPositions[activeContinentSlug.value]?.target.x || continentPositions.europe.target.x;

    const boundary = new THREE.Box3();
    boundary.min.set(targetX - 1, targetY - 1, -50);
    boundary.max.set(targetX + 1, targetY + 1, 50);

    camerasManager.setConstraints({
      minPolarAngle: CONFIG.controls.map.continent.minPolarAngle,
      maxPolarAngle: CONFIG.controls.map.continent.maxPolarAngle,
      minAzimuthAngle: CONFIG.controls.map.continent.minAzimuthAngle,
      maxAzimuthAngle: CONFIG.controls.map.continent.maxAzimuthAngle,
      minDistance: CONFIG.controls.map.continent.minDistance,
      maxDistance: CONFIG.controls.map.continent.maxDistance,
      boundary,
    });
  }
};

const renderLevel = (items) => {
  if (mapPins && items) {
    mapPins.renderLevel(items);
    needsRender = true;
  }
};

const hidePoiPin = () => {
  if (mapPins) {
    mapPins.hidePoiPin();
    needsRender = true;
  }
};

const onMapClick = (event) => {
  event.stopPropagation();

  if (clickCooldown) return;
  clickCooldown = true;
  setTimeout(() => { clickCooldown = false; }, 300);

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

  const interactables = [...mapPins.getObjects()].filter((obj) => obj.visible);
  const intersects = raycaster.intersectObjects(interactables, true);

  if (intersects.length > 0) {
    if (event.cancelable) event.preventDefault();
    const clickedObject = intersects[0].object;
    if (clickedObject.userData.path) {
      router.push(resolvePinTarget(clickedObject.userData));
    }
  }
};

const handleResize = () => {
  if (!containerRef.value) return;
  const width = containerRef.value.clientWidth;
  const height = containerRef.value.clientHeight;
  camera.aspect = width / height;
  if (currentStep.value === 2)
    camera.setViewOffset(width, height, -width * 0.25, 0, width, height);
  camera.updateProjectionMatrix();
  mapPlane.reload();
  renderer.setSize(width, height);
  labelRenderer.setSize(width, height);
};

onMounted(async () => {
  initThree();
  const response = await fetch("/content/content.json");
  allPins = await response.json();
  allData.value = createPathInData(allPins.data);
  const europeContinent = allPins.data.find((c) => c.Name.toLowerCase() === "europe");
  if (europeContinent) {
    renderLevel(europeContinent.cities);
  }

  if (containerRef.value) {
    containerRef.value.addEventListener("mousedown", onMapClick);
    containerRef.value.addEventListener("touchstart", onMapClick, { passive: false });
  }
  window.addEventListener("resize", handleResize);
});

function createPathInData(data) {
  data.forEach(continent => {
    continent.path = '/' + continent.Name.toLowerCase();
    continent.cities.forEach(city => {
      city.path = continent.path + '/' + city.slug;
      city.museums.forEach(museum => {
        museum.path = city.path + '/' + museum.slug;
      });
    });
  });
  return data;
}

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  if (containerRef.value) {
    containerRef.value.removeEventListener("mousedown", onMapClick);
    containerRef.value.removeEventListener("touchstart", onMapClick);
  }
  cancelAnimationFrame(animationId);
  if (renderer) renderer.dispose();
  if (labelRenderer?.domElement) labelRenderer.domElement.remove();
  if (camerasManager) camerasManager.dispose();
});

defineExpose({ navigateToContinent });
</script>

<template>
  <div
    ref="containerRef"
    class="scene-container"
    :class="{ 'map-frozen': isArtworkActive }"
  ></div>

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

  <SmartNavbar />

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

  &:hover { background-color: #333; }
  &.active { display: none; }
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

  &:hover { background-color: #333; }
  &.active { display: none; }
}
</style>
