<template>
  <main class="atlas-site" @pointermove="trackPointer">
    <header class="atlas-header" :class="{ 'atlas-header--act2': inAtlas }">
      <a class="atlas-brand" href="#top" aria-label="CIEAV home">
        <img :src="logoMark" alt="" />
        <span>CIEAV</span>
      </a>

      <div class="atlas-header__act" aria-live="polite">
        <span>{{ inAtlas ? 'ACT II' : 'ACT I' }}</span>
        <strong>{{ inAtlas ? 'LOCAL AUTHORITY ATLAS' : 'WALK THE CONSEQUENCE PATH' }}</strong>
      </div>

      <button type="button" class="atlas-header__jump" @click="inAtlas ? scrollToTop() : scrollToAtlas()">
        {{ inAtlas ? 'WALK AGAIN' : 'VIEW ATLAS' }}
      </button>
    </header>

    <section
      id="top"
      class="walk-act"
      :style="walkStyle"
      aria-label="Interactive consequence path"
    >
      <div class="walk-act__veil" aria-hidden="true"></div>
      <div class="walk-act__grain" aria-hidden="true"></div>

      <div class="walk-intro">
        <p>THE COMMIT LAYER FOR THE INTERNET</p>
        <h1>Walk from intent<br />to consequence.</h1>
        <span>Use A / D or the arrow keys</span>
      </div>

      <div class="walk-worlds" aria-live="polite">
        <article
          v-for="(stage, index) in stages"
          :key="stage.title"
          class="walk-world"
          :class="{
            'walk-world--current': index === walkIndex,
            'walk-world--past': index < walkIndex,
          }"
          :style="stageStyle(index, stage.color)"
          :aria-hidden="index === walkIndex ? 'false' : 'true'"
        >
          <div class="walk-world__marker" aria-hidden="true">
            <i></i><i></i><i></i><i></i><i></i>
          </div>
          <span class="walk-world__number">0{{ index + 1 }}</span>
          <p>{{ stage.eyebrow }}</p>
          <h2>{{ stage.title }}</h2>
          <strong>{{ stage.headline }}</strong>
          <small>{{ stage.copy }}</small>
          <div class="walk-world__signal">
            <span>{{ stage.signal }}</span>
            <b>{{ stage.outcome }}</b>
          </div>
        </article>
      </div>

      <div class="walk-ground" aria-hidden="true">
        <div class="walk-ground__line"></div>
        <div class="walk-traveler" :style="{ '--traveler-color': stages[walkIndex].color }">
          <span></span>
        </div>
      </div>

      <div class="walk-controls">
        <button type="button" @click="moveWalk(-1)" :disabled="walkIndex === 0" aria-label="Previous state">
          <kbd>A</kbd><span>BACK</span>
        </button>
        <div class="walk-controls__status">
          <span>{{ String(walkIndex + 1).padStart(2, '0') }} / {{ String(stages.length).padStart(2, '0') }}</span>
          <strong>{{ stages[walkIndex].title }}</strong>
        </div>
        <button type="button" @click="nextWalk" aria-label="Next state">
          <span>{{ walkIndex === stages.length - 1 ? 'ATLAS' : 'FORWARD' }}</span><kbd>D</kbd>
        </button>
      </div>

      <div class="walk-map" aria-label="Journey map">
        <span>YOUR WALK</span>
        <button
          v-for="(stage, index) in stages"
          :key="stage.title"
          type="button"
          :class="{ 'is-current': walkIndex === index, 'is-visited': visited.has(index) }"
          :style="{ '--dot-color': stage.color }"
          :aria-label="`Go to ${stage.title}`"
          @click="goToStage(index)"
        ></button>
        <strong>{{ visited.size }} / {{ stages.length }}</strong>
      </div>

      <button class="walk-scroll" type="button" @click="scrollToAtlas">
        <span>SCROLL DOWN</span>
        <i aria-hidden="true">↓</i>
      </button>
    </section>

    <section id="atlas" class="living-atlas">
      <div class="living-atlas__intro atlas-reveal">
        <div class="atlas-label-row">
          <span>ACT II / LOCAL AUTHORITY ATLAS</span>
          <span>THE PATH BECOMES LEGIBLE</span>
        </div>

        <div class="living-atlas__headline">
          <p>LIVING ATLAS / CIEAV</p>
          <h2>The consequence path,<br />made legible.</h2>
          <div>
            <p>
              Models can interpret intent. CIEAV keeps authority local, exposes consequence before commit,
              observes what actually happened, and offers recovery only when a concrete inverse exists.
            </p>
            <a href="#install">Install the local Gateway ↘</a>
          </div>
        </div>

        <div class="memory-strip">
          <span>ACT I / YOUR WALK</span>
          <div>
            <i
              v-for="(stage, index) in stages"
              :key="stage.title"
              :class="{ 'is-visited': visited.has(index) }"
              :style="{ '--memory-color': stage.color }"
            ></i>
          </div>
          <strong>{{ visited.size }} / {{ stages.length }} MEMORIES</strong>
        </div>
      </div>

      <div class="atlas-body">
        <aside class="atlas-index" aria-label="Atlas index">
          <span>INDEX</span>
          <a v-for="(stage, index) in stages" :key="stage.title" :href="`#chapter-${index + 1}`">
            <b>0{{ index + 1 }}</b>{{ stage.title.toLowerCase() }}
          </a>
          <a href="#install"><b>06</b>install</a>
        </aside>

        <div class="atlas-chapters">
          <article
            v-for="(stage, index) in stages"
            :id="`chapter-${index + 1}`"
            :key="stage.title"
            class="atlas-chapter atlas-reveal"
          >
            <div class="atlas-chapter__meta">
              <span>0{{ index + 1 }}</span>
              <span>{{ stage.eyebrow }}</span>
              <i :style="{ '--chapter-color': stage.color }"></i>
            </div>

            <div class="atlas-chapter__content">
              <h3>{{ stage.headline }}</h3>
              <p>{{ stage.longCopy }}</p>
              <div class="atlas-chapter__rule">
                <span>{{ stage.signal }}</span>
                <strong>{{ stage.outcome }}</strong>
              </div>
            </div>
          </article>

          <section class="commit-boundary atlas-reveal">
            <div>
              <span>THE BOUNDARY</span>
              <h3>Interpretation<br />is not authority.</h3>
            </div>
            <div>
              <p>
                CIEAV stays quiet while software thinks, searches, drafts, and proposes. It becomes visible only when
                digital intent is about to become an external consequence.
              </p>
              <p>
                At that boundary, the user sees the real target and change, grants authority once, and gets a verified result instead of an optimistic status.
              </p>
            </div>
          </section>

          <section id="install" class="atlas-install atlas-reveal">
            <div class="atlas-install__copy">
              <span>06 / LOCAL RUNTIME</span>
              <h3>Install authority<br />where consequence lives.</h3>
              <p>
                The Gateway runs on the local machine and becomes a shared commit boundary for trusted apps and agents.
                Install it once, then let it stay out of the way until an action actually matters.
              </p>
            </div>

            <div class="atlas-install__terminal">
              <div class="atlas-terminal__top">
                <span>QUICK START</span>
                <b>LOCAL / READY</b>
              </div>
              <button type="button" @click="copyCommand">
                <code>{{ installCommand }}</code>
                <span>{{ copied ? 'COPIED ✓' : 'COPY' }}</span>
              </button>
              <div class="atlas-terminal__steps">
                <p><span>01</span> verify release <b>PASS</b></p>
                <p><span>02</span> enroll device <b>PASS</b></p>
                <p><span>03</span> start gateway <b>ACTIVE</b></p>
              </div>
              <a
                href="https://github.com/Aravindh-dev12/Cieav-the-Commit-Layer-for-the-Internet"
                target="_blank"
                rel="noreferrer"
              >
                VIEW SOURCE ON GITHUB <span>↗</span>
              </a>
            </div>
          </section>
        </div>
      </div>

      <footer class="atlas-footer">
        <div>
          <a class="atlas-brand atlas-brand--footer" href="#top">
            <img :src="logoMark" alt="" />
            <span>CIEAV</span>
          </a>
          <p>The commit layer for the internet.</p>
        </div>
        <div class="atlas-footer__walk">
          <span>YOUR WALK / {{ visited.size }} MEMORIES</span>
          <div>
            <i
              v-for="(stage, index) in stages"
              :key="stage.title"
              :class="{ 'is-visited': visited.has(index) }"
              :style="{ '--memory-color': stage.color }"
            ></i>
          </div>
        </div>
        <button type="button" @click="scrollToTop">WALK THE PATH AGAIN ↑</button>
        <span>© 2026 CIEAV</span>
      </footer>
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import logoMark from './public/logo.png'
import formulaStairs from './formula-stairs.png'

