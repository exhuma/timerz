import type { InjectionKey } from 'vue'
import type { Game, GameMode, Player } from './types'
import { reactive } from 'vue'

const STORAGE_KEY = 'timerz-games'

function loadGames (): Game[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }
    const data = JSON.parse(raw) as Game[]
    // Always start games as not running on load.
    return data.map(g => ({ ...g, running: false }))
  } catch {
    return []
  }
}

const games = reactive<Game[]>(loadGames())

function save () {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games))
}

export function createGame (
  name: string,
  mode: GameMode,
  playerNames: string[],
  timeLimitMs: number,
): Game {
  const players: Player[] = playerNames.map(n => ({
    id: crypto.randomUUID(),
    name: n,
    elapsedMs: 0,
  }))
  const game: Game = {
    id: crypto.randomUUID(),
    name,
    mode,
    timeLimitMs,
    players,
    activePlayerId: players[0]?.id ?? null,
    running: false,
    createdAt: Date.now(),
  }
  games.push(game)
  save()
  return game
}

export function getGame (id: string): Game | undefined {
  return games.find(g => g.id === id)
}

/**
 * Tapping a player card:
 * - If the game is running and this player is already active → pause.
 * - Otherwise → make this player active and start the game.
 */
export function activatePlayer (
  gameId: string,
  playerId: string,
): void {
  const game = getGame(gameId)
  if (!game) {
    return
  }
  if (game.running && game.activePlayerId === playerId) {
    game.running = false
  } else {
    game.activePlayerId = playerId
    game.running = true
  }
  save()
}

/** Toggle the global running/paused state of a game. */
export function pauseGame (gameId: string): void {
  const game = getGame(gameId)
  if (!game) {
    return
  }
  game.running = !game.running
  save()
}

/**
 * Advance the active player's elapsed time by deltaMs.
 * In count-down mode the elapsed time is capped at timeLimitMs.
 */
export function tick (gameId: string, deltaMs: number): void {
  const game = getGame(gameId)
  if (!game || !game.running || !game.activePlayerId) {
    return
  }
  const player = game.players.find(
    p => p.id === game.activePlayerId,
  )
  if (!player) {
    return
  }
  if (game.mode === 'count-down') {
    if (player.elapsedMs >= game.timeLimitMs) {
      return
    }
    player.elapsedMs = Math.min(
      player.elapsedMs + deltaMs,
      game.timeLimitMs,
    )
  } else {
    player.elapsedMs += deltaMs
  }
  save()
}

/** Reset all timers and stop the game. */
export function resetGame (gameId: string): void {
  const game = getGame(gameId)
  if (!game) {
    return
  }
  game.running = false
  for (const p of game.players) {
    p.elapsedMs = 0
  }
  game.activePlayerId = game.players[0]?.id ?? null
  save()
}

/** Permanently remove a game. */
export function deleteGame (gameId: string): void {
  const idx = games.findIndex(g => g.id === gameId)
  if (idx !== -1) {
    games.splice(idx, 1)
    save()
  }
}

export function useGameService () {
  return {
    games,
    createGame,
    getGame,
    activatePlayer,
    pauseGame,
    tick,
    resetGame,
    deleteGame,
  }
}

export type GameServiceType = ReturnType<typeof useGameService>

export const GameServiceKey: InjectionKey<GameServiceType>
  = Symbol('gameService')
