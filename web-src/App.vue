<template>
  <RouterView />
</template>

<script setup lang="ts">
import { watchHostLocale } from '@/sync-host-locale'
import { watchHostTheme } from '@/sync-host-theme'

defineOptions({ name: 'App' })

let stopWatchTheme: (() => void) | undefined
let stopWatchLocale: (() => void) | undefined

onMounted(() => {
  stopWatchTheme = watchHostTheme()
  stopWatchLocale = watchHostLocale()
})

onUnmounted(() => {
  stopWatchTheme?.()
  stopWatchLocale?.()
})
</script>
