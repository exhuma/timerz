<template>
  <v-container
    v-if="game"
    class="pa-2 pa-sm-4"
    fluid
  >
    <!-- Header bar -->
    <v-row align="center" class="mb-2" no-gutters>
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

    <!-- Player cards grid -->
    <v-row dense>
      <v-col
        v-for="player in game.players"
        :key="player.id"
        cols="6"
        :sm="smCols"
      >
        <v-responsive :aspect-ratio="1">
          <PlayerCard
            :active="game.activePlayerId === player.id"
            :mode="game.mode"
            :player="player"
            :progress="progressFor(player)"
            :running="game.running"
            :time-limit-ms="game.timeLimitMs"
            @activate="svc.activatePlayer(game!.id, player.id)"
          />
        </v-responsive>
      </v-col>
    </v-row>
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
  import { GameServiceKey } from '@/services/gameService'

  const route = useRoute()
  const svc = inject(GameServiceKey)!
  const gameId = (route.params as { id: string }).id

  const game = computed(() => svc.getGame(gameId))

  /** 3 cards per row on sm+ for 5-6 players, else 2. */
  const smCols = computed(() => {
    const count = game.value?.players.length ?? 4
    return count >= 5 ? 4 : 6
  })

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