const copied = ref(false)
const walkIndex = ref(0)
const visited = ref(new Set([0]))
const inAtlas = ref(false)
const installCommand = 'curl -fsSL https://<CIEAV-DOWNLOAD-DOMAIN>/install.sh | sh'

const stages = [
  {
    eyebrow: 'INPUT / INTENT',
    title: 'INTENT',
    headline: 'An idea arrives.',
    copy: 'Understanding begins here. Authority does not.',
    longCopy: 'A user, application, or agent expresses an intention. CIEAV lets interpretation happen freely, but treats understanding as information rather than permission to act.',
    signal: 'REQUEST RECEIVED',
    outcome: 'NO AUTHORITY YET',
    color: '#7d8c85',
  },
  {
    eyebrow: 'BOUNDARY / PREVIEW',
    title: 'PREVIEW',
    headline: 'Consequence becomes visible.',
    copy: 'The real target, scope, and change are resolved locally.',
    longCopy: 'Before execution, the local Gateway turns a proposal into a concrete consequence. The user can see what will change while cancellation is still cheap and complete.',
    signal: 'CONSEQUENCE VISIBLE',
    outcome: 'USER CAN CANCEL',
    color: '#c59344',
  },
  {
    eyebrow: 'AUTHORITY / COMMIT',
    title: 'COMMIT',
    headline: 'The boundary is crossed once.',
    copy: 'Explicit authority turns a proposal into a real action.',
    longCopy: 'Only an approved local decision can cross the commit boundary. The exact action is dispatched and recorded as a commit instead of being hidden inside an agent or cloud workflow.',
    signal: 'AUTHORITY GRANTED',
    outcome: 'ACTION DISPATCHED',
    color: '#c30000',
  },
  {
    eyebrow: 'EVIDENCE / OBSERVE',
    title: 'OBSERVE',
    headline: 'Dispatch is not success.',
    copy: 'CIEAV waits for credible local evidence.',
    longCopy: 'The Gateway observes the result after dispatch. An ambiguous response remains unresolved rather than being promoted into a convenient success state.',
    signal: 'LOCAL EVIDENCE',
    outcome: 'NO ASSUMED OUTCOME',
    color: '#667b91',
  },
  {
    eyebrow: 'OUTCOME / VERIFIED',
    title: 'VERIFIED',
    headline: 'Proof resolves the outcome.',
    copy: 'Undo appears only when a real inverse is known.',
    longCopy: 'Evidence closes the loop. When success is proven and a concrete inverse is available, CIEAV can expose recovery. Otherwise the result stays explicit instead of pretending reversibility.',
    signal: 'CONSEQUENCE PROVEN',
    outcome: 'UNDO REQUIRES INVERSE',
    color: '#47745d',
  },
]

