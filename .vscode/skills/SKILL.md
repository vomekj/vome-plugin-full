---
name: vome-plugin-full
description: >-
  全栈插件（vome-plugin-full）：BasePlugin + Vue3 web-src、hook/invoke/routes、
  menus/wujie、双 build 与 pack。Use when developing plugins/vome-plugin-full
  or a full-stack .vome plugin.
---

# 全栈插件（vome-plugin-full）

> **目录**：`plugins/vome-plugin-full`  
> **示例 key**：`scaffold-full`  
> **入口**：[AGENTS.md](../AGENTS.md)

= [纯后端](../../vome-plugin-service/.vscode/skills/SKILL.md) + [纯前端](../../vome-plugin-front/.vscode/skills/SKILL.md)；前端源码在 **`web-src/`**（`src/` 留给后端）。

## IDE

| 项 | 说明 |
|----|------|
| Snippets | `.vscode/plugin.code-snippets`（前后端前缀齐全） |
| Skills | 建议 `.cursor/skills/vome-plugin-full/` |
| 规范 | [规范.md](../../规范.md) |

## 能做什么

| 能力 | 说明 |
|------|------|
| 钩子 + 公开方法 | `Plugin` / `ready` / `invoke` / `getInstance` |
| HTTP handlers | `handlers` + `routes` → `/admin/ext/{key}/…` |
| 微应用 | `web/` + `menus.appKey` → wujie → `/vome/apps/{key}/` |
| 环境配置 | `config.@local` / `@prod` |
| 缓存 | `this.cache` |

## 命令

```bash
cd plugins/vome-plugin-full
bun install

bun run dev:web          # 前端 Vite（web-src/）
bun run build            # 后端 → server/index.js
bun run build:web        # 前端 → web/
bun run build:obfuscate
bun run pack             # 混淆后端 + build:web → release/scaffold-full.vome
```

改 `key` 时同步：`module.json`、`menus`、`pack` 文件名、前后端文案。

## 目录与产物

| 路径 | 用途 |
|------|------|
| `module.json` | hook、config、menus、routes… |
| `src/index.ts` | **后端** → `server/index.js` |
| `web-src/` | **前端** Vue3（含 `index.html`） |
| `vite.config.ts` | `root: web-src`，`outDir: web`，`base: './'` |
| `server/` / `web/` | 产物 |
| `release/*.vome` | module + README + server + web + assets |

## module.json

| 字段 | 说明 |
|------|------|
| `key` | 不可为 `plugin` |
| `hook` | 有则必须可加载 `Plugin` |
| `config.@local` / `@prod` | 勿用 `.env` |
| `routes` | 有则 `handlers` 一一对应 |
| `menus` | `appKey` = `key` |

## 后端（摘要）

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

export const handlers = {
  async hello(ctx: {
    body: unknown
    query: Record<string, string>
    params: Record<string, string>
    headers: Headers
    adminId?: number | string
  }) {
    return { ok: true, adminId: ctx.adminId }
  },
}
```

- 返回 **data**，不要 `Response.json`
- 混淆：`plugins/scripts/obfuscator.options.ts` → `reservedNames`

## 前端（摘要）

- 只改 `web-src/`；产物 `web/`  
- `base: './'`；wujie 内优先 hash 路由  
- 调本插件：`/admin/ext/{key}/…`（snippet：`plugin-fetch-ext`）  
- 调宿主：`/admin/…`（`plugin-fetch`）  

## Snippets

| 前缀 | 用途 |
|------|------|
| `plugin` / `plugin-method` | 后端类与方法 |
| `plugin-handlers` / `plugin-route` | handlers / routes |
| `plugin-config` / `plugin-module` | 配置与清单骨架 |
| `plugin-menu` | 菜单项 |
| `plugin-vue` / `plugin-main` | 前端（`web-src/`） |
| `plugin-fetch-ext` | 调 `/admin/ext/{key}/…` |
| `plugin-fetch` | 调宿主 `/admin/…` |
| `plugin-invoke` | 宿主 invoke |

## 注意

1. **`src/` ≠ `web-src/`**：后端 / 前端目录勿混。  
2. **pack**：先混淆后端再 `build:web`；漏 build 会打出旧/空 `web/`。  
3. **hook 与 web 可并存**；有 hook 必须有 `server/index.js`。  
4. **`appKey` = `key`**；勿改绝对 `base`。  
5. 勿打包 `node_modules` / 源码；勿依赖宿主 `.env`。  

## 排错

| 现象 | 排查 |
|------|------|
| invoke 无方法 | `reservedNames` + 重 pack |
| ext 404 | routes path/method；key 是否一致 |
| handler 500 缺失 | `handlers` 键 ≠ `routes.handler` |
| wujie 白屏 | 未 `build:web`；`appKey`；`base` |
| 前后端联调失败 | 先装到运行中的 service；`credentials`；`code===1000` |
| 同 hook 冲突 | 同槽仅一个启用 |

## 相关

- VitePress：[plugin-full](/plugins/plugin-full/) · [开发](/plugins/plugin-full/develop) · [打包](/plugins/plugin-full/pack)
- 兄弟脚手架：service / front 的 SKILL
