<template>
  <IdleView @idle="resetApplication">
    <div class="app-container">
      
      <router-view />

      <transition name="fade">
        <HomeOverlay v-if="showHome" @start="startExperience" />
      </transition>

    </div>
  </IdleView>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import IdleView from "@/components/IdleView.vue";
import HomeOverlay from "@/components/HomeOverlay.vue";

const router = useRouter();
const showHome = ref(true);

const startExperience = () => {
  showHome.value = false;
};

const resetApplication = () => {
  showHome.value = true;
  if (router.currentRoute.value.path !== '/') {
    router.push('/');
  }
};
</script>

<style scoped>
.app-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>