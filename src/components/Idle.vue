<template>
  <div class="app-wrapper">
    <slot />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

let idleTimer = null;
const IDLE_TIME = 30000; // 30 secondes

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
.app-wrapper {
  min-height: 100vh;
}
</style>