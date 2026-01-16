<template>
  <div class="idle-wrapper">
    <slot />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";
import { APP_CONFIG } from "@/config/appConfig.js"; 

const emit = defineEmits(['idle']);

let idleTimer = null;

const IDLE_TIME = APP_CONFIG.idleTime;

const resetTimer = () => {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    emit('idle');
  }, IDLE_TIME);
};

const events = ["mousemove", "mousedown", "keydown", "touchstart", "click", "scroll"];

onMounted(() => {
  resetTimer();
  events.forEach(event => window.addEventListener(event, resetTimer));
});

onUnmounted(() => {
  clearTimeout(idleTimer);
  events.forEach(event => window.removeEventListener(event, resetTimer));
});
</script>

<style scoped>
.idle-wrapper {
  width: 100%;
  height: 100%;
}
</style>