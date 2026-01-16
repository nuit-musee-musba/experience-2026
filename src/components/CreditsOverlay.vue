<template>
  <!-- Bouton de test -->
  <button class="test-btn" @click="openTest = true">
    TEST OVERLAY
  </button>

  <!-- Overlay -->
  <div v-if="openTest" class="overlay" @click="close">
    <div class="overlay-content" @click.stop>
      <header class="overlay-header">
        <h1>Crédits & remerciements</h1>
      </header>

      <main class="overlay-body">
        <p>
          Ce projet a été réalisé par la promotion
          <strong>MMI26</strong> de l’IUT Bordeaux Montaigne.
        </p>

        <p>
          Merci au Musée des Beaux-Arts de Bordeaux, à Sarah Choux, Margaux
          Wymbs, Karine Marchadour et Laurence Pauliac.
          <br />
          Merci pour l’intervention d’Alexis Benoit, Gaetan Jestin, Bastien
          Cornier, Anthony Ferretti.
          <br />
          Merci aux élèves de la promotion MMI26 de l’IUT Bordeaux Montaigne.
        </p>
      </main>

      <footer class="overlay-footer">
        <span class="logo">
          mmi°<br />
          BORDEAUX
        </span>

        <button class="close-btn" @click="close">
          ✕ Fermer
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const openTest = ref(false);

const close = () => {
  openTest.value = false;
};
</script>

<style scoped>
.test-btn {
  padding: 12px 20px;
  background: #222;
  color: white;
  border: none;
  cursor: pointer;
  margin: 20px;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.overlay-content {
  background: white;
  width: 90%;
  max-width: 900px;
  min-height: 70vh;
  padding: 40px;
  display: flex;
  flex-direction: column;
}

.overlay-header {
  border-bottom: 2px solid black;
  margin-bottom: 40px;
}

.overlay-header h1 {
  font-size: 2.2rem;
  font-weight: 400;
}

.overlay-body {
  flex: 1;
  text-align: center;
  line-height: 1.6;
}

.overlay-body p {
  margin-bottom: 24px;
}

.overlay-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-weight: bold;
  font-size: 1.2rem;
  line-height: 1.1;
}

.close-btn {
  background: black;
  color: white;
  border: none;
  padding: 10px 18px;
  cursor: pointer;
  font-size: 0.9rem;
}

.close-btn:hover {
  opacity: 0.8;
}
</style>
