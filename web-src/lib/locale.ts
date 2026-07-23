/**
 * 插件微应用多语言：源包 locales/zh-CN.json，译包拉宿主 i18n
 */
import { computed, onMounted, ref, type ComputedRef, type Ref } from 'vue'
import { hostRequest, PLUGIN_KEY } from './host-api'
import zhCN from '../../locales/zh-CN.json'

export type I18nLangItem = {
  code: string
  name: string
  flag?: string
}

export type PluginLocalePack = {
  langCode: string
  scopeType: string
  scopeKey: string
  version?: number
  packJson: Record<string, unknown>
} | null

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

export async function fetchEnabledLangs(): Promise<I18nLangItem[]> {
  try {
    const list = await hostRequest<I18nLangItem[]>(
      'GET',
      '/admin/i18n/lang/enabled',
    )
    if (Array.isArray(list) && list.length) return list
  } catch {
    /* fallback */
  }
  return [{ code: 'zh-CN', name: '简体中文', flag: '🇨🇳' }]
}

export type UsePluginLocaleResult = {
  pluginKey: string
  locale: Ref<string>
  langs: Ref<I18nLangItem[]>
  messages: Ref<Record<string, unknown>>
  localeLoading: Ref<boolean>
  t: ComputedRef<(key: string, fallback?: string) => string>
  currentFlag: ComputedRef<string>
  setLocale: (code: string) => Promise<void>
  init: () => Promise<void>
}

/**
 * @param pluginKey module.json.key（默认取 host-api.PLUGIN_KEY）
 * @param sourceZh 本地 zh-CN 源
 */
export function usePluginLocale(
  pluginKey: string = PLUGIN_KEY,
  sourceZh: Record<string, unknown> = zhCN as Record<string, unknown>,
): UsePluginLocaleResult {
  const storageKey = `vome_plugin_locale_${pluginKey}`
  const locale = ref(localStorage.getItem(storageKey) || 'zh-CN')
  const langs = ref<I18nLangItem[]>([
    { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  ])
  const messages = ref<Record<string, unknown>>({ ...sourceZh })
  const localeLoading = ref(false)
  const t = computed(() => createT(messages.value))
  const currentFlag = computed(() => {
    const hit = langs.value.find((l) => l.code === locale.value)
    return hit?.flag || '🏳️'
  })

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
    if (localeLoading.value) return
    const next = String(code || '').trim() || 'zh-CN'
    localeLoading.value = true
    try {
      locale.value = next
      localStorage.setItem(storageKey, next)
      await loadPack(next)
    } finally {
      localeLoading.value = false
    }
  }

  async function init() {
    try {
      langs.value = await fetchEnabledLangs()
    } catch {
      /* keep default */
    }
    if (!langs.value.some((l) => l.code === locale.value)) {
      locale.value = 'zh-CN'
      localStorage.setItem(storageKey, 'zh-CN')
    }
    await loadPack(locale.value)
  }

  onMounted(() => {
    void init()
  })

  return {
    pluginKey,
    locale,
    langs,
    messages,
    localeLoading,
    t,
    currentFlag,
    setLocale,
    init,
  }
}
