/**
 * 插件微应用多语言：源包 locales/zh-CN.json，非 zh-CN 拉宿主译包
 * 语种跟随 Admin（props / bus），禁止插件内切语言 UI
 */
import { computed, ref, type ComputedRef, type Ref } from 'vue'
import { hostRequest, PLUGIN_KEY } from './host-api'
import zhCN from '../../locales/zh-CN.json'

export type PluginLocalePack = {
  langCode: string
  scopeType: string
  scopeKey: string
  version?: number
  packJson: Record<string, unknown>
} | null

export type UsePluginLocaleResult = {
  pluginKey: string
  locale: Ref<string>
  messages: Ref<Record<string, unknown>>
  localeLoading: Ref<boolean>
  t: ComputedRef<(key: string, fallback?: string) => string>
  setLocale: (code: string) => Promise<void>
  init: () => Promise<void>
}

function getByPath(obj: unknown, path: string): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined
  const parts = path.split('.').filter(Boolean)
  let cur: unknown = obj
  for (const p of parts) {
    if (!cur || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[p]
  }
  return typeof cur === 'string' ? cur : undefined
}

export function createT(messages: Record<string, unknown>) {
  return (key: string, fallback?: string) => {
    const v = getByPath(messages, key)
    return v != null && v !== '' ? v : (fallback ?? key)
  }
}

export async function fetchPluginPack(
  pluginKey: string,
  langCode: string,
): Promise<PluginLocalePack> {
  const q = new URLSearchParams({
    langCode,
    scopeType: 'plugin',
    scopeKey: pluginKey,
  })
  return hostRequest<PluginLocalePack>(
    'GET',
    `/admin/i18n/pack/active?${q.toString()}`,
  )
}

let shared: UsePluginLocaleResult | null = null

/**
 * 单例：App 经 sync-host-locale 驱动 setLocale；页面只用 t('a.b')
 */
export function usePluginLocale(
  pluginKey: string = PLUGIN_KEY,
  sourceZh: Record<string, unknown> = zhCN as Record<string, unknown>,
): UsePluginLocaleResult {
  if (shared) return shared

  const locale = ref('zh-CN')
  const messages = ref<Record<string, unknown>>({ ...sourceZh })
  const localeLoading = ref(false)
  const t = computed(() => createT(messages.value))

  async function loadPack(code: string) {
    if (code === 'zh-CN') {
      messages.value = { ...sourceZh }
      return
    }
    try {
      const pack = await fetchPluginPack(pluginKey, code)
      messages.value = pack?.packJson
        ? { ...pack.packJson }
        : { ...sourceZh }
    } catch {
      messages.value = { ...sourceZh }
    }
  }

  async function setLocale(code: string) {
    const next = String(code || '').trim() || 'zh-CN'
    if (localeLoading.value) return
    localeLoading.value = true
    try {
      locale.value = next
      await loadPack(next)
    } finally {
      localeLoading.value = false
    }
  }

  async function init() {
    await loadPack(locale.value)
  }

  shared = {
    pluginKey,
    locale,
    messages,
    localeLoading,
    t,
    setLocale,
    init,
  }
  return shared
}
