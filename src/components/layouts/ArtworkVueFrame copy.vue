<template>
  <div class="layout">
    <div class="spacing-div" role="presentation"></div>
    <div class="layout-border layout-border__top" role="presentation"></div>
    <div class="layout-border layout-border__bottom" role="presentation"></div>
    <div class="layout-border layout-border__left" role="presentation"></div>
    <div class="layout-border layout-border__right" role="presentation"></div>
    <main class="main">
      <slot></slot>
    </main>
    <nav class="nav">
      <div class="nav-buttons">
        <Button color="secondary" icon-only icon-primary>
          <template #icon-primary>
            <IconMap />
          </template>
        </Button>

        <Button color="secondary" text-content="Retour aux lieux" icon-primary>
          <template #icon-primary>
            <IconPin />
          </template>
        </Button>
      </div>

      <div class="nav-buttons">


        <Button color="secondary" text-content="Oeuvre précédente" icon-primary>
          <template #icon-primary>
            <IconArrowLeft />
          </template>
        </Button>

        <Button color="secondary" text-content="Oeuvre suivante" icon-secondary>
          <template #icon-secondary>
            <IconArrowRight />
          </template>
        </Button>

        <Button color="secondary" icon-only icon-primary>
          <template #icon-primary>
            <IconGallery />
          </template>
        </Button>
      </div>
    </nav>
  </div>
</template>

<script setup>
import Button from '../buttons/Button.vue';
import IconMap from '../icons/IconMap.vue';
import IconArrowLeft from '../icons/IconArrowLeft.vue';
import IconArrowRight from '../icons/IconArrowRight.vue';
import IconGallery from '../icons/IconGallery.vue';
import IconPin from '../icons/IconPin.vue';
</script>

<style lang="scss" scoped>
$border-color: $black;

.layout {
  position: fixed;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  background: $white;

  display: flex;
  flex-direction: column;

  .layout-border {
    position: fixed;
    background-color: $border-color;
    z-index: 10;

    &__top,
    &__bottom {
      width: 100%;
      height: 5px;
    }

    &__left,
    &__right {
      width: 5px;
      height: 100%;
    }

    &__top {
      top: 0;
      left: 0;
    }

    &__bottom {
      bottom: 0;
      left: 0;
    }

    &__left {
      top: 0;
      left: 0;
    }

    &__right {
      top: 0;
      right: 0;
    }
  }

  .spacing-div {
    position: relative;
    width: 100%;
    height: 56px;
    border: 5px solid $border-color;
    border-bottom: 8px solid $border-color;
    z-index: 9999;
  }

  .main {
    flex-grow: 1;
    overflow: hidden;
    height: 0;
  }

  .nav {
    display: flex;
    padding: 42px 144px;
    border: 5px solid $border-color;
    border-top: 8px solid $border-color;
  }

  .nav-buttons {
    display: flex;
    gap: 40px;

    &:first-child {
      margin-right: auto;
    }
  }
}
</style>