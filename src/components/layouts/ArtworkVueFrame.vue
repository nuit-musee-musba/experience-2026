<template>
  <div class="layout layout-artwork">
    <div class="layout-border layout-border__top" role="presentation"></div>
    <div class="layout-border layout-border__bottom" role="presentation"></div>
    <div class="layout-border layout-border__left" role="presentation"></div>
    <div class="layout-border layout-border__right" role="presentation"></div>

    <main class="main">
      <slot></slot>
    </main>

  </div>
</template>

<style lang="scss" scoped>
.layout {
  position: fixed;
  inset: 0;
  z-index: 20; // Au-dessus de la map
  background: white;
  display: flex;
  flex-direction: column;

  .layout-border {
    position: fixed;
    background-color: $black;
    z-index: 100;
    &__top, &__bottom { width: 100%; height: $border-width; }
    &__left, &__right { width: $border-width; height: 100%; }
    &__top { top: 0; }
    &__bottom { bottom: 0; }
    &__left { left: 0; }
    &__right { right: 0; }
  }

  .main {
    z-index: 10;
    flex-grow: 1;
    overflow-y: auto;
  }
}
</style>