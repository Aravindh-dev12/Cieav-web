<template>
  <section class="world-experience" aria-label="Interactive CIEAV consequence world">
    <div
      ref="host"
      class="world-canvas-host"
      tabindex="0"
      aria-label="Walk directly through the world with W A S D or the arrow keys. Press E near interactive objects."
    ></div>

    <div class="world-vignette" aria-hidden="true"></div>

    <div class="glass-chip control-hint">
      <span>MOVE</span>
      <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>
      <span>OR</span>
      <kbd>↑</kbd><kbd>←</kbd><kbd>↓</kbd><kbd>→</kbd>
      <span>RUN</span>
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

    <div class="touch-controls" aria-label="Direct walking controls">
      <button
        type="button"
        aria-label="Walk forward"
        @pointerdown.prevent="startMove('w')"
        @pointerup="stopMove('w')"
        @pointercancel="stopMove('w')"
        @pointerleave="stopMove('w')"
      >↑</button>
      <button
        type="button"
        aria-label="Move left"
        @pointerdown.prevent="startMove('a')"
        @pointerup="stopMove('a')"
        @pointercancel="stopMove('a')"
        @pointerleave="stopMove('a')"
      >←</button>
      <button
        type="button"
        aria-label="Walk backward"
        @pointerdown.prevent="startMove('s')"
        @pointerup="stopMove('s')"
        @pointercancel="stopMove('s')"
        @pointerleave="stopMove('s')"
      >↓</button>
      <button
        type="button"
        aria-label="Move right"
        @pointerdown.prevent="startMove('d')"
        @pointerup="stopMove('d')"
        @pointercancel="stopMove('d')"
        @pointerleave="stopMove('d')"
      >→</button>
    </div>

    <Transition name="glass-rise">
      <aside v-if="state.inspection" class="glass-panel consequence-panel" aria-live="polite">
        <div class="consequence-panel__top">
          <div>
            <span>{{ consequenceScenario.stage }}</span>
            <strong>{{ consequenceScenario.objective }}</strong>
          </div>
          <button type="button" aria-label="Close consequence inspection" @click="closeInspection">×</button>
        </div>

        <div class="proposal-flow">
          <div>
            <span>MODEL / AGENT PROPOSAL</span>
            <strong>{{ consequenceScenario.proposal }}</strong>
          </div>
          <i aria-hidden="true">→</i>
          <div class="proposal-flow__resolved">
            <span>TRUSTED CONSEQUENCE</span>
            <strong>{{ consequenceScenario.primary.type }}</strong>
          </div>
        </div>

        <div class="consequence-grid">
          <div>
            <span>VALUE</span>
            <strong>{{ consequenceScenario.primary.amount }}</strong>
          </div>
          <div>
            <span>TARGET</span>
            <strong>{{ consequenceScenario.primary.target }}</strong>
          </div>
          <div>
            <span>REASON</span>
            <strong>{{ consequenceScenario.primary.reason }}</strong>
          </div>
          <div class="authority-cell">
            <span>AUTHORITY</span>
            <strong>{{ consequenceScenario.authority }}</strong>
          </div>
        </div>

        <div class="canonical-row">
          <span>CANONICAL REALITY</span>
          <code>{{ consequenceScenario.canonicalReality }}</code>
        </div>

        <div class="proof-row">
          <span>PROOF PLAN</span>
          <div>
            <b v-for="item in consequenceScenario.proofPlan" :key="item">{{ item }}</b>
          </div>
        </div>

        <p class="consequence-note">
          Nothing executes here. This room only makes the proposed consequence explicit and proofable.
        </p>

        <button type="button" class="glass-action" @click="closeInspection">
          RETURN TO ROOM <span>ESC</span>
        </button>
      </aside>
    </Transition>

    <div v-if="state.transition" class="transition-status" aria-live="polite">
      <span>{{ state.transition === 'entering' ? 'CROSSING THE INTEGRITY BOUNDARY' : 'RETURNING TO THE COGNITIVE WORLD' }}</span>
    </div>

    <div v-if="error" class="glass-panel world-error" role="alert">
      <strong>Rendering could not start.</strong>
      <p>{{ error }}</p>
    </div>
  </section>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { PhotorealRuntime } from './engine/PhotorealRuntime.js'
import { consequenceScenario } from './cieav/journeyDefinition.js'

const emit = defineEmits(['state-change'])
const host = ref(null)
const error = ref('')
let runtime = null

const state = reactive({
  mode: 'outside',
  renderer: 'INITIALIZING',
  location: 'outside',
  prompt: null,
  inspection: false,
  transition: null,
})

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
    runtime = new PhotorealRuntime(host.value, { onState: applyState })
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
