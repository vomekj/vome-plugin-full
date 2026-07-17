<template>
  <main class="page">
    <h1>scaffold-full</h1>
    <p>Vue3 全栈微应用已挂载（/vome/apps/scaffold-full/）</p>
  </main>
</template>

<script setup lang="ts">
defineOptions({ name: 'App' })
</script>

<style scoped>
.page {
  min-height: 100vh;
  margin: 0;
  display: grid;
  place-items: center;
  text-align: center;
  font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
  background: #f5f7fb;
  color: #1a1d26;
}

h1 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  color: #4e5dff;
}

p {
  margin: 0;
  opacity: 0.75;
}
</style>
