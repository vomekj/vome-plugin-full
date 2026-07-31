import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'

/**
 * 自动路由（同 web）：扫描 pages 下全部 .vue
 * - pages/index.vue → /
 * - pages/home/index.vue → /home
 * - 文件名以 _ 开头的跳过（局部组件）
 * wujie 内用 hash，避免与宿主 history 抢路径
 */
const pageModules = import.meta.glob('../pages/**/*.vue')

function routePathFromKey(key: string): string | null {
  const m = key.match(/^\.\.\/pages\/(.+)\.vue$/)
  if (!m?.[1]) return null
  let rel = m[1].replace(/\\/g, '/')
  const base = rel.split('/').pop() || ''
  if (base.startsWith('_')) return null
  if (rel.endsWith('/index')) rel = rel.slice(0, -'/index'.length)
  if (rel === 'index' || rel === '') return '/'
  return `/${rel}`
}

function buildRoutes(): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = []
  for (const [key, loader] of Object.entries(pageModules)) {
    const path = routePathFromKey(key)
    if (!path) continue
    const name = path === '/' ? 'index' : path.slice(1).replace(/\//g, '-')
    routes.push({
      path,
      name,
      component: loader,
    })
  }
  routes.sort((a, b) => String(a.path).localeCompare(String(b.path)))
  return routes
}

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: buildRoutes(),
})

export default router
