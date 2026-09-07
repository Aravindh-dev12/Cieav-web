<template>
  <main class="cieav-app cosmic-app">
    <header class="glass-panel app-header cosmic-header">
      <a class="app-brand" href="#world" aria-label="CIEAV interactive planetary network">
        <img :src="logoMark" alt="" />
        <span>CIEAV</span>
      </a>

      <div class="app-header__state" aria-live="polite">
        <span>{{ worldState.location || 'NEXUS-7 ORBIT' }}</span>
        <strong>{{ worldState.layer ? `LAYER ${worldState.layer.toUpperCase()}` : 'AUTHORITY = 0' }}</strong>
      </div>

      <div class="app-header__help">
        <span>TRANSFER</span>
        <kbd>W</kbd><kbd>S</kbd>
        <span>ORBIT</span>
        <kbd>A</kbd><kbd>D</kbd>
        <span>CAMERA DRAG</span>
        <span>ZOOM SCROLL</span>
        <span>INSPECT</span>
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

const worldState = ref({
  location: 'NEXUS-7 ORBIT',
  layer: null,
})
</script>
