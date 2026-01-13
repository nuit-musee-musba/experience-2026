<template>
  <button 
    class="nav-button" 
    :class="{ 'is-active': active, 'is-quarter': quarter }"
    @click="$emit('click')"
  >
    <div class="content">
      <slot name="icon">
        <span class="default-icon">🗺️</span>
      </slot>
      <span class="label">{{ label }}</span>
    </div>
  </button>
</template>

<script setup>
defineProps({
  label: String,
  active: Boolean,
  quarter: Boolean // Pour les formes en quart de cercle à droite
})
</script>

<style scoped>
.nav-button {
  all: unset;
  cursor: pointer;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 20px;
  transition: all 0.3s ease;
  
  /* Forme de base : Demi-cercle */
  width: 200px;
  height: 100px;
  border-radius: 100px 100px 0 0;
  border: 2px solid black;
  background-color: white;
  color: black;
}

/* Version pleine (Active) */
.nav-button.is-active {
  background-color: black;
  color: white;
}

/* Version quart de cercle (à droite sur l'image) */
.nav-button.is-quarter {
  width: 100px;
  border-radius: 100% 0 0 0; /* Arrondi uniquement en haut à gauche */
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.label {
  font-family: sans-serif;
  font-size: 1.2rem;
  font-weight: 300;
}
</style>