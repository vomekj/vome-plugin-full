<template>
  <main class="page" @click="closeLocaleMenu">
    <div class="locale-bar" @click.stop>
      <button
        type="button"
        class="locale-btn"
        :title="t('common.locale', '语言')"
        :disabled="localeLoading"
        :aria-expanded="localeOpen"
        @click="localeOpen = !localeOpen"
      >
        <span class="locale-flag" aria-hidden="true">{{ currentFlag }}</span>
      </button>
      <div v-if="localeOpen" class="locale-menu" role="listbox">
        <button
          v-for="lang in langs"
          :key="lang.code"
          type="button"
          class="locale-item"
          role="option"
          :aria-selected="locale === lang.code"
          :disabled="localeLoading || locale === lang.code"
          @click="onPickLocale(lang.code)"
        >
          <span class="locale-flag" aria-hidden="true">{{ lang.flag || '🏳️' }}</span>
          <span class="locale-label">{{ lang.name }}</span>
          <span v-if="locale === lang.code" class="locale-check" aria-hidden="true">✓</span>
        </button>
      </div>
    </div>
    <h1>{{ t('app.name', '脚手架全栈') }}</h1>
    <p class="hint">{{ t('app.hint', '全栈微应用 · /vome/apps/scaffold-full/') }}</p>
    <p class="hint">
      {{ t('app.hostHint') }}
      <code>/admin/ext/{{ pluginKey }}/…</code>
    </p>
    <div class="actions">
      <button type="button" class="btn" :disabled="!!loading" @click="callExt">
        {{ loading === 'ext' ? t('common.loading', '请求中…') : t('common.callExt', '调本插件 GET …/hello') }}
      </button>
      <button type="button" class="btn btn--muted" :disabled="!!loading" @click="probeHost">
        {{ loading === 'host' ? t('common.loading', '请求中…') : t('common.probe', '探测宿主 /auth/me') }}
      </button>
    </div>
    <pre v-if="result" class="result">{{ result }}</pre>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { extPath, hostRequest, PLUGIN_KEY } from './lib/host-api'
import { usePluginLocale } from './lib/locale'

defineOptions({ name: 'App' })

const pluginKey = PLUGIN_KEY
const loading = ref<false | 'ext' | 'host'>(false)
const result = ref('')
const localeOpen = ref(false)

const {
  locale,
  langs,
  localeLoading,
  t,
  currentFlag,
  setLocale,
} = usePluginLocale()

function closeLocaleMenu() {
  localeOpen.value = false
}

async function onPickLocale(code: string) {
  localeOpen.value = false
  await setLocale(code)
}

async function callExt() {
  if (loading.value) return
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
  if (loading.value) return
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
  position: relative;
}

.locale-bar {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 20;
}

.locale-btn {
  display: inline-flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 10px;
  background: #eef0f8;
  cursor: pointer;
}

.locale-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.locale-btn:hover:not(:disabled) {
  background: #e4e7f2;
}

.locale-flag {
  font-size: 18px;
  line-height: 1;
}

.locale-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 11rem;
  padding: 4px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #e6e9f2;
  box-shadow: 0 8px 24px rgb(26 29 38 / 10%);
}

.locale-item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #1a1d26;
  font-size: 12px;
  text-align: left;
  cursor: pointer;
}

.locale-item:hover:not(:disabled) {
  background: #f5f7fb;
}

.locale-item:disabled {
  opacity: 0.85;
  cursor: default;
}

.locale-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.locale-check {
  color: #4e5dff;
  font-size: 12px;
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
