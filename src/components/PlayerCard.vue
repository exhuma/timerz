<template>
  <v-card
    class="h-100 d-flex flex-column cursor-pointer"
    :color="cardColor"
    :elevation="active && running ? 8 : 2"
    @click="$emit('activate')"
  >
    <v-card-title
      class="text-center text-truncate text-subtitle-1 pb-0"
    >
      {{ player.name }}
    </v-card-title>

    <v-card-text
      class="flex-grow-1 d-flex align-center justify-center pa-2"
    >
      <div class="text-center">
        <div
          v-if="timedOut"
          class="text-h6 text-error font-weight-bold"
        >
          TIME OUT
        </div>
        <div
          v-else
          class="text-h4 font-weight-bold"
          :class="active && running ? 'text-on-primary' : ''"
        >
          {{ displayTime }}
        </div>
      </div>
    </v-card-text>

    <v-progress-linear
      bg-color="surface-variant"
      :color="active ? 'secondary' : 'primary'"
      height="6"
      :model-value="progress"
      rounded="b"
    />
  </v-card>
</template>

<script lang="ts" setup>
  import type { Player } from '@/services/types'
  import { computed } from 'vue'

  const props = defineProps<{
    player: Player
    active: boolean
    running: boolean
    mode: 'count-up' | 'count-down'
    timeLimitMs: number
    progress: number
  }>()

  defineEmits<{ activate: [] }>()

  const timedOut = computed(
    () =>
      props.mode === 'count-down'
      && props.player.elapsedMs >= props.timeLimitMs,
  )

  const displayMs = computed(() => {
    if (props.mode === 'count-down') {
      return Math.max(
        0,
        props.timeLimitMs - props.player.elapsedMs,
      )
    }
    return props.player.elapsedMs
  })

  const displayTime = computed(() => {
    const totalSec = Math.floor(displayMs.value / 1000)
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = totalSec % 60
    const mm = String(m).padStart(2, '0')
    const ss = String(s).padStart(2, '0')
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
  })

  const cardColor = computed(() => {
    if (timedOut.value) return 'error'
    if (props.active && props.running) return 'primary'
    return undefined
  })
</script>
