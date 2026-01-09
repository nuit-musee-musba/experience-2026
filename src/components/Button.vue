<template>
  <button
    class="btn"
    :class="[
      `btn--${variant}`,
      { 'btn--icon-only': iconOnly }
    ]"
    :disabled="disabled"
  >
    <span v-if="iconLeft" class="btn__icon btn__icon--left">
      ←
    </span>

    <span v-if="!iconOnly" class="btn__label">
      <slot />
    </span>

    <span v-if="iconRight" class="btn__icon btn__icon--right">
      →
    </span>
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary', // primary | dark | disabled
  },
  iconLeft: {
    type: Boolean,
    default: false,
  },
  iconRight: {
    type: Boolean,
    default: false,
  },
  iconOnly: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 16px;

  padding: 20px 32px;
  border: none;
  border-radius: 0;
  font-size: 32px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

/* Variantes */
.btn--primary {
  background-color: #f6b3bf;
  color: #000;
}

.btn--dark {
  background-color: #000;
  color: #fff;
}

.btn--disabled {
  background-color: #e6e6e6;
  color: #9a9a9a;
  cursor: not-allowed;
}

/* Icônes */
.btn__icon {
  font-size: 32px;
  line-height: 1;
}

/* Bouton icône seule */
.btn--icon-only {
  padding: 20px;
  width: 80px;
  height: 80px;
}

.btn:disabled {
  pointer-events: none;
}
</style>
