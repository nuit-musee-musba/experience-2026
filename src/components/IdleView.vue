<template>
  <div class="app-wrapper">
    <slot />

    <div v-if="isIdle" class="idle-overlay">
      <img
        src="/images/basilique.jpg"
        alt="Écran d’attente"
        class="idle-image"
      />

      <div class="idle-actions">
        <p>Vous êtes toujours là ?</p>
        <button @click="resume">Reprendre l’expérience</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const isIdle = ref(false);
let idleTimer = null;

const IDLE_TIME = 100000;

const resetTimer = () => {
  clearTimeout(idleTimer);
  isIdle.value = false;

  idleTimer = setTimeout(() => {
    isIdle.value = true;
  }, IDLE_TIME);
};

const resume = () => {
  resetTimer();
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
  position: relative;
  min-height: 100vh;
}

.idle-overlay {
  position: fixed;
  inset: 0;
  background: #ffffff;
  z-index: 9999;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.idle-image {
  max-width: 80%;
  height: auto;
  margin-bottom: 2rem;
}

.idle-actions {
  text-align: center;
}

.idle-actions p {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.idle-actions button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background: #eaeaea;
}
</style>