<script setup>
import { onMounted, onBeforeUnmount, ref, render } from 'vue';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import fr from '@/assets/world/fr.svg';
import all from '@/assets/world/all.svg';
import us from '@/assets/world/us.svg';
import ro from '@/assets/world/ro.svg';

const containerRef = ref(null);
let scene, camera, renderer, plane, controls;
let animationId;

const initThree = () => {
  if (!containerRef.value) return;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  camera = new THREE.PerspectiveCamera(75, containerRef.value.clientWidth / containerRef.value.clientHeight, 0.1, 10000);
  camera.position.z = 200;
  camera.updateProjectionMatrix();

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight);

  // Math.min(window.devicePixelRatio, 2)
  renderer.setPixelRatio(1);
  containerRef.value.appendChild(renderer.domElement);

  plane = new THREE.Group();
  const mapGroup = new THREE.Group();
  plane.add(mapGroup);

  const loader = new SVGLoader();

  const loadMap = (url, zOffset = 0) => {
    loader.load(url, function (data) {
      const paths = data.paths;
      const group = new THREE.Group();
      group.scale.y = - 1;
      group.position.z = zOffset;

      for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        const material = new THREE.MeshBasicMaterial({
          color: i == 239 || i == 73 || i == 190 ? 0xa9a9a9 : path.color,
          side: THREE.DoubleSide
        });

        const shapes = SVGLoader.createShapes(path);

        for (let j = 0; j < shapes.length; j++) {
          const shape = shapes[j];
          const geometry = new THREE.ShapeGeometry(shape);
          const mesh = new THREE.Mesh(geometry, material);
          group.add(mesh);
        }
      }

      mapGroup.add(group);

      if (url === all) {
        const box = new THREE.Box3().setFromObject(group);
        const center = new THREE.Vector3();
        box.getCenter(center);

        mapGroup.position.x = -center.x;
        mapGroup.position.y = -center.y;
      }
    });
  };

  loadMap(all, 0);
  // [fr, us, ro].forEach(url => loadMap(url, 1));

  const bgGeometry = new THREE.PlaneGeometry(1000, 700);
  const bgMaterial = new THREE.MeshBasicMaterial({ color: 0xf0f0f0 });
  const bgPlane = new THREE.Mesh(bgGeometry, bgMaterial);
  bgPlane.position.z = -10;
  plane.add(bgPlane);

  scene.add(plane);

  const ambientLight = new THREE.AmbientLight(0xf0f0f0, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xf0f0f0, 1);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  controls = new MapControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;

  controls.minDistance = 20;
  controls.maxDistance = 130;

  controls.maxPolarAngle = Math.PI / 2 + 0.05;
  controls.minPolarAngle = Math.PI / 2 - 0.05;

  controls.maxAzimuthAngle = 0.05;
  controls.minAzimuthAngle = -0.05;

  controls.zoomToCursor = false;
  controls.screenSpacePanning = true;

  camera.position.set(-5, 5, 50);
  controls.update();

  animate();

  window.addEventListener('resize', handleResize);
};

const animate = () => {
  animationId = requestAnimationFrame(animate);
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
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  cancelAnimationFrame(animationId);
  renderer.dispose();
});

</script>

<template>
  <div ref="containerRef" class="scene-container"></div>
</template>

<style scoped>
.scene-container {
  width: 100%;
  height: 100vh;
  display: block;
  overflow: hidden;
}
</style>
