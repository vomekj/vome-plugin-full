// 宿主 loadPluginClass 会剥离该 import，并注入真实 BasePlugin（来自 vome-core）
import { BasePlugin } from 'vome-plugin-runtime'

type HandlerCtx = {
  body: unknown
  query: Record<string, string>
  params: Record<string, string>
  headers: Headers
  adminId?: number | string
}

/**
 * 全栈脚手架后端：invoke + /admin/ext；前端在 web-src/ 经同域调用网关
 */
export class DemoPlugin extends BasePlugin {
  async ready() {
    const cfg = (this.pluginInfo?.config ?? {}) as Record<string, unknown>
    console.log('[scaffold-full] ready', cfg.greeting ?? '')
  }

  async ping() {
    return {
      ok: true,
      key: this.pluginInfo?.key,
      greeting: (this.pluginInfo?.config as Record<string, unknown> | undefined)
        ?.greeting,
    }
  }

  async echo(payload: unknown) {
    return { ok: true, echo: payload }
  }
}

export const Plugin = DemoPlugin

export const handlers = {
  async hello(ctx: HandlerCtx) {
    return {
      ok: true,
      message: 'hello from scaffold-full',
      adminId: ctx.adminId ?? null,
      query: ctx.query,
    }
  },
}
