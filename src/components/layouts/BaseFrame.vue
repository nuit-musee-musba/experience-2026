<template>
  <div class="layout">
    <div class="layout-border layout-border__top"></div>
    <div class="layout-border layout-border__bottom"></div>
    <div class="layout-border layout-border__left"></div>
    <div class="layout-border layout-border__right"></div>

    <main class="main">
      <slot></slot>
    </main>

    <slot name="nav"></slot>
  </div>
</template>

<style lang="scss" scoped>
.layout {
  position: fixed;
  width: fit-content;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: white;

  .layout-border {
    position: fixed;
    z-index: 100;
    &__top, &__bottom { width: 100%; height: $border-width; }
    &__left, &__right { width: $border-width; height: 100%; }
    &__top { top: 0; left: 0; }
    &__bottom { bottom: 0; left: 0; }
    &__left { top: 0; left: 0; }
    &__right { top: 0; right: 0; }
  }

  .main {
    flex-grow: 1;
    overflow: hidden;
  }
}
</style>