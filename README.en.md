# Vome Plugin Full (fullstack plugin scaffold)

[简体中文](./README.md) | English

A plugin scaffold that ships **backend hooks (`server/`) and a frontend micro-app (`web/`)** in one package. Pack it as a `.vome`, install it in [vome-admin](https://gitee.com/vomekj/vome-admin), and you get both a **sidebar menu (wujie page)** and **host-callable server methods** via `invoke`.

> Open-sourced by Vome / 微茫科技. Designed for [vome-service](https://gitee.com/vomekj/vome-service) + [vome-admin](https://gitee.com/vomekj/vome-admin).

## When to use

| Need | Choose |
| --- | --- |
| Backend hooks only | scaffold-service |
| Admin UI only | scaffold-front |
| **Hooks + Admin UI** | **This repo (scaffold-full)** |

## Features

| Capability | Description |
| --- | --- |
| **Fullstack `.vome`** | Package includes `server/`, `web/`, `module.json`, `assets/` |
| **Admin menus** | `menus[].appKey` matches plugin `key`; sidebar entry after enable |
| **wujie micro-app** | Admin loads `/vome/apps/{key}/` for the frontend build |
| **Backend hooks** | `extends BasePlugin`; `hook` name for host `invoke` |
| **Env config** | `module.json` → `config.@local` / `@prod` |
| **Vite frontend** | Sources in `web-src/` (separate from backend `src/`) |

## Identity (sample)

| Item | Value |
| --- | --- |
| `key` | `scaffold-full` |
| `hook` | `scaffold-full-demo` |
| `singleton` | `true` |
| Menu route | `/scaffold-full` |
| Artifact | `release/scaffold-full.vome` |

When customizing: update `key` / `hook` / `menus` in `module.json` and the zip name in the `pack` script.

## Requirements

| Dependency | Notes |
| --- | --- |
| **Bun** | Install & build |
| **Vome Service** | Runtime host (loads `.vome`, provides `BasePlugin`) |
| **Vome Admin** | Plugin manager UI + wujie shell |

## Quick start

```bash
git clone https://gitee.com/vomekj/vome-plugin-full.git
cd vome-plugin-full
bun install
```

### 1. Local development

```bash
# Frontend Vite preview (sources in web-src/)
bun run dev:web

# Backend hooks: edit src/index.ts → bun run build → server/index.js
```

| Path | Role |
| --- | --- |
| `src/` | Backend TypeScript → `server/` |
| `web-src/` | Frontend Vue 3 sources → `web/` |
| `module.json` | Manifest: hook, config, menus |

### 2. Pack

```bash
bun run build        # backend → server/index.js
bun run build:web    # frontend → web/
bun run pack         # recommended: obfuscate backend + build web + zip
```

If the obfuscate script is missing in your environment, run `build` + `build:web`, then zip manually:

```bash
mkdir -p release
zip -r ./release/scaffold-full.vome module.json README.md server web assets -x '*.DS_Store'
```

The package must contain both `server/index.js` and `web/index.html`.

### 3. Install into Admin

1. Start [vome-service](https://gitee.com/vomekj/vome-service) and [vome-admin](https://gitee.com/vomekj/vome-admin)  
2. Admin → **Plugins** → upload `release/scaffold-full.vome` → **install & enable**  
3. Sidebar shows the menu entry → wujie opens the micro-app  
4. Verify server: `invoke('scaffold-full-demo', 'ping')` (hook / method names per your code)  

API: `POST /admin/base/module/install`.

> Marketplace upload is not available yet; distribute `.vome` files locally or on your intranet.

## How it fits Admin / Service

| Side | Role |
| --- | --- |
| **Service** | Unpacks plugins, injects `vome-plugin-runtime` (`BasePlugin`), registers menus, serves `/vome/apps/{key}/` |
| **Admin** | Install / enable plugins; opens `web/` in **wujie**; calls plugin routes or `invoke` via the host |

Frontend build must use `base: './'` (see `vite.config.ts`) so assets work under `/vome/apps/{key}/`.

## Project layout

```text
vome-plugin-full/
├── module.json
├── README.md
├── 规范.md                   # conventions (Chinese)
├── package.json
├── vite.config.ts           # root: web-src → outDir: web
├── src/                     # backend sources
│   ├── index.ts             # extends BasePlugin, export Plugin
│   └── vome-plugin-runtime.d.ts
├── web-src/                 # frontend sources (Vue 3)
├── server/                  # backend build (optionally obfuscated)
├── web/                     # frontend build
├── assets/
└── release/
    └── scaffold-full.vome
```

Why `web-src/`? In fullstack plugins **`src/` is reserved for the backend**. Pure frontend scaffolds use `src/` for UI — don’t mix the layouts.

## `module.json` essentials

| Field | Notes |
| --- | --- |
| `key` | `[a-zA-Z0-9_-]+`, cannot be `plugin` |
| `hook` | Name used by host `invoke` |
| `singleton` | Single instance flag |
| `config.@local` / `@prod` | Env config |
| `menus[]` | Admin menus; `appKey` usually equals `key` |
| `routes` | Optional server routes + handlers |

See [规范.md](./规范.md) for the full convention.

## Backend contract

```ts
import { BasePlugin } from 'vome-plugin-runtime'

export class DemoPlugin extends BasePlugin {
  async ready() { /* … */ }
  async ping() {
    return { ok: true, key: this.pluginInfo?.key }
  }
}

export const Plugin = DemoPlugin
```

- Output: `server/index.js` (CJS)  
- `vome-plugin-runtime` is `--external`; the host injects the real implementation  

## Frontend contract

- Dev: `bun run dev:web`  
- Output: `web/` for Admin wujie  
- Menu `appKey` = plugin `key`  

## Do not

- Depend on host `.env` files  
- Use `key: "plugin"`  
- Bundle `node_modules` into the `.vome` (backend is bun-bundled)  

## Related projects

| Project | Role |
| --- | --- |
| [vome-service](https://gitee.com/vomekj/vome-service) | Plugin runtime host (required) |
| [vome-admin](https://gitee.com/vomekj/vome-admin) | Install UI + wujie shell (required) |
| scaffold-service / scaffold-front | Backend-only / frontend-only scaffolds |

## Contributing

1. Fork this repo  
2. Create `feat/xxx`  
3. Commit and push  
4. Open a Pull / Merge Request  

## License

[MIT](./LICENSE) © VomeShop / 微茫科技

---

If this project helps you, a Star ⭐ is appreciated.
