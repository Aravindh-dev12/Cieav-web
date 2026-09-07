<template>
  <section class="world-experience cosmic-experience" aria-label="Interactive CIEAV planetary internet model">
    <div
      ref="host"
      class="world-canvas-host"
      tabindex="0"
      aria-label="Navigate the probe with W A S D or the arrow keys. Move between trust orbits and press E near a beacon to inspect the layer."
    ></div>

    <div class="world-vignette" aria-hidden="true"></div>

    <aside v-if="!state.inspection" class="glass-panel scene-glass cosmic-intro" aria-label="Experience introduction">
      <div class="glass-kicker">
        <span>{{ cosmicWorld.eyebrow }}</span>
        <i aria-hidden="true"></i>
        <small>{{ cosmicWorld.name }}</small>
      </div>
      <h1>{{ cosmicWorld.title }}</h1>
      <p>{{ cosmicWorld.copy }}</p>
      <div class="scene-rule">
        <span>WORLD RULE</span>
        <strong>{{ cosmicWorld.rule }}</strong>
      </div>
    </aside>

    <div class="glass-chip control-hint">
      <span>TRANSFER</span>
      <kbd>W</kbd><kbd>S</kbd>
      <span>ORBIT</span>
      <kbd>A</kbd><kbd>D</kbd>
      <span>BOOST</span>
      <kbd>SHIFT</kbd>
    </div>

    <button
      v-if="state.prompt && !state.inspection"
      type="button"
      class="glass-panel interact-prompt"
      @click="interact"
    >
      <kbd>{{ state.prompt.key }}</kbd>
      <span>{{ state.prompt.label }}</span>
      <i aria-hidden="true">↗</i>
    </button>

    <div class="touch-controls" aria-label="Probe navigation controls">
      <button
        type="button"
        aria-label="Transfer inward"
        @pointerdown.prevent="startMove('w')"
        @pointerup="stopMove('w')"
        @pointercancel="stopMove('w')"
        @pointerleave="stopMove('w')"
      >↑</button>
      <button
        type="button"
        aria-label="Orbit left"
        @pointerdown.prevent="startMove('a')"
        @pointerup="stopMove('a')"
        @pointercancel="stopMove('a')"
        @pointerleave="stopMove('a')"
      >←</button>
      <button
        type="button"
        aria-label="Transfer outward"
        @pointerdown.prevent="startMove('s')"
        @pointerup="stopMove('s')"
        @pointercancel="stopMove('s')"
        @pointerleave="stopMove('s')"
      >↓</button>
      <button
        type="button"
        aria-label="Orbit right"
        @pointerdown.prevent="startMove('d')"
        @pointerup="stopMove('d')"
        @pointercancel="stopMove('d')"
        @pointerleave="stopMove('d')"
      >→</button>
    </div>

    <Transition name="glass-rise">
      <aside v-if="state.inspection" class="glass-panel consequence-panel cosmic-layer-panel" aria-live="polite">
        <div class="consequence-panel__top">
          <div>
            <span>LAYER {{ activeLayer.index }} / {{ activeLayer.short }}</span>
            <strong>{{ activeLayer.name }}</strong>
          </div>
          <button type="button" aria-label="Close layer inspection" @click="closeInspection">×</button>
        </div>

        <div class="proposal-flow">
          <div>
            <span>ENTERS THIS ORBIT</span>
            <strong>{{ activeLayer.input }}</strong>
          </div>
          <i aria-hidden="true">→</i>
          <div class="proposal-flow__resolved">
            <span>LEAVES THIS ORBIT AS</span>
            <strong>{{ activeLayer.output }}</strong>
          </div>
        </div>

        <div class="consequence-grid cosmic-layer-grid">
          <div class="cosmic-trust-cell">
            <span>TRUST PROPERTY</span>
            <strong>{{ activeLayer.trust }}</strong>
          </div>
          <div class="authority-cell">
            <span>AUTHORITY</span>
            <strong>{{ activeLayer.authority }}</strong>
          </div>
        </div>

        <div class="canonical-row">
          <span>NETWORK ROUTE</span>
          <code>{{ activeLayer.route }}</code>
        </div>

        <div class="proof-row">
          <span>PROOF / READBACK</span>
          <div>
            <b v-for="item in activeLayer.proof" :key="item">{{ item }}</b>
          </div>
        </div>

        <p class="consequence-note">
          This orbit is one trust transformation in the CIEAV network model. The visual system stays non-human: probe, planet, spacecraft, signals, and verifiable boundaries.
        </p>

        <button type="button" class="glass-action" @click="closeInspection">
          RETURN TO ORBIT <span>ESC</span>
        </button>
      </aside>
    </Transition>

    <div v-if="error" class="glass-panel world-error" role="alert">
      <strong>Rendering could not start.</strong>
      <p>{{ error }}</p>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { CosmicRuntime } from './engine/CosmicRuntime.js'
import { cosmicWorld, internetLayers } from './cieav/cosmicModel.js'

const emit = defineEmits(['state-change'])
const host = ref(null)
const error = ref('')
let runtime = null

const state = reactive({
  mode: 'cosmic',
  renderer: 'INITIALIZING',
  location: 'NEXUS-7 ORBIT',
  prompt: null,
  inspection: false,
  transition: null,
  layer: null,
})

const activeLayer = computed(() => (
  internetLayers.find((layer) => layer.id === state.layer) || internetLayers[0]
))

function applyState(next) {
  Object.assign(state, next)
  emit('state-change', { ...state })
}

function interact() {
  runtime?.interact()
}

function closeInspection() {
  runtime?.closeInspection()
}

function startMove(key) {
  runtime?.startVirtualMove(key)
}

function stopMove(key) {
  runtime?.stopVirtualMove(key)
}

onMounted(async () => {
  try {
    runtime = new CosmicRuntime(host.value, { onState: applyState })
    await runtime.init()
    host.value?.focus({ preventScroll: true })
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Unknown renderer error.'
  }
})

onBeforeUnmount(() => {
  runtime?.destroy()
})
</script>
