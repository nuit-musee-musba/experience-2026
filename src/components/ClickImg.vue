<script setup>
import { ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import hotAreaData from '../assets/HotArea.json';

const props = defineProps({
  path: {
    type: String,
    required: true
  }
});

const router = useRouter();
const myData = ref(null);
const imageSrc = ref('');

const handleClick = (zone) => {
  if (zone.log) console.log(zone.log);
  
  if (zone.url) {
    if (zone.url.startsWith('http')) {
      window.open(zone.url, '_blank');
    } else {
      router.push(zone.url);
    }
  }
};

watchEffect(async () => {
  if (props.path) {
    // Search for the image in the central JSON file
    const imageData = hotAreaData.find(item => item.image === props.path);
    
    if (imageData) {
      myData.value = imageData;
    } else {
      console.warn(`No data found for image: ${props.path} in HotArea.json`);
      myData.value = null;
    }
    
    try {
      // Dynamic import of the image
      const img = await import(`../assets/${props.path}`);
      imageSrc.value = img.default;
    } catch (e) {
      console.error(`Error loading image ${props.path}:`, e);
      imageSrc.value = '';
    }
  }
});
</script>

<template>

  <div v-if="myData" class="img-container">
    <img
        :src="imageSrc"
        :alt="props.path"
        draggable="false"
        @dragstart.prevent
        class="base-image"
    />

    <div
        v-for="(zone, name) in myData.zones"
        :key="name"
        class="clickable-area"
        :style="{
          top: zone.y + '%',
          left: zone.x + '%',
          width: zone.w + '%',
          height: zone.h + '%'
        }"
        @click="handleClick(zone)"
    ></div>
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