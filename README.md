# scaffold-full

前端 + 后端完整插件脚手架（`.vome`：含 `server/` 与 `web/`）。

## 开发

```bash
bun install
bun run dev:web   # 前端 Vite 预览（源码在 web-src/）
bun run build     # 后端 → server/index.js
bun run build:web # 前端 → web/
bun run pack      # 混淆后端 + 构建前端后打包 → release/scaffold-full.vome
```

- 改后端：`src/index.ts`
- 改前端：`web-src/`（Vue3）

规范见 [规范.md](./规范.md)。
