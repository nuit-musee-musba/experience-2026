<template>
    <slot />
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { APP_CONFIG } from "@/config/appConfig.js";

const router = useRouter();

let idleTimer = null;
const IDLE_TIME = APP_CONFIG.idleTime;

const resetTimer = () => {
  clearTimeout(idleTimer);

  idleTimer = setTimeout(() => {
    router.push("/");
  }, IDLE_TIME);
};

const events = ["mousemove", "mousedown", "keydown", "touchstart"];

onMounted(() => {
  resetTimer();
  events.forEach(event =>
    window.addEventListener(event, resetTimer)
  );
});

onUnmounted(() => {
  clearTimeout(idleTimer);
  events.forEach(event =>
    window.removeEventListener(event, resetTimer)
  );
});
</script>

<style scoped>
  
</style>