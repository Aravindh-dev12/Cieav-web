<template>
  <main class="stairs-site">
    <header class="stairs-header">
      <a class="stairs-brand" href="#stairs" aria-label="CIEAV home">
        <img :src="logoMark" alt="" />
        <span>CIEAV</span>
      </a>

      <div class="stairs-header__meta">
        <span>{{ activeMilestone.number }}</span>
        <strong>{{ activeMilestone.label }}</strong>
      </div>

      <span class="stairs-header__hint">SCROLL TO WALK ↓</span>
    </header>

    <section id="stairs" ref="journey" class="stairs-journey" aria-label="Walk the CIEAV consequence path">
      <div class="stairs-stage" :style="stageStyle">
        <div class="stairs-stage__image" aria-hidden="true"></div>
        <div class="stairs-stage__veil" aria-hidden="true"></div>
        <div class="stairs-stage__grain" aria-hidden="true"></div>

        <div class="stairs-intro" :style="introStyle">
          <p>THE COMMIT LAYER FOR THE INTERNET</p>
          <h1>Walk the path<br />to consequence.</h1>
          <span>A local authority journey.</span>
        </div>

        <div class="stairs-route" aria-hidden="true">
          <i
            v-for="milestone in milestones"
            :key="milestone.label"
            :class="{
              'is-active': milestone.index === activeIndex,
              'is-passed': progress >= milestone.at,
            }"
            :style="milestone.style"
          ></i>
        </div>

        <div class="stairs-traveler" :style="travelerStyle" aria-hidden="true">
          <div class="traveler-shadow"></div>
          <div class="traveler-figure">
            <span class="traveler-head"></span>
            <span class="traveler-body"></span>
            <span class="traveler-arm traveler-arm--one"></span>
            <span class="traveler-arm traveler-arm--two"></span>
            <span class="traveler-leg traveler-leg--one"></span>
            <span class="traveler-leg traveler-leg--two"></span>
          </div>
        </div>

        <div class="stairs-status">
          <span>LOCAL AUTHORITY / {{ activeMilestone.number }}</span>
          <strong>{{ activeMilestone.title }}</strong>
          <p>{{ activeMilestone.copy }}</p>
        </div>

        <div class="stairs-progress" aria-hidden="true">
          <span>START</span>
          <div><i :style="{ transform: `scaleX(${progress})` }"></i></div>
          <span>VERIFIED</span>
        </div>

        <div class="stairs-end" :class="{ 'is-visible': progress > 0.9 }">
          <span>CONSEQUENCE / VERIFIED</span>
          <strong>Authority stayed local.</strong>
          <p>Nothing else on the page. Just the path.</p>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import logoMark from './public/logo.png'
import formulaStairs from './formula-stairs.png'

const journey = ref(null)
const progress = ref(0)

const milestones = [
  {
    index: 0,
    at: 0,
    number: '01',
    label: 'INTENT',
    title: 'An idea arrives.',
    copy: 'Understanding begins. Authority does not.',
    style: { left: '72%', top: '20%' },
  },
  {
    index: 1,
    at: 0.24,
    number: '02',
    label: 'PREVIEW',
    title: 'Consequence becomes visible.',
    copy: 'The real target and change are resolved before action.',
    style: { left: '63%', top: '34%' },
  },
  {
    index: 2,
    at: 0.48,
    number: '03',
    label: 'COMMIT',
    title: 'The boundary is crossed once.',
    copy: 'Explicit local authority turns intent into action.',
    style: { left: '52%', top: '49%' },
  },
  {
    index: 3,
    at: 0.71,
    number: '04',
    label: 'OBSERVE',
    title: 'Dispatch is not success.',
    copy: 'CIEAV waits for evidence instead of assuming an outcome.',
    style: { left: '39%', top: '65%' },
  },
  {
    index: 4,
    at: 0.91,
    number: '05',
    label: 'VERIFIED',
    title: 'Proof resolves the outcome.',
    copy: 'Recovery appears only when a real inverse is known.',
    style: { left: '25%', top: '81%' },
  },
]

const path = [
  { p: 0, x: 74, y: 16, r: -7 },
  { p: 0.12, x: 70, y: 24, r: -5 },
  { p: 0.24, x: 64, y: 33, r: -3 },
  { p: 0.36, x: 59, y: 40, r: 2 },
  { p: 0.48, x: 52, y: 49, r: -2 },
  { p: 0.6, x: 46, y: 57, r: 3 },
  { p: 0.72, x: 39, y: 65, r: -2 },
  { p: 0.82, x: 32, y: 73, r: 2 },
  { p: 0.92, x: 25, y: 81, r: -3 },
  { p: 1, x: 20, y: 87, r: 0 },
]

const activeIndex = computed(() => {
  let current = 0
  milestones.forEach((milestone, index) => {
    if (progress.value >= milestone.at) current = index
  })
  return current
})

const activeMilestone = computed(() => milestones[activeIndex.value])

const introStyle = computed(() => ({
  opacity: Math.max(0, 1 - progress.value * 4.2),
  transform: `translateY(${-progress.value * 44}px)`,
}))

const stageStyle = computed(() => ({
  '--stairs-image': `url(${formulaStairs})`,
  '--journey-progress': progress.value,
  '--image-x': `${50 - progress.value * 4}%`,
  '--image-y': `${50 + progress.value * 4}%`,
}))

const travelerStyle = computed(() => {
  const point = samplePath(progress.value)
  return {
    left: `${point.x}%`,
    top: `${point.y}%`,
    transform: `translate(-50%, -88%) rotate(${point.r}deg)`,
    '--walk-speed': `${Math.max(0.34, 0.64 - progress.value * 0.12)}s`,
  }
})

function samplePath(value) {
  const p = Math.max(0, Math.min(1, value))
  for (let index = 0; index < path.length - 1; index += 1) {
    const start = path[index]
    const end = path[index + 1]
    if (p >= start.p && p <= end.p) {
      const amount = (p - start.p) / Math.max(0.0001, end.p - start.p)
      return {
        x: start.x + (end.x - start.x) * amount,
        y: start.y + (end.y - start.y) * amount,
        r: start.r + (end.r - start.r) * amount,
      }
    }
  }
  return path[path.length - 1]
}

function updateProgress() {
  const section = journey.value
  if (!section) return
  const travel = Math.max(1, section.offsetHeight - window.innerHeight)
  const distance = window.scrollY - section.offsetTop
  progress.value = Math.max(0, Math.min(1, distance / travel))
}

onMounted(() => {
  updateProgress()
  window.addEventListener('scroll', updateProgress, { passive: true })
  window.addEventListener('resize', updateProgress)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateProgress)
  window.removeEventListener('resize', updateProgress)
})
</script>
