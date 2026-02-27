<template>
  <v-container
    v-if="game"
    class="pa-2 pa-sm-4 d-flex flex-column"
    fluid
    style="height: 100dvh;"
  >
    <!-- Header bar -->
    <v-row align="center" class="mb-2 flex-grow-0" no-gutters>
      <v-col cols="auto">
        <v-btn
          icon="mdi-arrow-left"
          to="/"
          variant="text"
        />
      </v-col>
      <v-col class="text-truncate">
        <span class="text-h6 ml-1">{{ game.name }}</span>
      </v-col>
      <v-col class="d-flex ga-1" cols="auto">
        <v-btn
          :color="game.running ? 'warning' : 'success'"
          :icon="game.running ? 'mdi-pause' : 'mdi-play'"
          variant="tonal"
          @click="svc.pauseGame(game.id)"
        />
        <v-btn
          icon="mdi-refresh"
          variant="tonal"
          @click="svc.resetGame(game.id)"
        />
      </v-col>
    </v-row>

    <!-- Player cards grid: fills remaining viewport space -->
    <div class="d-flex flex-wrap justify-center align-content-center flex-grow-1">
      <div
        v-for="player in game.players"
        :key="player.id"
        class="pa-1"
        :style="cardWrapperStyle"
      >
        <PlayerCard
          :active="game.activePlayerId === player.id"
          :mode="game.mode"
          :player="player"
          :progress="progressFor(player)"
          :running="game.running"
          style="height: 100%;"
          :time-limit-ms="game.timeLimitMs"
          @activate="svc.activatePlayer(game!.id, player.id)"
        />
      </div>
    </div>
  </v-container>

  <!-- Game not found -->
  <v-container
    v-else
    class="text-center pa-16"
  >
    <v-icon
      color="medium-emphasis"
      icon="mdi-timer-off-outline"
      size="64"
    />
    <div class="text-h6 mt-4">Game not found</div>
    <v-btn class="mt-4" prepend-icon="mdi-arrow-left" to="/">
      Back to games
    </v-btn>
  </v-container>
</template>

<script lang="ts" setup>
  import type { Player } from '@/services/types'
  import {
    computed,
    inject,
    onMounted,
    onUnmounted,
  } from 'vue'
  import { useRoute } from 'vue-router'
  import { useDisplay } from 'vuetify'
  import { GameServiceKey } from '@/services/gameService'

  const route = useRoute()
  const svc = inject(GameServiceKey)!
  const gameId = (route.params as { id: string }).id
  const { width, height } = useDisplay()

  const game = computed(() => svc.getGame(gameId))

  /** Number of cards per row based on player count. */
  const cardsPerRow = computed(() => {
    const n = game.value?.players.length ?? 4
    if (n <= 2) return 2
    if (n === 3) return 3
    if (n === 4) return 2
    if (n <= 6) return 3
    return 4
  })

  /**
   * Square card size (px) that fits the full player grid
   * within the visible viewport. Minimum 100px.
   * HEADER: approximate header row height.
   * PAD: container padding (pa-2 = 8px × 2 sides × 2 axes).
   * CARD_GAP: pa-1 (4px) × 2 sides per card.
   */
  const cardSize = computed(() => {
    const n = game.value?.players.length ?? 4
    const cols = cardsPerRow.value
    const rows = Math.ceil(n / cols)
    const HEADER = 64
    const PAD = 32
    const CARD_GAP = 8
    const availableWidthPerCard
      = (width.value - PAD - CARD_GAP * cols) / cols
    const availableHeightPerCard
      = (height.value - HEADER - PAD - CARD_GAP * rows)
        / rows
    return Math.max(
      100,
      Math.floor(Math.min(
        availableWidthPerCard,
        availableHeightPerCard,
      )),
    )
  })

  const cardWrapperStyle = computed(() => ({
    width: `${cardSize.value}px`,
    height: `${cardSize.value}px`,
  }))

  /**
   * Progress bar value (0-100) representing each player's
   * share of consumed time.
   * - count-down: fraction of their individual time limit used
   * - count-up: fraction of the total time consumed by all
   */
  function progressFor (player: Player): number {
    if (!game.value) return 0
    const { mode, timeLimitMs, players } = game.value
    if (mode === 'count-down') {
      if (timeLimitMs === 0) return 0
      return Math.min(
        (player.elapsedMs / timeLimitMs) * 100,
        100,
      )
    }
    const total = players.reduce(
      (sum, p) => sum + p.elapsedMs,
      0,
    )
    if (total === 0) return 0
    return (player.elapsedMs / total) * 100
  }

  // Interval-based ticker: advances active player's timer.
  let lastTick = 0
  let intervalId: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    lastTick = Date.now()
    intervalId = setInterval(() => {
      const now = Date.now()
      svc.tick(gameId, now - lastTick)
      lastTick = now
    }, 250)
  })

  onUnmounted(() => {
    if (intervalId !== null) clearInterval(intervalId)
  })
</script>
