---
name: vome-plugin-full
description: >-
  全栈插件（vome-plugin-full）：invoke/ext + web-src hostRequest、与 core 能力边界。
  Use when developing plugins/vome-plugin-full.
---

# 全栈插件（vome-plugin-full）

> **目录**：`plugins/vome-plugin-full` · **示例 key**：`scaffold-full`  
> **入口**：[AGENTS.md](../AGENTS.md)

= [纯后端能力](../../vome-plugin-service/.vscode/skills/SKILL.md) + [纯前端能力](../../vome-plugin-front/.vscode/skills/SKILL.md)；前端源码在 **`web-src/`**。

## 与 vome-core 的能力边界

| 能力 | 状态 |
|------|------|
| BasePlugin / invoke / echo·ping | **可用** |
| handlers + `/admin/ext/{key}/…` | **可用**（示例 `GET /hello`） |
| config / cache | **可用** |
| 微应用 + menus/wujie | **可用** |
| `hostRequest` + Bearer + `/dev` 前缀 | **可用**（`web-src/lib/host-api.ts`） |
| 前端调本插件 `extPath('/hello')` | **可用** |
| 宿主完整 CRUD / IoC 写进插件包 | **不可用** |
| 默认打入整包 admin CRUD | **不推荐** |

## 命令

```bash
cd plugins/vome-plugin-full
bun run dev:web
bun run build && bun run build:web
bun run pack   # 混淆后端 + build:web
```

## 脚手架已演示

**后端** `src/index.ts`：`ping` / `echo` + `handlers.hello`  
**清单** `routes`：`GET /hello`  
**前端** `web-src/App.vue`：调 `/admin/ext/scaffold-full/hello` 与 `/admin/base/auth/me`

```ts
import { hostRequest, extPath } from './lib/host-api'
await hostRequest('GET', extPath('/hello'))
```

## Snippets

| 前缀 | 用途 |
|------|------|
| `plugin*` / `plugin-handlers` / `plugin-route` / `plugin-config` | 后端与清单 |
| `plugin-menu` / `plugin-vue` / `plugin-main` | 菜单与前端 |
| `plugin-fetch-ext` / `plugin-fetch` / `plugin-invoke` | 联调 |

## 注意

1. `src/` 后端 · `web-src/` 前端，勿混  
2. pack 须含最新 `server/` + `web/`  
3. `reservedNames` 含 `ping`/`echo`/`hello`  
4. `PLUGIN_KEY` 与 `module.json.key` 一致  

## 排错

| 现象 | 排查 |
|------|------|
| ext 失败 | 插件未启用；routes；token；`/dev` 前缀 |
| 仅前端旧 | 漏 `build:web` |
| invoke 无方法 | reservedNames |

## 相关

- VitePress：[能力边界](/plugins/#与-vome-core-的关系) · [develop](/plugins/plugin-full/develop) · [service](/plugins/plugin-full/service)
