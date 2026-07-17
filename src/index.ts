// 宿主 loadPluginClass 会剥离该 import，并注入真实 BasePlugin
import { BasePlugin } from 'vome-plugin-runtime'

/**
 * 全栈脚手架示例：server 钩子 + web 微应用。
 */
export class DemoPlugin extends BasePlugin {
  async ready() {
    const cfg = (this.pluginInfo?.config ?? {}) as Record<string, unknown>
    console.log('[scaffold-full] ready', cfg.greeting ?? '')
  }

  async ping() {
    return { ok: true, key: this.pluginInfo?.key }
  }
}

export const Plugin = DemoPlugin
