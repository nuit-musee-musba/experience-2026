<template>
  <div class="home-overlay">
    
    <div class="background-layer">
      <img src="@/assets/img/bg-hp.png" alt="Fresque Jean Dupas" class="bg-img" />
    </div>

    <div class="top-logo-box">
      <span class="label-create">réalisé par</span>
      <img src="@/assets/img/logo-mmi.png" alt="Logo MMI Bordeaux" class="logo-img" />
    </div>

    <div class="intro-card">
      <div class="card-content">
        
        <h1 class="main-title">
          Les grands décors<br>de Jean Dupas
        </h1>
        
        <p class="description-text">
          La contribution de Jean Dupas au domaine artistique est plus vaste que
          ce que présente l'exposition. Découvrez davantage de son œuvre et de
          ses collaborations à travers notre carte interactive.
        </p>

        <div class="cta-container">
          <Button 
            class="start-btn"
            color="place" 
            text-content="Commencer" 
            icon-secondary 
            @click="$emit('start')"
          >
            <template #icon-secondary>
              <IconArrowRight />
            </template>
          </Button>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import Button from '@/components/buttons/Button.vue';
import IconArrowRight from '@/components/icons/IconArrowRight.vue';
</script>

<style scoped lang="scss">
@use "@/styles/variables" as *;
@use "@/styles/colors" as *;
@use "@/styles/utils" as *;
@use "@/styles/typography" as *;

.home-overlay {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 5000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: $gray-200;
}

.background-layer {
  position: absolute;
  /* Modification : on colle l'élément en bas au lieu de remplir tout l'écran */
  bottom: 0;
  left: 0;
  width: 100%;
  height: auto; /* La hauteur s'adapte à l'image */
  
  /* Correction : z-index doit être inférieur au contenu (card intro) */
  z-index: 0;

  .bg-img {
    width: 100%;
    height: auto;
    display: block; /* Évite les marges fantômes en bas des images */
    object-fit: cover;
    object-position: bottom;
  }
}

.top-logo-box {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
  
  background-color: $white;
  @include border-5;
  
  padding: $spacing-32 $spacing-40; 
  
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-8;

  .label-create {
    font-family: $font-family-sans-serif;
    font-size: 18px; 
    text-transform: uppercase;
    font-weight: 500;
    color: $black;
  }

  .logo-img {
    height: 60px; 
    width: auto;
    display: block;
  }
}

.intro-card {
  position: relative;
  z-index: 5;
  background-color: $white;
  
  @include border-5; 
  
  width: 60vw;
  max-width:2200px;
  padding: $spacing-80; 

  @media (max-width: 1024px) {
    width: 85vw;
    padding: $spacing-40;
  }
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: $spacing-40;
  text-align: left;
}

.main-title {
  @include title-h1;
  color: $black;
  margin: 0; 
  word-break: normal;

  @media (max-width: 768px) {
    font-size: 50px;
  }
}

.description-text {
  @include text-body;
  color: $black;
  max-width: 90%;
  margin-top: $spacing-16;
}

.cta-container {
  margin-top: $spacing-32;
  display: flex;
  justify-content: flex-start;
}

:deep(.btn__icon svg) {
  width: 32px;
  height: 32px;
}
</style>