<template>
  <button class="btn" :class="[
    `btn--${color}`,
    { 'btn--icon-only': iconOnly }
  ]" :disabled="state === 'disable'" @touchstart="handleTouch">
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
import { firstFingerOfEvent } from '@/utils/touch/touch';

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

const handleTouch = (event) => {
  const finger = firstFingerOfEvent(event);
  if (!finger) {
    if (event.cancelable) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}
</script>

<style lang="scss" scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: $black;

  padding: $spacing-16 $spacing-32;
  border: 1px solid transparent;
  border-radius: 0;

  font-family: $font-family-sans-serif;
  font-size: 40px;
  font-weight: 400;
  line-height: 1;

  cursor: pointer;
  transition: all 0.2s ease;
  box-sizing: border-box;

  .btn__label {
    padding: $spacing-8;
  }

  &--primary-pink {
    background-color: $pink-100;
    color: $black;
    border-color: $pink-100;

    &:active:not(:disabled) {
      opacity: 0.9;
    }

    &:active:not(:disabled) {
      transform: scale(0.98);
    }
  }

  &--primary-blue {
    background-color: $blue-100;
    color: $black;
    border-color: $blue-100;

    &:active:not(:disabled) {
      opacity: 0.9;
    }

    &:active:not(:disabled) {
      transform: scale(0.98);
    }
  }

  &--primary {
    background-color: $black;
    color: $white;
    border-color: $black;

    &:active:not(:disabled) {
      opacity: 0.9;
    }

    &:active:not(:disabled) {
      transform: scale(0.98);
    }
  }

  &--secondary {
    background-color: $white;
    color: $black;
    border-color: $black;

    &:active:not(:disabled) {
      background-color: $gray-200;
    }

    &:active:not(:disabled) {
      transform: scale(0.98);
    }
  }

  &--place {
    background-color: $green-300;
    color: $white;
    border-color: $green-300;

    &:active:not(:disabled) {
      opacity: 0.9;
    }

    &:active:not(:disabled) {
      transform: scale(0.98);
    }
  }

  &--artwork {
    background-color: $blue-300;
    color: $white;
    border-color: $blue-300;
    &:active:not(:disabled) {
      opacity: 0.8;
    }

    &:active:not(:disabled) {
      transform: scale(0.98);
    }
  }

  &:disabled {
    background-color: $gray-400;
    color: $gray-500;
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
    .btn__label {
      display: none;
    }
  }
}
</style>