/**
 * 微应用调宿主 / 本插件网关（与 Admin 同域）
 * 鉴权与路径规则同纯前端脚手架 host-api。
 */

const TOKEN_KEY = 'vome_admin_access'

/** 须与 module.json.key 一致 */
export const PLUGIN_KEY = 'scaffold-full'

function apiBase(): string {
  if (typeof location === 'undefined') return ''
  if (location.pathname.startsWith('/dev/')) return '/dev'
  if (location.pathname.startsWith('/prod/')) return '/prod'
  return ''
}

export function resolveHostUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path
  const base = apiBase()
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

export function getHostAccessToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export async function hostRequest<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const headers = new Headers()
  const token = getHostAccessToken()
  if (token) headers.set('authorization', `Bearer ${token}`)
  if (body !== undefined) headers.set('content-type', 'application/json')

  const res = await fetch(resolveHostUrl(path), {
    method,
    credentials: 'include',
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const json = (await res.json()) as {
    code?: number
    message?: string
    data?: T
  }
  if (json.code !== 1000) {
    throw new Error(json.message || `请求失败 (${res.status})`)
  }
  return json.data as T
}

export function extPath(subPath: string) {
  const p = subPath.startsWith('/') ? subPath : `/${subPath}`
  return `/admin/ext/${PLUGIN_KEY}${p}`
}
