declare module 'vome-plugin-runtime' {
  export class BasePlugin {
    pluginInfo: Record<string, any>
    ctx?: unknown
    cache?: any
    pluginService?: any
    init(
      pluginInfo: Record<string, any>,
      ctx?: unknown,
      app?: unknown,
      services?: any,
    ): Promise<void>
    ready(): Promise<void>
  }
}
