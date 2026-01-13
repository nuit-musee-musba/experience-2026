<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'pink',
  },
  icon: {
    type: Boolean,
    default: false,
  },
  as: {
    type: String,
    default: 'button',
  },
})

const classes = computed(() => ({
  [`button--${props.variant}`]: true,
  'button--icon': props.icon,
}))
</script>

<template>
  <component
      :is="as"
      :class="classes"
      class="button"
  >
    <slot />
  </component>
</template>
