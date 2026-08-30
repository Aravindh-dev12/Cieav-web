<template>
  <main class="journey-site" @pointermove="trackPointer">
    <header class="journey-header">
      <a class="journey-brand" href="#walk" aria-label="CIEAV home">
        <img :src="logoMark" alt="" />
        <span>CIEAV</span>
      </a>

      <div class="journey-meta" aria-live="polite">
        <span>{{ currentArea.number }} / {{ currentTerrain.label }}</span>
        <strong>{{ currentArea.title }}</strong>
      </div>

      <span class="journey-hint">HOLD A / D OR ← / →</span>
    </header>

    <section id="walk" ref="walkSection" class="walk-section" aria-label="Walk the CIEAV consequence path">
      <div ref="viewport" class="walk-viewport">
        <div class="walk-atmosphere" aria-hidden="true"></div>
        <div class="walk-sun" aria-hidden="true"></div>

        <div class="parallax-layer parallax-layer--far" :style="farStyle" aria-hidden="true">
          <i v-for="n in 16" :key="`far-${n}`"></i>
        </div>

        <div class="parallax-layer parallax-layer--mid" :style="midStyle" aria-hidden="true">
          <i v-for="n in 20" :key="`mid-${n}`"></i>
        </div>

        <div class="walk-world" :style="worldStyle" aria-hidden="true">
          <div class="terrain terrain--flat-one"></div>
          <div class="terrain terrain--slope-up"></div>
          <div class="terrain-stairs terrain-stairs--up">
            <i v-for="n in 7" :key="`up-${n}`"></i>
          </div>
          <div class="terrain terrain--ridge"></div>
          <div class="terrain terrain--crooked"></div>
          <div class="terrain terrain--slope-down"></div>
          <div class="terrain-stairs terrain-stairs--down">
            <i v-for="n in 6" :key="`down-${n}`"></i>
          </div>
          <div class="terrain terrain--final"></div>

          <div class="scene-arch scene-arch--one"></div>
          <div class="scene-arch scene-arch--two"></div>
          <div class="scene-posts scene-posts--one"><i v-for="n in 5" :key="n"></i></div>
          <div class="scene-posts scene-posts--two"><i v-for="n in 4" :key="n"></i></div>
          <div class="scene-stones"><i v-for="n in 11" :key="n"></i></div>

          <article
            v-for="area in areas"
            :key="area.slug"
            class="world-area"
            :class="`world-area--${area.slug}`"
            :style="{ left: `${area.at * 100}%`, '--area-color': area.color }"
          >
            <span>{{ area.number }} / {{ area.eyebrow }}</span>
            <h2>{{ area.title }}</h2>
            <p>{{ area.copy }}</p>
          </article>
        </div>

        <div
          class="walk-traveler"
          :class="{
            'is-walking': isWalking,
            'is-left': direction < 0,
            [`terrain-${currentTerrain.slug}`]: true,
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

        <div class="journey-card" aria-live="polite">
          <span>{{ currentArea.number }} / {{ currentTerrain.label }}</span>
          <strong>{{ currentArea.title }}</strong>
          <p>{{ currentArea.copy }}</p>
        </div>

        <div class="journey-map" aria-label="Journey map">
          <span>PATH</span>
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
          <span>{{ isWalking ? 'WALKING' : currentTerrain.label }}</span>
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
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import logoMark from './public/logo.png'

const walkSection = ref(null)
const viewport = ref(null)
const progress = ref(0.015)
const direction = ref(1)
const isWalking = ref(false)
const worldWidth = ref(5200)
let rafId = 0
let previousTime = 0
const heldKeys = new Set()

const areas = [
  {
    number: '00',
    slug: 'arrival',
    eyebrow: 'ENTRANCE',
    title: 'Arrival',
    copy: 'The path begins quietly. Keep moving and the ground starts to change.',
    color: '#67736d',
    at: 0.035,
  },
  {
    number: '01',
    slug: 'intent',
    eyebrow: 'INPUT / INTENT',
    title: 'Intent',
    copy: 'The route begins to rise. Understanding is useful, but it is not permission.',
    color: '#71867c',
    at: 0.19,
  },
  {
    number: '02',
    slug: 'preview',
    eyebrow: 'BOUNDARY / PREVIEW',
    title: 'Preview',
    copy: 'The traveler reaches the stairs. Consequence becomes visible before the climb continues.',
    color: '#b58b46',
    at: 0.34,
  },
  {
    number: '03',
    slug: 'commit',
    eyebrow: 'AUTHORITY / COMMIT',
    title: 'Commit',
    copy: 'On the raised landing, authority is explicit. The boundary is crossed once.',
    color: '#9f1717',
    at: 0.53,
  },
  {
    number: '04',
    slug: 'observe',
    eyebrow: 'EVIDENCE / OBSERVE',
    title: 'Observe',
    copy: 'The path bends and descends. Dispatch is not success; the outcome still has to be seen.',
    color: '#627c92',
    at: 0.73,
  },
  {
    number: '05',
    slug: 'verified',
    eyebrow: 'OUTCOME / VERIFIED',
    title: 'Verified',
    copy: 'A final set of steps returns to level ground. Evidence resolves the journey.',
    color: '#47745d',
    at: 0.95,
  },
]