const walkStyle = computed(() => ({
  backgroundImage: `url(${formulaStairs})`,
  backgroundPosition: `${50 - walkIndex.value * 2.4}% bottom`,
}))

function stageStyle(index, color) {
  const offset = index - walkIndex.value
  return {
    left: `${50 + offset * 68}%`,
    '--world-color': color,
  }
}

function markVisited(index) {
  const next = new Set(visited.value)
  next.add(index)
  visited.value = next
}

function goToStage(index) {
  walkIndex.value = Math.max(0, Math.min(stages.length - 1, index))
  markVisited(walkIndex.value)
}

function moveWalk(delta) {
  goToStage(walkIndex.value + delta)
}

function nextWalk() {
  if (walkIndex.value === stages.length - 1) {
    scrollToAtlas()
    return
  }
  moveWalk(1)
}

function scrollToAtlas() {
  document.querySelector('#atlas')?.scrollIntoView({ behavior: 'smooth' })
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleKey(event) {
  if (inAtlas.value) return
  if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
    event.preventDefault()
    nextWalk()
  }
  if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
    event.preventDefault()
    moveWalk(-1)
  }
}

function trackPointer(event) {
  document.documentElement.style.setProperty('--atlas-mx', `${event.clientX}px`)
  document.documentElement.style.setProperty('--atlas-my', `${event.clientY}px`)
}

function updateScrollState() {
  inAtlas.value = window.scrollY > window.innerHeight * 0.72
}

async function copyCommand() {
  try {
    await navigator.clipboard.writeText(installCommand)
    copied.value = true
    window.setTimeout(() => { copied.value = false }, 1600)
  } catch {
    copied.value = false
  }
}

let observer

onMounted(() => {
  window.addEventListener('keydown', handleKey)
  window.addEventListener('scroll', updateScrollState, { passive: true })
  updateScrollState()

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible')
    })
  }, { threshold: 0.12 })

  document.querySelectorAll('.atlas-reveal').forEach((element) => observer.observe(element))
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKey)
  window.removeEventListener('scroll', updateScrollState)
  observer?.disconnect()
})
</script>
