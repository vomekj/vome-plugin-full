---
name: vome-plugin-full
description: >-
  全栈插件脚手架：invoke/ext + web-src Hash 路由 / Pinia /
  主题语种同步 / hostRequest / extPath / 可选 EPS。Use when developing plugins/vome-plugin-full.
---

# 全栈插件（vome-plugin-full）

> **目录**：`plugins/vome-plugin-full` · **示例 key**：`scaffold-full`  
> **规范（边界/强制）**：[规范.md](../../规范.md)

= 后端钩子 + 前端微应用；前端源码在 **`web-src/`**。

## 命令

```bash
cd plugins/vome-plugin-full
bun run dev:web
bun run build:web
bun run build:obfuscate
bun run pack   # 混淆后端 + build:web → .vome
```

联调在 Admin wujie；单独 Vite 无完整 token / bus。

微应用 `menus`：`appKey` = `key`，页面无 icon；挂侧栏 **「无界渲染」**。

## 开放封装用法

### 调本插件 ext / 调宿主

```ts
import { hostRequest, extPath } from '@/lib/host-api'
await hostRequest('GET', extPath('/hello'))       // → /admin/ext/{key}/hello
await hostRequest('GET', '/admin/base/auth/me')
// 鉴权失败无感 refresh（对齐 Admin）
```

| 方法 | 作用 |
|------|------|
| `PLUGIN_KEY` | 与 `module.json.key` 一致 |
| `hostRequest` | Bearer + `/dev`\|`/prod`；无感 refresh；`code===1000` → `data` |
| `hostClientRequest` | 同上；供 EPS |
| `extPath(subPath)` | 拼 `/admin/ext/{PLUGIN_KEY}{subPath}` |

### 可选 EPS

```ts
import { bootHostEps, service } from '@/lib/eps-client'
await bootHostEps()
```

公开依赖：`vome-core/client` 的 `configureClient` / `createEps` / `getService` / `clearEpsCache`。

### 后端被宿主调用

```ts
// handlers + module.json.routes → HTTP /admin/ext/{key}/…
// 宿主进程内：
await pluginInfoService.invoke('scaffold-full', 'ping')
```

后端骨架：

```ts
export class DemoPlugin extends BasePlugin {
  async ready() {}
  async ping() {}
}
export const Plugin = DemoPlugin
export const handlers = {
  async hello(ctx) { return { ok: true, adminId: ctx.adminId ?? null } },
}
```

混淆：`reservedNames` 含 `Plugin`、`handlers`、公开方法与 handler 名。

### 主题 / 语种

```ts
import { watchHostTheme } from '@/sync-host-theme'
import { watchHostLocale } from '@/sync-host-locale'
onMounted(() => {
  stopTheme = watchHostTheme()
  stopLocale = watchHostLocale()
})
```

```ts
import { usePluginLocale } from '@/lib/locale'
const { t } = usePluginLocale()
```

### 新页面

`web-src/pages/<path>/index.vue` → `/#/<path>`。

## 排错

| 现象 | 排查 |
|------|------|
| 401 | 未登录；非 wujie 同域 |
| ext 404 | routes / handlers / key；模块未启用 |
| invoke 无方法 | `reservedNames`；未启用 |
| 主题 / 语种异常 | 未挂 `watchHostTheme` / `watchHostLocale` |
| EPS 空 | 宿主未开 `vome.eps`；改用 `hostRequest` |
| 菜单空白 | `appKey` ≠ `key` |

## IDE

Snippets：`.vscode/plugin.code-snippets`（`plugin-fetch` / `plugin-fetch-ext` / `plugin-eps` / `plugin-t` / `plugin-invoke`）。