const terrains = [
  { slug: 'flat', label: 'FLAT PATH', from: 0, to: 0.12 },
  { slug: 'rise', label: 'RISING PATH', from: 0.12, to: 0.25 },
  { slug: 'stairs-up', label: 'STAIRS UP', from: 0.25, to: 0.39 },
  { slug: 'ridge', label: 'RAISED LANDING', from: 0.39, to: 0.56 },
  { slug: 'crooked', label: 'CROOKED PATH', from: 0.56, to: 0.7 },
  { slug: 'descent', label: 'DESCENT', from: 0.7, to: 0.83 },
  { slug: 'stairs-down', label: 'STAIRS DOWN', from: 0.83, to: 0.92 },
  { slug: 'final', label: 'FINAL GROUND', from: 0.92, to: 1.01 },
]

const currentArea = computed(() => {
  return areas.reduce((nearest, area) => {
    return Math.abs(progress.value - area.at) < Math.abs(progress.value - nearest.at) ? area : nearest
  }, areas[0])
})

const currentTerrain = computed(() => terrains.find((terrain) => progress.value >= terrain.from && progress.value < terrain.to) || terrains[terrains.length - 1])

const travelDistance = computed(() => {
  const viewportWidth = viewport.value?.clientWidth || window.innerWidth
  return Math.max(0, worldWidth.value - viewportWidth)
})

const worldStyle = computed(() => ({
  width: `${worldWidth.value}px`,
  transform: `translate3d(${-progress.value * travelDistance.value}px, 0, 0)`,
}))

const farStyle = computed(() => ({
  transform: `translate3d(${-progress.value * travelDistance.value * 0.12}px, 0, 0)`,
}))

const midStyle = computed(() => ({
  transform: `translate3d(${-progress.value * travelDistance.value * 0.34}px, 0, 0)`,
}))

function smoothstep(value) {
  return value * value * (3 - 2 * value)
}

function terrainState(at) {
  let y = 0
  let tilt = 0

  if (at < 0.12) {
    y = 0
  } else if (at < 0.25) {
    const t = smoothstep((at - 0.12) / 0.13)
    y = t * 34
    tilt = -4
  } else if (at < 0.39) {
    const t = (at - 0.25) / 0.14
    const step = Math.min(6, Math.floor(t * 7))
    y = 34 + step * 10
    tilt = -1
  } else if (at < 0.56) {
    y = 94
  } else if (at < 0.7) {
    const t = (at - 0.56) / 0.14
    y = 94 + Math.sin(t * Math.PI * 3) * 7 - t * 16
    tilt = Math.sin(t * Math.PI * 3) * 4
  } else if (at < 0.83) {
    const t = smoothstep((at - 0.7) / 0.13)
    y = 78 - t * 48
    tilt = 4
  } else if (at < 0.92) {
    const t = (at - 0.83) / 0.09
    const step = Math.min(5, Math.floor(t * 6))
    y = 30 - step * 6
    tilt = 1
  }

  return { y: Math.max(0, y), tilt }
}

const travelerStyle = computed(() => {
  const terrain = terrainState(progress.value)
  return {
    '--traveler-color': currentArea.value.color,
    '--terrain-y': `${terrain.y}px`,
    '--terrain-tilt': `${terrain.tilt}deg`,
  }
})

function updateWorldWidth() {
  const width = viewport.value?.clientWidth || window.innerWidth
  worldWidth.value = Math.max(5000, width * 6.2)
}

function walkFrame(time) {
  if (!previousTime) previousTime = time
  const delta = Math.min(32, time - previousTime)
  previousTime = time

  if (isWalking.value) {
    const speed = 0.00012 * delta
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

onMounted(() => {
  updateWorldWidth()
  window.addEventListener('resize', updateWorldWidth)
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
  rafId = requestAnimationFrame(walkFrame)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('resize', updateWorldWidth)
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
})
</script>
