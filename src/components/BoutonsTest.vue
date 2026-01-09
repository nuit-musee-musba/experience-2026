<script setup>
import Button from './Button.vue';
import ArrowBack from '@/assets/icons/arrow-back.svg?component';
import ArrowRight from '@/assets/icons/arrow-right.svg?component';

const colors = ['primary-pink', 'primary-blue', 'secondary', 'tertiary'];
</script>
<template>
  <div class="test-container">
    <h1>Tests Boutons</h1>

    <div class="variants-grid">
      <div v-for="color in colors" :key="color" class="variant-row">
        <h2>{{ color }}</h2>

        <div class="button-group">
          <Button :color="color" text-content="Bouton" />

          <Button :color="color" :icon-primary="true" text-content="Bouton">
            <template #icon-primary>
              <ArrowBack class="icon-svg" />
            </template>
          </Button>

          <!-- Icon Right (Secondary) -->
          <Button :color="color" :icon-secondary="true" text-content="Suivant">
            <template #icon-secondary>
              <ArrowRight class="icon-svg" />
            </template>
          </Button>

          <!-- Icon Only with secondary (just to test) -->
          <Button :color="color" :icon-only="true" :icon-secondary="true">
            <template #icon-secondary>
              <ArrowRight class="icon-svg" />
            </template>
          </Button>

          <!-- Disabled -->
          <Button :color="color" state="disable" text-content="Désactivé" />
        </div>
      </div>
    </div>
  </div>
</template>