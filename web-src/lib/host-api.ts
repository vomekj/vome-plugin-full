/**
 * 微应用调宿主 / 本插件网关（与 Admin 同域）
 * 开放：hostRequest / extPath / hostClientRequest（含无感 refresh）
 */

const TOKEN_KEY = 'vome_admin_access'
const REFRESH_KEY = 'vome_admin_refresh'

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

function getHostRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_KEY)
  } catch {
    return null
  }
}

function setHostTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_KEY, refreshToken)
}

function clearHostTokens() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

function isHostAuthFailure(
  status: number,
  message: string,
  path?: string,
  skipRefresh?: boolean,
): boolean {
  if (skipRefresh) return false
  if (path?.includes('/admin/base/auth/refresh')) return false
  if (status === 401) return true
  return /token|登录|未授权|鉴权|Unauthorized|unauthorized/i.test(message)
}

let refreshing: Promise<boolean> | null = null

async function tryRefreshHost(): Promise<boolean> {
  const refreshToken = getHostRefreshToken()
  if (!refreshToken) return false
  try {
    const res = await fetch(resolveHostUrl('/admin/base/auth/refresh'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    const json = (await res.json()) as {
      code?: number
      data?: { accessToken?: string; refreshToken?: string }
    }
    if (!res.ok || json.code !== 1000 || !json.data?.accessToken) {
      clearHostTokens()
      return false
    }
    setHostTokens(
      json.data.accessToken,
      json.data.refreshToken || refreshToken,
    )
    return true
  } catch {
    clearHostTokens()
    return false
  }
}

async function sharedRefreshHost(): Promise<boolean> {
  refreshing ??= tryRefreshHost().finally(() => {
    refreshing = null
  })
  return refreshing
}

type HostRequestInit = {
  method?: string
  body?: BodyInit | null
  headers?: HeadersInit
  skipRefresh?: boolean
}

/** 供 EPS configureClient；鉴权失败 → refresh 再重试 */
export async function hostClientRequest<T = unknown>(
  path: string,
  init?: HostRequestInit,
): Promise<T> {
  const method = (init?.method || 'GET').toUpperCase()
  const skipRefresh = Boolean(init?.skipRefresh)

  const doFetch = async (token: string | null) => {
    const headers = new Headers(init?.headers)
    if (!headers.has('content-type') && init?.body) {
      headers.set('content-type', 'application/json')
    }
    if (token) headers.set('authorization', `Bearer ${token}`)
    const res = await fetch(resolveHostUrl(path), {
      method,
      credentials: 'include',
      headers,
      body: init?.body ?? undefined,
    })
    const json = (await res.json()) as {
      code?: number
      message?: string
      data?: T
    }
    return { res, json }
  }

  const first = await doFetch(getHostAccessToken())
  if (first.json?.code === 1000) return first.json.data as T

  const firstMsg =
    first.json?.message || `请求失败 (${first.res.status})`
  if (!isHostAuthFailure(first.res.status, firstMsg, path, skipRefresh)) {
    throw new Error(firstMsg)
  }

  const ok = await sharedRefreshHost()
  if (!ok) throw new Error('登录已失效，请重新登录')

  const retry = await doFetch(getHostAccessToken())
  if (retry.json?.code === 1000) return retry.json.data as T

  const retryMsg =
    retry.json?.message || `请求失败 (${retry.res.status})`
  if (isHostAuthFailure(retry.res.status, retryMsg, path, false)) {
    clearHostTokens()
    throw new Error('登录已失效，请重新登录')
  }
  throw new Error(retryMsg)
}

export async function hostRequest<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  return hostClientRequest<T>(path, {
    method,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

export function extPath(subPath: string) {
  const p = subPath.startsWith('/') ? subPath : `/${subPath}`
  return `/admin/ext/${PLUGIN_KEY}${p}`
}
