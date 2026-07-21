<template>
  <main class="page">
    <h1>scaffold-full</h1>
    <p class="hint">全栈微应用 · /vome/apps/scaffold-full/</p>
    <p class="hint">
      后端：invoke / handlers。前端：hostRequest 调宿主或本插件
      <code>/admin/ext/{{ pluginKey }}/…</code>
    </p>
    <div class="actions">
      <button type="button" class="btn" :disabled="loading" @click="callExt">
        {{ loading === 'ext' ? '请求中…' : '调本插件 GET …/hello' }}
      </button>
      <button type="button" class="btn btn--muted" :disabled="!!loading" @click="probeHost">
        {{ loading === 'host' ? '请求中…' : '探测宿主 /auth/me' }}
      </button>
    </div>
    <pre v-if="result" class="result">{{ result }}</pre>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { extPath, hostRequest, PLUGIN_KEY } from './lib/host-api'

defineOptions({ name: 'App' })

const pluginKey = PLUGIN_KEY
const loading = ref<false | 'ext' | 'host'>(false)
const result = ref('')

async function callExt() {
  loading.value = 'ext'
  result.value = ''
  try {
    const data = await hostRequest('GET', extPath('/hello'))
    result.value = JSON.stringify(data, null, 2)
  } catch (e) {
    result.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

async function probeHost() {
  loading.value = 'host'
  result.value = ''
  try {
    const data = await hostRequest('GET', '/admin/base/auth/me')
    result.value = JSON.stringify(data, null, 2)
  } catch (e) {
    result.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
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
  background: #f5f7fb;
  color: #1a1d26;
}

h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #4e5dff;
}

.hint {
  margin: 0;
  max-width: 32rem;
  font-size: 0.875rem;
  opacity: 0.75;
  line-height: 1.5;
}

code {
  font-size: 0.8em;
  padding: 0.1em 0.35em;
  border-radius: 4px;
  background: #eef0f8;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  background: #4e5dff;
  color: #fff;
  font-size: 0.875rem;
  cursor: pointer;
}

.btn--muted {
  background: #5b6478;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.result {
  margin: 0.75rem 0 0;
  max-width: 36rem;
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.75rem;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e5e7ef;
  overflow: auto;
}
</style>
