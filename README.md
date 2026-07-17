# Vome Plugin Full（全栈插件脚手架）

[English](./README.en.md) | 简体中文

一次性提供 **后端钩子（`server/`）+ 前端微应用（`web/`）** 的插件脚手架。打包为 `.vome` 后，在 [vome-admin](https://gitee.com/vomekj/vome-admin) 安装启用，即可同时获得 **侧栏菜单（wujie 嵌入页）** 与 **宿主可 `invoke` 的服务端能力**。

> 微茫科技开源项目。配套 [vome-service](https://gitee.com/vomekj/vome-service) + [vome-admin](https://gitee.com/vomekj/vome-admin)。

## 何时选用

| 需求 | 选用 |
| --- | --- |
| 只要后端钩子 | scaffold-service |
| 只要 Admin 页面 | scaffold-front |
| **钩子 + Admin 页面** | **本仓库（scaffold-full）** |

## 特性

| 能力 | 说明 |
| --- | --- |
| **全栈 `.vome`** | 包内同时含 `server/`、`web/`、`module.json`、`assets/` |
| **Admin 菜单** | `menus[].appKey` 对应插件 `key`，启用后侧栏出现入口 |
| **wujie 微应用** | Admin 打开 `/vome/apps/{key}/` 加载前端产物 |
| **后端钩子** | `extends BasePlugin`，`hook` 名供宿主 `invoke` |
| **环境配置** | `module.json` → `config.@local` / `@prod` |
| **Vite 前端** | 源码在 `web-src/`（与后端 `src/` 分离） |

## 标识（示例）

| 项 | 值 |
| --- | --- |
| `key` | `scaffold-full` |
| `hook` | `scaffold-full-demo` |
| `singleton` | `true` |
| 菜单路由 | `/scaffold-full` |
| 产物 | `release/scaffold-full.vome` |

改成自己的业务时：同步修改 `module.json` 的 `key` / `hook` / `menus`，以及 `pack` 脚本里的 zip 文件名。

## 环境要求

| 依赖 | 说明 |
| --- | --- |
| **Bun** | 安装与构建 |
| **Vome Service** | 插件运行时宿主（加载 `.vome`、提供 `BasePlugin`） |
| **Vome Admin** | 插件管理页上传安装、侧栏 wujie 打开微应用 |

## 快速开始

```bash
git clone https://gitee.com/vomekj/vome-plugin-full.git
cd vome-plugin-full
bun install
```

### 1. 本地开发

```bash
# 前端 Vite 预览（源码 web-src/）
bun run dev:web

# 改后端钩子
# 编辑 src/index.ts → bun run build → server/index.js
```

| 目录 | 用途 |
| --- | --- |
| `src/` | 后端 TypeScript（构建到 `server/`） |
| `web-src/` | 前端 Vue3 源码（构建到 `web/`） |
| `module.json` | 插件清单：hook、config、menus |

### 2. 打包

```bash
bun run build        # 后端 → server/index.js
bun run build:web    # 前端 → web/
bun run pack         # 推荐：混淆后端 + 构建前端 + zip → release/*.vome
```

若环境缺少混淆脚本，可先 `build` + `build:web`，再按 `pack` 中的 zip 列表手动打包：

```bash
mkdir -p release
zip -r ./release/scaffold-full.vome module.json README.md server web assets -x '*.DS_Store'
```

包内应同时有 `server/index.js` 与 `web/index.html`。

### 3. 安装到 Admin（配套框架）

1. 启动 [vome-service](https://gitee.com/vomekj/vome-service) 与 [vome-admin](https://gitee.com/vomekj/vome-admin)  
2. Admin → **插件管理** → 上传 `release/scaffold-full.vome` → **安装并启用**  
3. 侧栏出现「脚手架全栈」（或你改过的菜单名）→ wujie 打开微应用  
4. 服务端可验证：`invoke('scaffold-full-demo', 'ping')`（hook / 方法名以你的实现为准）  

安装 API：`POST /admin/base/module/install`。

> 插件市场在线发布上传尚在规划中；当前请本地或内网分发 `.vome`。

## 与 Admin / Service 的关系

| 端 | 作用 |
| --- | --- |
| **Service** | 解压加载插件、注入 `vome-plugin-runtime`（`BasePlugin`）、挂菜单、提供 `/vome/apps/{key}/` 静态资源 |
| **Admin** | 插件 CRUD / 启用；点击菜单用 **wujie** 嵌入 `web/`；业务页通过宿主代理访问插件路由或 `invoke` |

前端构建必须 `base: './'`（见 `vite.config.ts`），才能适配 `/vome/apps/{key}/` 相对路径。

## 目录结构

```text
vome-plugin-full/
├── module.json              # key / hook / config / menus
├── README.md
├── 规范.md                   # 字段与产物约定
├── package.json
├── vite.config.ts           # root: web-src → outDir: web
├── src/                     # 后端源码
│   ├── index.ts             # extends BasePlugin，export Plugin
│   └── vome-plugin-runtime.d.ts
├── web-src/                 # 前端源码（Vue3）
│   ├── main.ts
│   └── App.vue
├── server/                  # 后端构建产物（可混淆）
│   └── index.js
├── web/                     # 前端构建产物
├── assets/
└── release/
    └── scaffold-full.vome
```

为何前端是 `web-src/`：全栈包里 **`src/` 留给后端**；纯前端脚手架才用 `src/` 放页面——不要混抄。

## `module.json` 要点

| 字段 | 说明 |
| --- | --- |
| `key` | `[a-zA-Z0-9_-]+`，不可为 `plugin` |
| `hook` | 宿主 `invoke` 用的钩子名 |
| `singleton` | 是否单例 |
| `config.@local` / `@prod` | 环境配置 |
| `menus[]` | Admin 菜单；`appKey` 通常等于 `key` |
| `routes` | 可选服务端路由 + handlers |

规范详见 [规范.md](./规范.md)。

## 后端约定

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

- 产物：`server/index.js`（CJS）  
- 打包时 `vome-plugin-runtime` 为 `--external`，由宿主注入真实实现  

## 前端约定

- 开发：`bun run dev:web`  
- 产物：`web/`，供 Admin wujie 加载  
- 菜单 `appKey` = 插件 `key`  

## 禁止

- 依赖宿主 `.env`  
- `key` 取名为 `plugin`  
- 把 `node_modules` 打进 `.vome`（后端用 bun bundle）  

## 相关项目

| 项目 | 说明 |
| --- | --- |
| [vome-service](https://gitee.com/vomekj/vome-service) | 插件运行时宿主（必配） |
| [vome-admin](https://gitee.com/vomekj/vome-admin) | 安装页 + wujie 微应用壳（必配） |
| scaffold-service / scaffold-front | 仅后端 / 仅前端脚手架 |

## 贡献

1. Fork 本仓库  
2. 新建分支 `feat/xxx`  
3. 提交并推送  
4. 发起 Pull Request / Merge Request  

## 许可证

[MIT](./LICENSE) © VomeShop / 微茫科技

---

若本仓库对你有帮助，欢迎 Star ⭐
