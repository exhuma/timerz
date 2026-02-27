<template>
  <v-dialog
    max-width="560"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title>New Game</v-card-title>

      <v-card-text>
        <v-text-field
          v-model="form.name"
          autofocus
          label="Game name"
        />

        <v-select
          v-model="form.mode"
          :items="modeItems"
          label="Game mode"
        />

        <v-text-field
          v-if="form.mode === 'count-down'"
          v-model.number="form.timeLimitMinutes"
          label="Time limit per player (minutes)"
          min="1"
          type="number"
        />

        <div
          class="d-flex align-center justify-space-between mb-2"
        >
          <span class="text-subtitle-1">Players</span>
          <div>
            <v-btn
              :disabled="form.playerNames.length <= 2"
              icon="mdi-minus"
              size="small"
              variant="text"
              @click="removePlayer"
            />
            <v-btn
              :disabled="form.playerNames.length >= 8"
              icon="mdi-plus"
              size="small"
              variant="text"
              @click="addPlayer"
            />
          </div>
        </div>

        <v-text-field
          v-for="(_, i) in form.playerNames"
          :key="i"
          v-model="form.playerNames[i]"
          density="compact"
          :label="`Player ${i + 1}`"
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn @click="cancel">Cancel</v-btn>
        <v-btn
          color="primary"
          :disabled="!isValid"
          @click="submit"
        >
          Create
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  import type { GameMode } from '@/services/types'
  import { computed, reactive } from 'vue'

  defineProps<{ modelValue: boolean }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'create': [
      name: string,
      mode: GameMode,
      playerNames: string[],
      timeLimitMs: number,
    ]
  }>()

  const modeItems = [
    { title: 'Count Up', value: 'count-up' },
    { title: 'Count Down', value: 'count-down' },
  ]

  function defaultForm () {
    return {
      name: '',
      mode: 'count-up' as GameMode,
      timeLimitMinutes: 5,
      playerNames: ['Player 1', 'Player 2'],
    }
  }

  const form = reactive(defaultForm())

  const isValid = computed(
    () =>
      form.name.trim() !== ''
      && form.playerNames.every(n => n.trim() !== ''),
  )

  function addPlayer () {
    form.playerNames.push(
      `Player ${form.playerNames.length + 1}`,
    )
  }

  function removePlayer () {
    if (form.playerNames.length > 2) form.playerNames.pop()
  }

  function cancel () {
    emit('update:modelValue', false)
  }

  function submit () {
    if (!isValid.value) return
    const timeLimitMs
      = form.mode === 'count-down'
        ? form.timeLimitMinutes * 60 * 1000
        : 0
    emit(
      'create',
      form.name.trim(),
      form.mode,
      form.playerNames.map(n => n.trim()),
      timeLimitMs,
    )
    emit('update:modelValue', false)
    Object.assign(form, defaultForm())
  }
</script>
