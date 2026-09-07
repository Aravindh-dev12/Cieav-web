<template>
  <section class="world-experience cosmic-experience" aria-label="Interactive CIEAV planetary internet model">
    <div
      ref="host"
      class="world-canvas-host"
      tabindex="0"
      aria-label="Navigate the probe with W A S D or the arrow keys. Move between trust orbits and press E near a beacon to inspect the layer."
    ></div>

    <div class="world-vignette" aria-hidden="true"></div>

    <div class="cosmic-control-line" aria-hidden="true">
      <span>W/S TRANSFER</span>
      <i></i>
      <span>A/D ORBIT</span>
      <i></i>
      <span>DRAG CAMERA</span>
      <i></i>
      <span>SCROLL RANGE</span>
    </div>

    <button
      v-if="state.prompt && !state.inspection"
      type="button"
      class="cosmic-interact"
      @click="interact"
    >
      <kbd>{{ state.prompt.key }}</kbd>
      <span>{{ state.prompt.label }}</span>
    </button>

    <div class="touch-controls cosmic-touch-controls" aria-label="Probe navigation controls">
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
      <aside v-if="state.inspection" class="cosmic-layer-panel" aria-live="polite">
        <div class="cosmic-layer-panel__inner">
          <div class="cosmic-layer-panel__top">
            <div>
              <span>ORBIT {{ activeLayer.index }} / {{ activeLayer.short }}</span>
              <strong>{{ activeLayer.name }}</strong>
            </div>
            <button type="button" aria-label="Close layer inspection" @click="closeInspection">×</button>
          </div>

          <div class="cosmic-layer-flow">
            <div>
              <span>INPUT</span>
              <strong>{{ activeLayer.input }}</strong>
            </div>
            <i aria-hidden="true">→</i>
            <div>
              <span>OUTPUT</span>
              <strong>{{ activeLayer.output }}</strong>
            </div>
          </div>

          <p class="cosmic-layer-trust">{{ activeLayer.trust }}</p>

          <dl class="cosmic-layer-data">
            <div>
              <dt>AUTHORITY</dt>
              <dd>{{ activeLayer.authority }}</dd>
            </div>
            <div>
              <dt>NETWORK ROUTE</dt>
              <dd><code>{{ activeLayer.route }}</code></dd>
            </div>
            <div>
              <dt>PROOF / READBACK</dt>
              <dd>{{ activeLayer.proof.join(' · ') }}</dd>
            </div>
          </dl>

          <button type="button" class="cosmic-return" @click="closeInspection">
            RETURN TO ORBIT <span>ESC</span>
          </button>
        </div>
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
import { applyCinematicSpace } from './engine/three/CinematicSpace.js'
import { internetLayers } from './cieav/cosmicModel.js'

const emit = defineEmits(['state-change'])
const host = ref(null)
const error = ref('')
let runtime = null
let cinematic = null

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
    const baseWorldMotion = runtime.updateWorldMotion.bind(runtime)
    runtime.updateWorldMotion = (elapsed, dt) => {
      baseWorldMotion(elapsed, dt)
      cinematic?.update?.(elapsed, dt)
    }
    await runtime.init()
    cinematic = applyCinematicSpace(runtime)
    host.value?.focus({ preventScroll: true })
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Unknown renderer error.'
  }
})

onBeforeUnmount(() => {
  cinematic?.dispose?.()
  runtime?.destroy()
})
</script>
