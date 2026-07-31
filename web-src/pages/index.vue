<template>
  <main class="page">
    <h1>{{ t('app.name', '脚手架全栈') }}</h1>
    <p class="hint">{{ t('app.hint', '全栈微应用 · /vome/apps/scaffold-full/') }}</p>
    <p class="hint">
      {{ t('app.hostHint') }}
      <code>/admin/ext/{{ pluginKey }}/…</code>
    </p>
    <p class="hint">
      <RouterLink class="link" to="/about">自动路由示例 → /about</RouterLink>
    </p>
    <div class="actions">
      <button type="button" class="btn" :disabled="!!loading" @click="callExt">
        {{ loading === 'ext' ? t('common.loading', '请求中…') : t('common.callExt', '调本插件 GET …/hello') }}
      </button>
      <button type="button" class="btn btn--muted" :disabled="!!loading" @click="probeHost">
        {{ loading === 'host' ? t('common.loading', '请求中…') : t('common.probe', '探测宿主 /auth/me') }}
      </button>
      <button type="button" class="btn btn--muted" :disabled="!!loading" @click="probeEps">
        {{ loading === 'eps' ? t('common.loading', '请求中…') : t('common.probeEps', 'EPS service 探测') }}
      </button>
    </div>
    <pre v-if="result" class="result">{{ result }}</pre>
  </main>
</template>

<script setup lang="ts">
import { bootHostEps, service } from '@/lib/eps-client'
import { extPath, hostRequest, PLUGIN_KEY } from '@/lib/host-api'
import { usePluginLocale } from '@/lib/locale'

defineOptions({ name: 'HomePage' })

const pluginKey = PLUGIN_KEY
const loading = ref<false | 'ext' | 'host' | 'eps'>(false)
const result = ref('')
const { t } = usePluginLocale()

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

async function probeEps() {
  if (loading.value) return
  loading.value = 'eps'
  result.value = ''
  try {
    await bootHostEps()
    const root = service as Record<string, unknown>
    const keys = Object.keys(root).filter((k) => !k.startsWith('_')).slice(0, 20)
    result.value = JSON.stringify(
      { ok: true, tip: 'bootHostEps 成功；可用 service.<module>…', modules: keys },
      null,
      2,
    )
  } catch (e) {
    result.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}
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
  transition:
    color 0.28s ease,
    background-color 0.28s ease,
    border-color 0.28s ease;
}

h1 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--brand, #4e5dff);
}

.hint {
  margin: 0;
  max-width: 32rem;
  font-size: 0.875rem;
  color: var(--muted-foreground, #7a8199);
  line-height: 1.5;
}

.link {
  color: var(--brand, #4e5dff);
  text-decoration: none;
  font-weight: 600;
}

.link:hover {
  text-decoration: underline;
}

code {
  font-size: 0.8em;
  padding: 0.1em 0.35em;
  border-radius: 4px;
  background: var(--secondary, #eef0ff);
  color: var(--foreground, #50566b);
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
  background: var(--brand, #4e5dff);
  color: #fff;
  font-size: 0.875rem;
  cursor: pointer;
}

.btn--muted {
  background: var(--muted-foreground, #7a8199);
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
  background: var(--secondary, #eef0ff);
  color: var(--foreground, #50566b);
  border-radius: 8px;
  border: 1px solid var(--border, #e4e8f2);
  overflow: auto;
}
</style>
