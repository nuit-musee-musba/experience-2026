<template>
  <IdleView @idle="resetApplication">
    <div class="app-container">
      <CreditsOverlay />
      <router-view />

      <transition name="fade">
        <HomeOverlay v-if="showHome" @start="startExperience" />
      </transition>
    </div>
  </IdleView>

  <RotateDevice />
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import IdleView from "@/components/IdleView.vue";
import HomeOverlay from "@/components/HomeOverlay.vue";
import CreditsOverlay from "@/components/CreditsOverlay.vue";
import RotateDevice from "@/components/RotateDevice.vue";

const router = useRouter();
const showHome = ref(true);

const startExperience = () => {
  showHome.value = false;
};

const resetApplication = () => {
  showHome.value = true;
  if (router.currentRoute.value.path !== "/") {
    router.push("/");
  }
};

</script>

<style scoped>
.app-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.page {
  padding: 40px;
}

.open-btn {
  padding: 12px 20px;
  background: black;
  color: white;
  border: none;
  cursor: pointer;
}
</style>
