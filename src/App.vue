<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
  import { provide } from 'vue'
  import {
    GameServiceKey,
    useGameService,
  } from '@/services/gameService'

  provide(GameServiceKey, useGameService())
</script>
