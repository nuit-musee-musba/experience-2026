<template>
  <IdleView @idle="resetApplication">
    <div class="app-container">
      <CreditsOverlay @close="showCredits = false" />
      <router-view />

      <transition name="fade">
        <HomeOverlay v-if="showHome" @start="startExperience" />
      </transition>
    </div>
  </IdleView>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import IdleView from "@/components/IdleView.vue";
import HomeOverlay from "@/components/HomeOverlay.vue";
import CreditsOverlay from "@/components/CreditsOverlay.vue";

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

const showCredits = ref(false);
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
