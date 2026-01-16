<template>
  <div class="layout">
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

  .main {
    flex-grow: 1;
    overflow: hidden;
  }
}
</style>