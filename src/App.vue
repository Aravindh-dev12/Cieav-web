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
        <div class="walk-atmosphere" aria-hidden="true"></div>
        <div class="walk-sun" aria-hidden="true"></div>

        <div class="parallax-layer parallax-layer--far" :style="farStyle" aria-hidden="true">
          <i v-for="n in 14" :key="`far-${n}`"></i>
        </div>
        <div class="parallax-layer parallax-layer--mid" :style="midStyle" aria-hidden="true">
          <i v-for="n in 18" :key="`mid-${n}`"></i>
        </div>

        <div class="walk-world" :style="worldStyle" aria-hidden="true">
          <div class="world-ground world-ground--back"></div>
          <div class="world-ground world-ground--front"></div>
          <div class="world-path"></div>

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
          <svg class="walk-person" viewBox="0 0 72 138" role="presentation">
            <g class="person-body">
              <g class="person-head-group">
                <ellipse class="person-head" cx="38" cy="18" rx="10.5" ry="12" />
                <path class="person-hair" d="M27 17c0-9 5-15 12-15 7 0 12 5 12 13-5-2-9-5-12-9-2 4-6 8-12 11Z" />
                <path class="person-neck" d="M34 29h8v10h-8z" />
              </g>

              <path class="person-torso" d="M27 39c3-4 8-6 12-6 5 0 10 2 13 6l-2 37H29l-2-37Z" />
              <path class="person-hip" d="M29 72h21l-2 12H31z" />

              <g class="person-arm person-arm--back">
                <path class="person-sleeve" d="M29 42c-5 2-9 6-11 13l5 3c3-5 6-8 10-9Z" />
                <path class="person-limb" d="M22 56 13 77" />
                <circle class="person-hand" cx="12" cy="80" r="3" />
              </g>

              <g class="person-arm person-arm--front">
                <path class="person-sleeve" d="M49 42c5 2 9 6 11 13l-5 3c-3-5-6-8-10-9Z" />
                <path class="person-limb" d="M56 56 65 77" />
                <circle class="person-hand" cx="66" cy="80" r="3" />
              </g>

              <g class="person-leg person-leg--back">
                <path class="person-trouser" d="M34 81 30 108" />
                <path class="person-limb person-calf" d="M30 107 25 129" />
                <path class="person-shoe" d="M23 127h10c1 0 2 2 1 3l-13 2c-2 0-2-3 2-5Z" />
              </g>

              <g class="person-leg person-leg--front">
                <path class="person-trouser" d="M45 81 49 108" />
                <path class="person-limb person-calf" d="M49 107 55 129" />
                <path class="person-shoe" d="M53 127h11c2 1 2 3 0 4l-13 1c-2 0-2-3 2-5Z" />
              </g>
            </g>
          </svg>
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

const travelDistance = computed(() => {
  const viewportWidth = viewport.value?.clientWidth || window.innerWidth
  return Math.max(0, worldWidth.value - viewportWidth)
})

const worldStyle = computed(() => ({
  width: `${worldWidth.value}px`,
  transform: `translate3d(${-progress.value * travelDistance.value}px, 0, 0)`,
}))

const farStyle = computed(() => ({
  transform: `translate3d(${-progress.value * travelDistance.value * 0.14}px, 0, 0)`,
}))

const midStyle = computed(() => ({
  transform: `translate3d(${-progress.value * travelDistance.value * 0.36}px, 0, 0)`,
}))

const travelerStyle = computed(() => ({
  '--traveler-color': currentArea.value.color,
}))

function updateWorldWidth() {
  const width = viewport.value?.clientWidth || window.innerWidth
  worldWidth.value = Math.max(3400, width * 4.8)
}

function walkFrame(time) {
  if (!previousTime) previousTime = time
  const delta = Math.min(32, time - previousTime)
  previousTime = time

  if (isWalking.value) {
    const speed = 0.00015 * delta
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
