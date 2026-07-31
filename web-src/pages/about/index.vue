<template>
  <main class="page">
    <h1>About</h1>
    <p class="hint">由 <code>web-src/pages/about/index.vue</code> 自动生成路由 <code>/#/about</code></p>
    <RouterLink class="link" to="/">← 返回首页</RouterLink>
  </main>
</template>

<script setup lang="ts">
defineOptions({ name: 'AboutPage' })
</script>

<style scoped>
.page {
  min-height: 100%;
  margin: 0;
  box-sizing: border-box;
  padding: 2rem 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  text-align: center;
  font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
  background: transparent;
  color: var(--foreground, #50566b);
}
h1 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--brand, #4e5dff);
}
.hint {
  margin: 0;
  max-width: 28rem;
  font-size: 0.875rem;
  color: var(--muted-foreground, #7a8199);
  line-height: 1.5;
}
code {
  font-size: 0.85em;
  padding: 0.1em 0.35em;
  border-radius: 4px;
  background: var(--secondary, #eef0ff);
  color: var(--foreground, #50566b);
}
.link {
  color: var(--brand, #4e5dff);
  text-decoration: none;
  font-weight: 600;
}
.link:hover {
  text-decoration: underline;
}
</style>
