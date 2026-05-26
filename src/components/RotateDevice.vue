<template>
  <Teleport to="body">
    <div class="rotate-device">
      <div class="rotate-device__content">
        <svg
          class="rotate-device__icon"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M16.48 2.52c3.27 1.55 5.61 4.72 5.97 8.48h1.5C23.44 4.84 18.29 0 12 0l-.66.03 3.81 3.81 1.33-1.32zm-6.25-.77c-.59-.59-1.54-.59-2.12 0L1.75 8.11c-.59.59-.59 1.54 0 2.12l12.02 12.02c.59.59 1.54.59 2.12 0l6.36-6.36c.59-.59.59-1.54 0-2.12L10.23 1.75zm4.6 19.44L2.81 9.17l6.36-6.36 12.02 12.02-6.36 6.36zM7.52 21.48C4.25 19.94 1.91 16.76 1.55 13H.05C.56 19.16 5.71 24 12 24l.66-.03-3.81-3.81-1.33 1.32z"
          />
        </svg>

        <h2 class="rotate-device__title">Tournez votre appareil</h2>
        <p class="rotate-device__text">
          Cette expérience se découvre en mode paysage.
        </p>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
// Pas de logique JS — afficher / masquer via media query d'orientation.
</script>

<style lang="scss" scoped>
.rotate-device {
  display: none;
}

@media (orientation: portrait) {
  .rotate-device {
    position: fixed;
    inset: 0;
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    color: #000;
  }
}

.rotate-device__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4vh;
  padding: 8vw;
  max-width: 80%;
}

.rotate-device__icon {
  width: 22vh;
  height: 22vh;
  fill: #000;
  animation: rotate-hint 2.4s ease-in-out infinite;
}

.rotate-device__title {
  font-family: "MusBA", sans-serif;
  font-size: 5.5vh;
  line-height: 1.1;
  margin: 0;
}

.rotate-device__text {
  font-family: "baseFont", sans-serif;
  font-size: 2.8vh;
  line-height: 1.4;
  margin: 0;
}

@keyframes rotate-hint {
  0%, 40%   { transform: rotate(0deg); }
  60%, 100% { transform: rotate(-90deg); }
}
</style>
