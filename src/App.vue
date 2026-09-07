<template>
  <main class="cieav-app cosmic-app">
    <header class="cosmic-hud" aria-label="CIEAV navigation status">
      <a class="cosmic-brand" href="#world" aria-label="CIEAV interactive planetary network">
        <img :src="logoMark" alt="" />
        <span>CIEAV</span>
      </a>

      <div class="cosmic-hud__state" aria-live="polite">
        <span>{{ worldState.location || 'NEXUS-7 ORBIT' }}</span>
        <strong>{{ worldState.layer ? worldState.layer.toUpperCase() : 'DEEP SPACE' }}</strong>
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
