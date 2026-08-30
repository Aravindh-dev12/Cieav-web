<template>
  <main class="site" @pointermove="trackPointer">
    <div class="cursor-cross" aria-hidden="true"></div>

    <header class="topbar">
      <a class="wordmark" href="#top" aria-label="Cieav home">
        <img :src="logoMark" alt="" class="wordmark-logo" />
        <span>Cieav</span>
      </a>

      <nav class="nav" aria-label="Primary navigation">
        <a href="#walk">Walk</a>
      </nav>

      <a class="primary-button topbar-cta magnetic" href="#walk">Enter World</a>
    </header>

    <section
      id="top"
      class="hero"
      :style="{ backgroundImage: `url(${formulaStairs})` }"
    >
      <div class="hero-grid" aria-hidden="true"></div>

      <div class="hero-copy reveal-on-load">
        <p class="kicker"><span></span> The commit layer for the internet</p>
        <h1>Local Authority.<br />Verified Consequence.</h1>
        <p class="hero-lede">
          CIEAV is an always-on local control plane between digital intent and digital consequence.
          Cloud interprets. The local Gateway decides, commits, verifies, and exposes Undo only when success
          and a concrete inverse are observed.
        </p>

        <div class="hero-actions">
          <a class="primary-button primary-button--large magnetic" href="#walk">Walk the path</a>
          <a class="outline-button magnetic" href="#walk">Use ← / →</a>
        </div>
      </div>

      <div class="hero-index hero-index--left" aria-hidden="true">
        <span>01</span>
        <span>LOCAL / AUTHORITY</span>
      </div>
      <div class="hero-index hero-index--right" aria-hidden="true">
        <span>2026</span>
        <span>CLOUD / INTERPRETATION</span>
      </div>
    </section>

    <section id="walk" ref="walkSection" class="walk-section" aria-label="Walk the CIEAV world">
      <div class="walk-head">
        <div>
          <span>ACT I / WALKABLE CIEAV</span>
          <strong>{{ currentArea.eyebrow }}</strong>
        </div>
        <p>Hold A / D or the arrow keys to walk.</p>
      </div>

      <div ref="viewport" class="walk-viewport">
        <div class="walk-sky" aria-hidden="true"></div>

        <div class="walk-world" :style="worldStyle" aria-hidden="true">
          <div class="world-line"></div>
          <div class="world-dots world-dots--one"></div>
          <div class="world-dots world-dots--two"></div>

          <article
            v-for="area in areas"
            :key="area.title"
            class="world-area"
            :class="`world-area--${area.slug}`"
            :style="{ left: `${area.at * 100}%`, '--area-color': area.color }"
          >
            <div class="world-area__landmark">
              <i v-for="n in area.landmarks" :key="n"></i>
            </div>
            <span>{{ area.number }}</span>
            <h2>{{ area.title }}</h2>
            <p>{{ area.copy }}</p>
          </article>

          <div class="world-gate world-gate--start">
            <span>STAIRS / ENTRANCE</span>
          </div>

          <div class="world-gate world-gate--end">
            <span>VERIFIED / EXIT</span>
          </div>
        </div>

        <div
          class="walk-traveler"
          :class="{
            'is-walking': isWalking,
            'is-left': direction < 0,
          }"
          :style="travelerStyle"
          aria-hidden="true"
        >
          <div class="walk-shadow"></div>
          <div class="walk-person">
            <span class="walk-head-shape"></span>
            <span class="walk-body"></span>
            <span class="walk-arm walk-arm--front"></span>
            <span class="walk-arm walk-arm--back"></span>
            <span class="walk-leg walk-leg--front"></span>
            <span class="walk-leg walk-leg--back"></span>
          </div>
        </div>

        <div class="walk-area-card" aria-live="polite">
          <span>{{ currentArea.number }} / {{ currentArea.eyebrow }}</span>
          <strong>{{ currentArea.title }}</strong>
          <p>{{ currentArea.copy }}</p>
        </div>

        <div class="walk-map" aria-label="Journey map">
          <span>JOURNEY</span>
          <button
            v-for="area in areas"
            :key="area.slug"
            type="button"
            :class="{ 'is-active': currentArea.slug === area.slug, 'is-passed': progress >= area.at }"
            :style="{ '--map-color': area.color }"
            :aria-label="`Go to ${area.title}`"
            @click="goToArea(area.at)"
          ></button>
          <strong>{{ Math.round(progress * 100) }}%</strong>
        </div>
      </div>

      <div class="walk-controls">
        <button
          type="button"
          :disabled="progress <= 0"
          @pointerdown.prevent="startWalking(-1)"
          @pointerup="stopWalking"
          @pointercancel="stopWalking"
          @pointerleave="stopWalking"
        >
          <kbd>←</kbd>
          <span>BACK</span>
          <small>A</small>
        </button>

        <div class="walk-controls__center">
          <span>{{ isWalking ? 'WALKING' : 'READY' }}</span>
          <strong>{{ currentArea.title }}</strong>
        </div>

        <button
          type="button"
          :disabled="progress >= 1"
          @pointerdown.prevent="startWalking(1)"
          @pointerup="stopWalking"
          @pointercancel="stopWalking"
          @pointerleave="stopWalking"
        >
          <small>D</small>
          <span>FORWARD</span>
          <kbd>→</kbd>
        </button>
      </div>

      <p class="walk-mobile-note">On touch devices, hold the left or right control to walk.</p>
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import logoMark from './public/logo.png'
import formulaStairs from './formula-stairs.png'

