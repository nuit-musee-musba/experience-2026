<script setup>
import { onMounted, onBeforeUnmount, ref, render } from 'vue';
import * as THREE from 'three';
import fr from '@/assets/world/fr.svg';
import all from '@/assets/world/all.svg';
import us from '@/assets/world/us.svg';
import ro from '@/assets/world/ro.svg';

const containerRef = ref(null);
let scene, camera, renderer, plane;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let animationId;

const initThree = () => {
  if (!containerRef.value) return;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  camera = new THREE.PerspectiveCamera(75, containerRef.value.clientWidth / containerRef.value.clientHeight, 0.1, 1000);
  camera.position.z = 200;
  camera.updateProjectionMatrix();

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  containerRef.value.appendChild(renderer.domElement);

  const geometry = new THREE.PlaneGeometry(1000, 700);
  const material = new THREE.MeshBasicMaterial(
    {
      map: new THREE.TextureLoader().load(all),
      transparent: true,
    }
  )
  plane = new THREE.Mesh(geometry, material);

  const bgGeometry = new THREE.PlaneGeometry(1000, 700);
  const bgMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const bgPlane = new THREE.Mesh(bgGeometry, bgMaterial);
  bgPlane.position.z = -1;
  plane.add(bgPlane);

  scene.add(plane);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  // sphere 
  animate();

  window.addEventListener('resize', handleResize);
};

const animate = () => {
  animationId = requestAnimationFrame(animate);
  renderer.render(scene, camera);
};

const onMouseDown = (event) => {
  isDragging = true;
  previousMousePosition = {
    x: event.clientX,
    y: event.clientY
  };
};

const onMouseMove = (event) => {
  if (!isDragging) return;

  const deltaMove = {
    x: event.clientX - previousMousePosition.x,
    y: event.clientY - previousMousePosition.y
  };

  const rotationSpeed = 0.005;

  plane.rotation.y += deltaMove.x * rotationSpeed;
  plane.rotation.x += deltaMove.y * rotationSpeed;

  previousMousePosition = {
    x: event.clientX,
    y: event.clientY
  };
};

const onMouseUp = () => {
  isDragging = false;
};

const handleResize = () => {
  if (!containerRef.value) return;
  camera.aspect = containerRef.value.clientWidth / containerRef.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight);
};

onMounted(() => {
  initThree();
  window.addEventListener('mouseup', onMouseUp);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('mouseup', onMouseUp);
  cancelAnimationFrame(animationId);
  renderer.dispose();
});

</script>

<template>
  <div ref="containerRef" class="scene-container" @mousedown="onMouseDown" @mousemove="onMouseMove"
    @mouseleave="onMouseUp"></div>
</template>

<style scoped>
.scene-container {
  width: 100%;
  height: 100vh;
  /* Full screen or adjust as needed */
  display: block;
  overflow: hidden;
}
</style>
