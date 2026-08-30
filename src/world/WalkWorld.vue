<template>
  <section class="world-experience" aria-label="Interactive CIEAV consequence world">
    <div ref="host" class="world-canvas-host" tabindex="0" aria-label="Walk with A and D or the arrow keys. Press E near interactive objects."></div>

    <div class="world-vignette" aria-hidden="true"></div>

    <aside class="glass-panel scene-glass" aria-live="polite">
      <div class="glass-kicker">
        <span>{{ activeCopy.eyebrow }}</span>
        <i></i>
        <small>{{ state.renderer }}</small>
      </div>
      <h1>{{ activeCopy.title }}</h1>
      <p>{{ activeCopy.copy }}</p>
      <div class="scene-rule">
        <span>AUTHORITY</span>
        <strong>0</strong>
      </div>
    </aside>

    <div class="glass-chip control-hint">
      <span>MOVE</span>
      <kbd>A</kbd><kbd>D</kbd>
      <span>OR</span>
      <kbd>←</kbd><kbd>→</kbd>
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

    <div class="touch-controls" aria-label="Walking controls">
      <button
        type="button"
        aria-label="Walk left"
        @pointerdown.prevent="startMove(-1)"
        @pointerup="stopMove(-1)"
        @pointercancel="stopMove(-1)"
        @pointerleave="stopMove(-1)"
      >←</button>
      <button
        type="button"
        aria-label="Walk right"
        @pointerdown.prevent="startMove(1)"
        @pointerup="stopMove(1)"
        @pointercancel="stopMove(1)"
        @pointerleave="stopMove(1)"
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
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { WorldRuntime } from './engine/WorldRuntime.js'
import { consequenceScenario, worldCopy } from './cieav/journeyDefinition.js'

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

const activeCopy = computed(() => {
  if (state.location === 'boundary') return worldCopy.door
  if (state.location === 'inside' || state.location === 'compiler') return worldCopy.inside
  return worldCopy.outside
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

function startMove(direction) {
  runtime?.startVirtualMove(direction)
}

function stopMove(direction) {
  runtime?.stopVirtualMove(direction)
}

onMounted(async () => {
  try {
    runtime = new WorldRuntime(host.value, { onState: applyState })
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