const walkSection = ref(null)
const viewport = ref(null)
const progress = ref(0)
const direction = ref(1)
const isWalking = ref(false)
const worldWidth = ref(3600)
let rafId = 0
let previousTime = 0
const heldKeys = new Set()

const areas = [
  {
    number: '00',
    slug: 'entrance',
    eyebrow: 'ENTRANCE',
    title: 'Arrival',
    copy: 'Leave the stairs and enter the consequence path.',
    color: '#6f7a73',
    at: 0.03,
    landmarks: 4,
  },
  {
    number: '01',
    slug: 'intent',
    eyebrow: 'INPUT / INTENT',
    title: 'Intent',
    copy: 'Understanding begins. Authority does not.',
    color: '#71867c',
    at: 0.22,
    landmarks: 7,
  },
  {
    number: '02',
    slug: 'preview',
    eyebrow: 'BOUNDARY / PREVIEW',
    title: 'Preview',
    copy: 'The real consequence becomes visible before anything changes.',
    color: '#b58b46',
    at: 0.43,
    landmarks: 5,
  },
  {
    number: '03',
    slug: 'commit',
    eyebrow: 'AUTHORITY / COMMIT',
    title: 'Commit',
    copy: 'Explicit local authority crosses the boundary once.',
    color: '#a81515',
    at: 0.62,
    landmarks: 8,
  },
  {
    number: '04',
    slug: 'observe',
    eyebrow: 'EVIDENCE / OBSERVE',
    title: 'Observe',
    copy: 'Dispatch is not success. The result must be observed.',
    color: '#627c92',
    at: 0.8,
    landmarks: 6,
  },
  {
    number: '05',
    slug: 'verified',
    eyebrow: 'OUTCOME / VERIFIED',
    title: 'Verified',
    copy: 'Evidence resolves the outcome and earns recovery.',
    color: '#47745d',
    at: 0.97,
    landmarks: 4,
  },
]

const currentArea = computed(() => {
  return areas.reduce((nearest, area) => {
    return Math.abs(progress.value - area.at) < Math.abs(progress.value - nearest.at) ? area : nearest
  }, areas[0])
})

const worldStyle = computed(() => ({
  width: `${worldWidth.value}px`,
  transform: `translate3d(${-progress.value * Math.max(0, worldWidth.value - (viewport.value?.clientWidth || window.innerWidth))}px, 0, 0)`,
}))

const travelerStyle = computed(() => ({
  '--traveler-color': currentArea.value.color,
}))

function updateWorldWidth() {
  const width = viewport.value?.clientWidth || window.innerWidth
  worldWidth.value = Math.max(3200, width * 4.6)
}

function walkFrame(time) {
  if (!previousTime) previousTime = time
  const delta = Math.min(32, time - previousTime)
  previousTime = time

  if (isWalking.value) {
    const speed = 0.00018 * delta
    progress.value = Math.max(0, Math.min(1, progress.value + direction.value * speed))
    if (progress.value <= 0 || progress.value >= 1) stopWalking()
  }

  rafId = requestAnimationFrame(walkFrame)
}

function startWalking(nextDirection) {
  direction.value = nextDirection
  isWalking.value = true
}

function stopWalking() {
  isWalking.value = false
}

function goToArea(at) {
  progress.value = Math.max(0, Math.min(1, at))
}

function handleKeyDown(event) {
  const key = event.key.toLowerCase()
  if (!['arrowleft', 'arrowright', 'a', 'd'].includes(key)) return
  if (!walkSection.value) return

  const rect = walkSection.value.getBoundingClientRect()
  const inWalk = rect.top < window.innerHeight * 0.5 && rect.bottom > window.innerHeight * 0.5
  if (!inWalk) return

  event.preventDefault()
  heldKeys.add(key)
  if (key === 'arrowleft' || key === 'a') startWalking(-1)
  if (key === 'arrowright' || key === 'd') startWalking(1)
}

function handleKeyUp(event) {
  const key = event.key.toLowerCase()
  heldKeys.delete(key)
  if (!heldKeys.size) stopWalking()
}

function trackPointer(event) {
  document.documentElement.style.setProperty('--mx', `${event.clientX}px`)
  document.documentElement.style.setProperty('--my', `${event.clientY}px`)
}

function bindMagnetic() {
  const cleanups = []
  document.querySelectorAll('.magnetic').forEach((element) => {
    const move = (event) => {
      const rect = element.getBoundingClientRect()
      const x = event.clientX - rect.left - rect.width / 2
      const y = event.clientY - rect.top - rect.height / 2
      element.style.transform = `translate(${x * 0.075}px, ${y * 0.075}px)`
    }
    const leave = () => { element.style.transform = '' }
    element.addEventListener('pointermove', move)
    element.addEventListener('pointerleave', leave)
    cleanups.push(() => {
      element.removeEventListener('pointermove', move)
      element.removeEventListener('pointerleave', leave)
    })
  })
  return () => cleanups.forEach((cleanup) => cleanup())
}

let unbindMagnetic

onMounted(() => {
  updateWorldWidth()
  window.addEventListener('resize', updateWorldWidth)
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
  unbindMagnetic = bindMagnetic()
  rafId = requestAnimationFrame(walkFrame)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('resize', updateWorldWidth)
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
  unbindMagnetic?.()
})
</script>
