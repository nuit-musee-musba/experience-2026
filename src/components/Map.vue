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
import { Stats } from "@/webgl/utils/Stats.js";
import { firstFingerOfEvent } from "@/utils/touch/touch";
import IconArrowLeft from "@/components/icons/IconArrowLeft.vue";
import IconArrowRight from "@/components/icons/IconArrowRight.vue";

const route = useRoute();
const router = useRouter();
const isArtworkActive = computed(() => route.name === "artwork-detail");

const containerRef = ref(null);

let scene, camera, renderer, labelRenderer, camerasManager, animationId, stats;
let mapPins;
let allPins = null;
let mapPlane = null;
let needsRender = false;
const clock = new THREE.Clock();
const currentStep = ref(-1);
const activeCitySlug = ref(null);
const activeContinentSlug = ref("europe");

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// Positions de caméra pour chaque continent
const continentPositions = {
  europe: {
    camera: new THREE.Vector3(-5, 8, 80),
    target: new THREE.Vector3(-5, 8, -9.9),
  },
  amérique: {
    camera: new THREE.Vector3(-220, -16, 100),
    target: new THREE.Vector3(-220, -16, -9.9),
  },
};

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

    if (!continent) {
      return;
    }

    if (params.citySlug) {
      // Niveau 1 : vue ville
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

      continent.cities.forEach((city) => {
        // city.museums.forEach((museum) => {
        //   renderLevel(museum);
        // });
        renderLevel(city.museums)
      });

      currentStep.value = 1;
      activeCitySlug.value = city.slug;

      applyStepConstraints();

      if (params.museumSlug) {
        // Niveau 2 : vue POI

        if (museum) {
          const width = containerRef.value.clientWidth;
          const height = containerRef.value.clientHeight;
          camera.setViewOffset(width, height, -width * 0.25, 0, width, height);

          const distance = CONFIG.controls.map.museum.defaultDistance;

          const targetPos = new THREE.Vector3(museum.x, museum.y, -9.9);
          const camPos = new THREE.Vector3(
            museum.x,
            museum.y -
              distance * Math.sin(CONFIG.controls.map.museum.maxPolarAngle),
            -9.9 +
              distance * Math.cos(CONFIG.controls.map.museum.maxPolarAngle),
          );

          camerasManager.setLookAt(camPos, targetPos, true);
        }

        currentStep.value = 2;
        applyStepConstraints();
      }
    } else if (params.continentSlug) {
      // Niveau 0 : Vue continent
      if (camera) camera.clearViewOffset();

      const continentPos =
        continentPositions[continentSlug] || continentPositions.europe;

      camerasManager.setLookAt(continentPos.camera, continentPos.target, true);

      // continent.cities.forEach((city) => {
      //   renderLevel(city);
      // });

      renderLevel(continent.cities);

      currentStep.value = 0;
      applyStepConstraints();
    } else {
      // Vue par défaut sur Europe
      if (camera) camera.clearViewOffset();

      const continentPos = continentPositions.europe;
      camerasManager.setLookAt(continentPos.camera, continentPos.target, true);

      const europeContinent = data.find(
        (c) => c.Name.toLowerCase() === "europe",
      );
      if (europeContinent) {
      renderLevel(europeContinent.cities);
      }

      currentStep.value = 0;
      applyStepConstraints();
    }
  },
  { immediate: true },
);

