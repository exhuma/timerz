<template>
  <v-container max-width="960">
    <v-row align="center" class="mt-2 mb-4">
      <v-col>
        <h1 class="text-h4 font-weight-bold">
          <v-icon class="mr-2" icon="mdi-timer-outline" />
          Timerz
        </h1>
      </v-col>
      <v-col cols="auto">
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="showDialog = true"
        >
          New Game
        </v-btn>
      </v-col>
    </v-row>

    <v-row v-if="svc.games.length === 0">
      <v-col>
        <v-card class="text-center pa-12" variant="tonal">
          <v-icon
            color="primary"
            icon="mdi-timer-outline"
            size="64"
          />
          <div class="text-h6 mt-4">No games yet</div>
          <div class="text-body-2 mt-2 text-medium-emphasis">
            Create a new game to get started
          </div>
          <v-btn
            class="mt-6"
            color="primary"
            prepend-icon="mdi-plus"
            @click="showDialog = true"
          >
            New Game
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="game in sortedGames"
        :key="game.id"
        cols="12"
        md="4"
        sm="6"
      >
        <v-card>
          <v-card-title>{{ game.name }}</v-card-title>
          <v-card-subtitle>
            {{ modeLabel(game.mode) }}
            &middot;
            {{ game.players.length }} players
          </v-card-subtitle>
          <v-card-text>
            <v-chip size="small">
              {{
                game.mode === 'count-down'
                  ? formatTime(game.timeLimitMs) + ' limit'
                  : 'No time limit'
              }}
            </v-chip>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="primary"
              prepend-icon="mdi-play"
              :to="`/game/${game.id}`"
              variant="tonal"
            >
              Play
            </v-btn>
            <v-spacer />
            <v-btn
              color="error"
              icon="mdi-delete-outline"
              variant="text"
              @click="handleDelete(game.id)"
            />
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <GameSetupDialog
      v-model="showDialog"
      @create="handleCreate"
    />

    <!-- Delete confirmation dialog -->
    <v-dialog v-model="confirmDeleteDialog" max-width="360">
      <v-card>
        <v-card-title>Delete game?</v-card-title>
        <v-card-text>
          This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="confirmDeleteDialog = false">
            Cancel
          </v-btn>
          <v-btn color="error" @click="doDelete">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
  import type { Game, GameMode } from '@/services/types'
  import { computed, inject, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { GameServiceKey } from '@/services/gameService'

  const router = useRouter()
  const svc = inject(GameServiceKey)!

  const showDialog = ref(false)
  const confirmDeleteDialog = ref(false)
  const pendingDeleteId = ref<string | null>(null)

  const sortedGames = computed(() =>
    ([...svc.games] as Game[]).toSorted(
      (a, b) => b.createdAt - a.createdAt,
    ),
  )

  function modeLabel (mode: GameMode): string {
    return mode === 'count-up' ? 'Count Up' : 'Count Down'
  }

  function formatTime (ms: number): string {
    const totalSec = Math.floor(ms / 1000)
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  function handleCreate (
    name: string,
    mode: GameMode,
    playerNames: string[],
    timeLimitMs: number,
  ) {
    const game = svc.createGame(
      name,
      mode,
      playerNames,
      timeLimitMs,
    )
    router.push(`/game/${game.id}`)
  }

  function handleDelete (gameId: string) {
    pendingDeleteId.value = gameId
    confirmDeleteDialog.value = true
  }

  function doDelete () {
    if (pendingDeleteId.value) {
      svc.deleteGame(pendingDeleteId.value)
      pendingDeleteId.value = null
    }
    confirmDeleteDialog.value = false
  }
</script>
