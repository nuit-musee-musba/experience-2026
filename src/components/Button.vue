<template>
  <button class="btn" :class="[
    `btn--${color}`,
    { 'btn--icon-only': iconOnly }
  ]" :disabled="state === 'disable'">
    <span v-if="iconPrimary" class="btn__icon btn__icon--primary">
      <slot name="icon-primary">
      </slot>
    </span>

    <span v-if="!iconOnly && textContent" class="btn__label">
      {{ textContent }}
    </span>

    <span v-if="iconSecondary" class="btn__icon btn__icon--secondary">
      <slot name="icon-secondary">
      </slot>
    </span>
  </button>
</template>

<script setup>
defineProps({
  color: {
    type: String,
    default: 'primary-pink',
  },
  state: {
    type: String,
    default: 'default',
  },
  iconOnly: {
    type: Boolean,
    default: false,
  },
  iconPrimary: {
    type: Boolean,
    default: false,
  },
  iconSecondary: {
    type: Boolean,
    default: false,
  },
  textContent: {
    type: String,
    default: '',
  },
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: $color-black;

  padding: 16px 32px;
  border: 1px solid transparent;
  border-radius: 0;

  font-family: $font-family-text;
  font-size: 75px;
  font-weight: 400;
  line-height: 1;

  cursor: pointer;
  transition: all 0.2s ease;
  box-sizing: border-box;

  .btn__label {
    padding: 8px;
  }

  &--primary-pink {
    background-color: $color-mba-pink;
    color: $color-black;
    border-color: $color-mba-pink;

    &:active:not(:disabled) {
      opacity: 0.9;
    }

    &:active:not(:disabled) {
      transform: scale(0.98);
    }
  }

  &--primary-blue {
    background-color: $color-mba-blue;
    color: $color-black;
    border-color: $color-mba-blue;

    &:active:not(:disabled) {
      opacity: 0.9;
    }

    &:active:not(:disabled) {
      transform: scale(0.98);
    }
  }

  &--secondary {
    background-color: $color-black;
    color: $color-white;
    border-color: $color-black;

    &:active:not(:disabled) {
      opacity: 0.9;
    }

    &:active:not(:disabled) {
      transform: scale(0.98);
    }
  }

  &--tertiary {
    background-color: $color-white;
    color: $color-black;
    border: 1px solid $color-black;
    border-color: $color-black;
  
    &:active:not(:disabled) {
      opacity: 0.8;
    }

    &:active:not(:disabled) {
      transform: scale(0.98);
    }
  }

  &:disabled {
    background-color: $color-grey-light;
    color: $color-grey-dark;
    cursor: not-allowed;
    border-color: transparent;
    pointer-events: none;
  }

  &__icon {
    font-size: 32px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: currentColor;

    &--primary {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    :deep(svg) {
      fill: currentColor;
      width: 90px;
      height: 90px;
    }
  }

  &--icon-only {
    padding: 16px;

    .btn__label {
      display: none;
    }
  }
}
</style>
