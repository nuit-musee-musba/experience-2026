<script setup>
import { computed } from 'vue';
import hotAreaData from '@/assets/hot-area.json';

const props = defineProps({
  path: {
    type: String,
    required: true
  }
});

const myData = computed(() => {
  return hotAreaData.find(item => item.image === props.path);
});

const imageSrc = computed(() => {
  return `/images/${props.path}`;
});

const handleClick = (area) => {
  if (area.log) console.log(area.log);
};
</script>

<template>

  <div v-if="myData" class="img-container">
    <img :src="imageSrc" :alt="props.path" draggable="false" @dragstart.prevent class="base-image" />
    <div v-for="(area, name) in myData.areas" :key="name" class="clickable-area" :style="{
      top: area.y + '%',
      left: area.x + '%',
      width: area.w + '%',
      height: area.h + '%'
    }" @click="handleClick(area)"></div>
  </div>

</template>

<style scoped>
.img-container {
  position: relative;
  width: fit-content;
}

.base-image {
  pointer-events: none;
  user-select: none;
}

.clickable-area {
  pointer-events: auto;
  position: absolute;
  background-color: rgba(255, 0, 0, 0.4);
  cursor: pointer;
}
</style>