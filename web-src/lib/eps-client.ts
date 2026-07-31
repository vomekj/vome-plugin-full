/**
 * 可选：用 vome-core/client 挂宿主 Admin EPS，得到链式 service.*
 * 鉴权 / 无感 refresh 复用 host-api.hostClientRequest
 */
import {
  clearEpsCache,
  configureClient,
  createEps,
  getService,
} from 'vome-core/client'
import { hostClientRequest } from './host-api'

configureClient({
  request: hostClientRequest,
  loadStaticEps: async () => ({
    eps: true,
    admin: {},
    app: {},
    dict: {},
  }),
})

/** Admin 侧链式 API，如 service.base…（须先 bootHostEps） */
export const service = getService('admin')

/** 拉取并挂载宿主 EPS；force 清缓存后重拉 */
export async function bootHostEps(force = false) {
  if (force) clearEpsCache('admin')
  return createEps({ force, side: 'admin' })
}
