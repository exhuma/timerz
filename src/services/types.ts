export type GameMode = 'count-up' | 'count-down'

export interface Player {
  id: string
  name: string
  elapsedMs: number
}

export interface Game {
  id: string
  name: string
  mode: GameMode
  /** Only relevant in count-down mode (milliseconds). */
  timeLimitMs: number
  players: Player[]
  activePlayerId: string | null
  running: boolean
  createdAt: number
}
