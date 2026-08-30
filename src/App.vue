<template>
  <main class="cieav-app">
    <header class="glass-panel app-header">
      <a class="app-brand" href="#world" aria-label="CIEAV interactive world">
        <img :src="logoMark" alt="" />
        <span>CIEAV</span>
      </a>

      <div class="app-header__state" aria-live="polite">
        <span>{{ worldState.location === 'outside' ? 'COGNITIVE WORLD' : worldState.location === 'boundary' ? 'INTEGRITY BOUNDARY' : 'CONSEQUENCE BUILDING' }}</span>
        <strong>AUTHORITY = 0</strong>
      </div>

      <div class="app-header__help">
        <span>WALK</span>
        <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>
        <span>INTERACT</span>
        <kbd>E</kbd>
      </div>
    </header>

    <WalkWorld id="world" @state-change="worldState = $event" />
  </main>
</template>

<script setup>
import { ref } from 'vue'
import WalkWorld from './world/WalkWorld.vue'
import logoMark from './public/logo.png'

const worldState = ref({ location: 'outside' })
</script>
