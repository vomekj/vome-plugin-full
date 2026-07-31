import { defineStore } from 'pinia'

/** 脚手架示例 store；业务可按需扩展 */
export const useAppStore = defineStore('app', {
  state: () => ({
    ready: true,
  }),
})