const handlePinClick = (item) => {
  const continent = route.params.continentSlug || activeContinentSlug.value;
  const city = route.params.citySlug || activeCitySlug.value;

  if (item.museums) {
    router.push(`/${continent}/${item.slug}`);
  } else if (item.artworks) {
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

  camera = new THREE.PerspectiveCamera(
    CONFIG.camera.fov,
    containerRef.value.clientWidth / containerRef.value.clientHeight,
    CONFIG.camera.near,
    CONFIG.camera.far,
  );
  camera.up.set(0, 0, 1);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(
    containerRef.value.clientWidth,
    containerRef.value.clientHeight,
  );
  renderer.setPixelRatio(1);
  containerRef.value.appendChild(renderer.domElement);

  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(
    containerRef.value.clientWidth,
    containerRef.value.clientHeight,
  );
  labelRenderer.domElement.style.position = "absolute";
  labelRenderer.domElement.style.top = "0px";
  labelRenderer.domElement.style.pointerEvents = "none";
  containerRef.value.appendChild(labelRenderer.domElement);

  stats = new Stats(containerRef.value);
  stats = new Stats(containerRef.value);

  const requestRender = () => {
    needsRender = true;
  };

  mapPlane = new MapPlane(scene, requestRender);
  mapPins = new MapPins(scene, handlePinClick, requestRender);

  scene.add(
    new THREE.AmbientLight(
      CONFIG.colors.ambientLight,
      CONFIG.lights.ambientIntensity,
    ),
  );
  const dirLight = new THREE.DirectionalLight(
    CONFIG.colors.directionalLight,
    CONFIG.lights.directionalIntensity,
  );
  dirLight.position.copy(CONFIG.lights.directionalPosition);
  scene.add(dirLight);

  camerasManager = new CamerasManager(camera, renderer.domElement);

  const europePos = continentPositions.europe;
  // Initialize position immediately without transition
  camerasManager.setLookAt(europePos.camera, europePos.target, true);

  applyStepConstraints();

  animate();
};

const animate = () => {
  animationId = requestAnimationFrame(animate);

  // camerasManager.update();

  if (isArtworkActive.value) {
    return;
  }

  stats.begin();

  const delta = clock.getDelta();
  const hasUpdated = camerasManager.update(delta);

  if (hasUpdated || needsRender) {
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
    needsRender = false;
  }

  stats.end();
};

const applyStepConstraints = () => {
  if (!camerasManager) return;

  if (currentStep.value === 2) {
    const targetY =
      allData.value
        .find((c) => c.Name.toLowerCase() === activeContinentSlug.value)
        ?.cities.find((v) => v.slug === activeCitySlug.value)
        ?.museums.find((m) => m.slug === route.params.museumSlug)?.y || 0;

    const targetX =
      // Vue musée : permettre rotation libre mais contrainte
      allData.value
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
      boundary: boundary,
    });
  } else {
    if (currentStep.value === 1) {
      // Vue ville
      const targetY =
        allData.value
          .find((c) => c.Name.toLowerCase() === activeContinentSlug.value)
          ?.cities.find((v) => v.slug === activeCitySlug.value)?.y || 0;

      const targetX =
        allData.value
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
        boundary: boundary,
      });
    } else {
      // Vue continent : limiter l'angle (vue de dessus/baissée)
      const targetY =
        continentPositions[activeContinentSlug.value]?.target.y ||
        continentPositions.europe.target.y;

      const targetX =
        continentPositions[activeContinentSlug.value]?.target.x ||
        continentPositions.europe.target.x;

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
        boundary: boundary,
      });
    }
  }
};

const renderLevel = (item) => {
  if (mapPins && item) {
    mapPins.renderLevel(item);
    needsRender = true;
  }
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
    // Si on clique sur un pin, on laisse faire
    if (event.cancelable) event.preventDefault();
    const clickedObject = intersects[0].object;
    const continent = route.params.continentSlug || activeContinentSlug.value;

    if (clickedObject.userData.museums) {
      router.push(`/${continent}/${clickedObject.userData.slug}`);
    } else if (clickedObject.userData.artworks) {
      router.push(
        `/${activeContinentSlug.value}/${activeCitySlug.value}/${clickedObject.userData.slug}`,
      );
    } else if (clickedObject.userData.type === "city") {
      router.push(`/${continent}/${clickedObject.userData.slug}`);
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
  allData.value = allPins.data;

  const europeContinent = allPins.data.find(
    (c) => c.Name.toLowerCase() === "europe",
  );
  if (europeContinent) {
      renderLevel(europeContinent.cities);
  }

  if (containerRef.value) {
    containerRef.value.addEventListener("click", onMapClick);
    containerRef.value.addEventListener("touchstart", onMapClick, {
      passive: false,
    });
  }
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  if (containerRef.value) {
    containerRef.value.removeEventListener("click", onMapClick);
    containerRef.value.removeEventListener("touchstart", onMapClick);
  }
  cancelAnimationFrame(animationId);
  if (renderer) renderer.dispose();
  if (labelRenderer && labelRenderer.domElement)
    labelRenderer.domElement.remove();
  if (camerasManager) camerasManager.dispose();
});

defineExpose({
  navigateToContinent,
});
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
