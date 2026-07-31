/**
 * 跟随 Admin 全局语种（禁止插件内切语言按钮）
 * props.locale + bus `vome-host-locale`；同源可读 `vome_admin_locale`
 */
import { usePluginLocale } from '@/lib/locale'

export const HOST_LOCALE_KEY = 'vome_admin_locale'
export const MICRO_LOCALE_EVENT = 'vome-host-locale'

type HostLocalePayload = { locale?: string }
type WujieBridge = {
  props?: { locale?: string }
  bus?: {
    $on: (event: string, cb: (payload: never) => void) => void
    $off: (event: string, cb: (payload: never) => void) => void
  }
}

function wujie(): WujieBridge | undefined {
  return (window as Window & { $wujie?: WujieBridge }).$wujie
}

export function readHostLocale(): string {
  const fromProps = wujie()?.props?.locale
  if (typeof fromProps === 'string' && fromProps.trim()) {
    return fromProps.trim()
  }
  try {
    return localStorage.getItem(HOST_LOCALE_KEY)?.trim() || 'zh-CN'
  } catch {
    return 'zh-CN'
  }
}

/** 监听宿主语种：bus + 初始 props / localStorage */
export function watchHostLocale(): () => void {
  const { setLocale } = usePluginLocale()
  void setLocale(readHostLocale())

  const onBus = (payload: HostLocalePayload | string) => {
    const code =
      typeof payload === 'string'
        ? payload
        : String(payload?.locale || '').trim()
    if (code) void setLocale(code)
  }

  const w = wujie()
  const handler = onBus as (payload: never) => void
  w?.bus?.$on(MICRO_LOCALE_EVENT, handler)

  return () => {
    w?.bus?.$off(MICRO_LOCALE_EVENT, handler)
  }
}
