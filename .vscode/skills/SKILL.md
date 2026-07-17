---
name: scaffold-full
description: >-
  全栈插件脚手架完整用法：BasePlugin + Vue3 web-src、hook/invoke/routes、menus/wujie、打包注意点。
  Use when developing plugins/scaffold-full or a full-stack .vome plugin.
---

# 全栈插件脚手架（scaffold-full）

同时带 **后端钩子（server）** 与 **前端微应用（web）**。复制本目录后分别改 `src/`（后端）与 `web-src/`（前端），一次 `pack` 打出完整 `.vome`。

## 能做什么

| 能力 | 说明 |
|------|------|
| 钩子 + 公开方法 | 同纯后端：`Plugin` / `ready` / `invoke` / `getInstance` |
| HTTP handlers | 可选 `handlers` + `routes` → `/admin/ext/{key}/…` |
| 微应用 | `web/` + `menus.appKey` → wujie → `/vome/apps/{key}/` |
| 环境配置 | `config.@local` / `@prod` → `this.pluginInfo.config` |
| 缓存 | `this.cache`（宿主注入时） |

= scaffold-service 的后端能力 + scaffold-front 的前端能力（前端源码目录名为 **`web-src/`**，因为 `src/` 已给后端）。

## 命令

```bash
cd plugins/scaffold-full
bun install

bun run dev:web       # 前端 Vite（web-src/）
bun run build         # 后端 → server/index.js
bun run build:web     # 前端 → web/
bun run build:obfuscate
bun run pack          # 混淆后端 + build:web → release/scaffold-full.vome
```

改 `key` 时同步改 `pack` 输出文件名。

## 目录与产物

| 路径 | 用途 |
|------|------|
| `module.json` | 清单（hook、config、menus、routes…） |
| `src/index.ts` | **后端**源码 → `server/index.js` |
| `web-src/` | **前端** Vue3 源码（含自身 `index.html`） |
| `vite.config.ts` | `root: web-src`，`outDir: web`，`base: './'` |
| `server/` | 后端产物（pack 时混淆） |
| `web/` | 前端产物 |
| `assets/` | logo 等 |
| `release/*.vome` | `module.json` + README + `server/` + `web/` + `assets/` |

## module.json 字段

| 字段 | 必填 | 怎么用 |
|------|------|--------|
| `name` / `key` / `version` | 是 | `key` 不可为 `plugin` |
| `hook` | 要当钩子用时建议有 | 有 hook 必须有可加载的 `Plugin` |
| `singleton` | 否 | 示例默认 `true` |
| `config.@local` / `@prod` | 否 | 勿用宿主 `.env` |
| `routes` | 否 | 有则必须有 `handlers` 且每个 handler 存在 |
| `menus` | 有前端时建议有 | `appKey` = `key` |
| `logo` / `readme` / … | 否 | 元信息 |

### menus（有 web 时）

与纯前端相同：`name`、`router`、`appKey`（= `key`）、`icon`、`orderNum`、`isShow`。

## 可以用什么

### 后端（同 scaffold-service）

```ts
import { BasePlugin } from 'vome-plugin-runtime'

export class XxxPlugin extends BasePlugin {
  async ready() {
    const cfg = (this.pluginInfo?.config ?? {}) as Record<string, unknown>
  }

  async ping() {
    return { ok: true, key: this.pluginInfo?.key }
  }
}

export const Plugin = XxxPlugin

// 可选
export const handlers = {
  async hello(ctx) {
    return { ok: true, adminId: ctx.adminId }
  },
}
```

- 宿主：`invoke(key|hook, 'ping')`、`getInstance(…)`
- 路由：`GET/POST …` → **`/admin/ext/{key}{path}`**（登录 + 可选 `perms`）
- `this.cache` / `this.pluginService` 用法同纯后端脚手架

### 前端（同 scaffold-front，目录不同）

- 开发目录：`web-src/`（`main.ts`、`App.vue`、`index.html`）
- 依赖：`vue` + Vite；可加依赖但须打进 `web/`
- 入口：`createApp(App).mount('#app')`
- 线上：`/vome/apps/{key}/` + wujie；**必须** `base: './'`

前后端在包内并列：前端调后端可用宿主网关 `/admin/ext/{key}/…` 或你们自己的 API，注意鉴权与 cookie。

## Snippets（`.vscode/plugin.code-snippets`）

| 前缀 | 用途 |
|------|------|
| `plugin` / `plugin-method` | 后端类与方法 |
| `plugin-handlers` / `plugin-route` | handlers 与 routes |
| `plugin-menu` | 菜单项 |
| `plugin-vue` / `plugin-main` | 前端 SFC / 入口（写在 `web-src/`） |

## 需要注意什么

1. **`src/` vs `web-src/`**：后端只动 `src/`；前端只动 `web-src/`。不要把 Vue 写进 `src/`，也不要手改 `web/`、`server/` 产物。
2. **pack 顺序**：先混淆后端再 `build:web`；漏跑前端 build 会打出旧页面或空 `web/`。
3. **混淆 reservedNames**：新增公开方法名写入 `plugins/scripts/obfuscator.options.ts`，否则 `invoke` 失败。
4. **hook 与 web 可同时有**：安装要求至少 server/web/hook 之一；有 hook 必须有 `server/index.js`。
5. **routes 与 handlers 一一对应**；纯钩子无 routes 时可不导出 handlers。
6. **`appKey` = `key`**；`base: './'` 勿改绝对路径。
7. **不要**打包 `node_modules`、源码目录；**不要**依赖宿主 `.env`。
8. **改 key**：同步 `module.json`、menus、pack 文件名、前后端文案与已安装模块（重装）。
9. **本地验证**：`dev:web` 只验前端；钩子 / `invoke` / `/admin/ext` 需安装到运行中的 service 后测。
