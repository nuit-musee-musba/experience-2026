<template>
  <div>
    <button class="btn" @click="openModal">
      Voir toutes les œuvres
    </button>

    <div v-if="isOpen" class="overlay" @click.self="closeModal">
      <div class="modal">
        <h2>Toutes les œuvres</h2>

        <ul>
          <li v-for="oeuvre in oeuvres" :key="oeuvre.id">
            {{ oeuvre.title }}
          </li>
        </ul>

        <button class="btn-close" @click="closeModal">
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isOpen = ref(false)

// Exemple de données (à remplacer par props ou API)
const oeuvres = ref([
  { id: 1, title: 'Œuvre 1' },
  { id: 2, title: 'Œuvre 2' },
  { id: 3, title: 'Œuvre 3' }
])

const openModal = () => {
  isOpen.value = true
}

const closeModal = () => {
  isOpen.value = false
}
</script>

<style scoped>
.btn {
  padding: 10px 16px;
  background: #000;
  color: white;
  border: none;
  cursor: pointer;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 24px;
  border-radius: 8px;
  min-width: 300px;
}

.btn-close {
  margin-top: 16px;
}
</style>
