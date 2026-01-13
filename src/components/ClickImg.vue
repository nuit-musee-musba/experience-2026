<script setup>
import {computed, ref, watch, onUnmounted} from 'vue';
import hotAreaData from '@/assets/hot-area.json';


const props = defineProps({
  path: {
    type: String,
    required: true
  }
});

const zoom = ref(1)
const activeArea = ref(null)
const showOverlay = ref(false)

watch(showOverlay, (value) => {
  if (value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
})


const myData = computed(() => {
  return hotAreaData.find(item => item.image === props.path);
});

const imageSrc = computed(() => {
  return `/images/${props.path}`;
});

const imageStyle = computed(() => ({
  transform: `translate(${50 - (activeArea.value?.x + activeArea.value?.w / 2 || 50)}%, ${50 - (activeArea.value?.y + activeArea.value?.h / 2 || 50)}%) scale(${zoom.value})`,
  transformOrigin: `${activeArea.value?.x + activeArea.value?.w / 2 || 50}% ${activeArea.value?.y + activeArea.value?.h / 2 || 50}%`
}))

const handleClick = (area) => {
  activeArea.value = area
  showOverlay.value = true
  // Calculate zoom to fit both width and height. area.w and area.h are in percentage of the image.
  // We want the area to fill at most roughly 90% of the visible container.
  const zoomW = 90 / area.w
  const zoomH = 90 / area.h
  zoom.value = Math.min(zoomW, zoomH)
}

const closeOverlay = () => {
  showOverlay.value = false
  zoom.value = 1
}


</script>

<template>

  <div v-if="myData" class="img-container">
    <img :alt="props.path" :src="imageSrc" class="base-image" draggable="false" @dragstart.prevent/>
    <div v-for="(area, name) in myData.areas" :key="name" :style="{
      top: area.y + '%',
      left: area.x + '%',
      width: area.w + '%',
      height: area.h + '%'
    }" class="clickable-area" @click="handleClick(area)"></div>
  </div>
  <div v-if="showOverlay" class="overlay" @click.self="closeOverlay">
    <div class="overlay-content">
      <div class="overlay-image-container">
        <img
            :src="imageSrc"
            :style="imageStyle"
            class="overlay-image"
            alt="imageAlt"
        />
      </div>

      <div class="overlay-bottom-container">
        <div class="overlay-text">
          {{ activeArea.text }}
        </div>
        <button class="close-btn" @click="closeOverlay">Fermer</button>
      </div>
    </div>
  </div>


</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;



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
  cursor: pointer;
  background-color: rgba(255, 0, 0, 0.4);
}

.overlay {
  font-family: $font-family-sans-serif;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .overlay-content{
    max-width: 90vw;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    gap: 80px;

    .overlay-image-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: #eee;

      .overlay-image {
        max-width: 100%;
        max-height: 80vh;
        display: block;
        transition: transform 0.4s ease;
      }
    }

    .overlay-bottom-container {
      display: flex;
      flex-direction: column;

      .overlay-text {
        position: relative;
        padding: 80px 56px;
        font-family: serif;
        line-height: 1.6;
        background: #fff;
      }

      .close-btn {
        margin-top: auto;
        align-self: flex-end;
        bottom: 0;
        right: 0;
        background: #000;
        color: #fff;
        padding: 16px 32px;
        transform: translateY(-50%) translateX(50%);
      }
    }


  }

}


</style>