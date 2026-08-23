<template>
  <main class="site" @pointermove="trackPointer">
    <div class="cursor-cross" aria-hidden="true"></div>

    <header class="topbar">
      <a class="wordmark" href="#top" aria-label="Cieav home">
        <img :src="logoMark" alt="" class="wordmark-logo" />
        <span>Cieav</span>
      </a>

      <nav class="nav" aria-label="Primary navigation">
        <a href="#product">Gateway</a>
        <a href="#workflow">Commit Flow</a>
        <a href="#developers">Install</a>
      </nav>

      <a class="primary-button topbar-cta magnetic" href="#developers">
        Get CIEAV
      </a>
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
          <a class="primary-button primary-button--large magnetic" href="#developers">
            Get CIEAV
          </a>
          <a class="outline-button magnetic" href="#workflow">
            See the Flow
          </a>
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

    <section id="product" class="red-story motion-section">
      <div class="red-story__glow" aria-hidden="true"></div>

      <div class="red-statement reveal motion-layer" data-depth="0.16">
        <div class="section-number" aria-hidden="true">02</div>
        <p class="kicker kicker--light"><span></span> Cloud interprets. Local decides.</p>
        <h2>
          <span>Execution authority</span>
          <span>stays local.</span>
        </h2>

        <div class="red-story__lower">
          <p>
            The CIEAV Gateway mediates protected surfaces, applies a deterministic safety floor, reduces data
            locally, and keeps replay and commit capability on-device. The cloud receives only the semantic
            evidence required to interpret intent.
          </p>
          <a class="light-button magnetic" href="#workflow">Follow the commit</a>
        </div>

        <div class="red-facts" aria-label="Gateway capabilities">
          <span><b>01</b> LOCAL GATEWAY</span>
          <span><b>02</b> PRIVACY REDUCTION</span>
          <span><b>03</b> SAFETY FLOOR</span>
          <span><b>04</b> ACTION RECEIPTS</span>
        </div>
      </div>

      <div class="kinetic-marquee" aria-hidden="true">
        <div>
          <span>LOCAL</span><i>•</i><span>DECIDE</span><i>•</i><span>COMMIT</span><i>•</i><span>VERIFY</span><i>•</i>
          <span>LOCAL</span><i>•</i><span>DECIDE</span><i>•</i><span>COMMIT</span><i>•</i><span>VERIFY</span><i>•</i>
        </div>
      </div>
    </section>

    <section id="workflow" class="workflow-section motion-section">
      <div class="workflow-intro reveal motion-layer" data-depth="0.1">
        <p class="kicker"><span></span> Commit is not success</p>
        <h2>Action is immediate.<br />Truth takes evidence.</h2>
        <p>
          CIEAV treats execution as a sequence of observable states. Dispatch does not become success until
          credible local evidence supports the outcome. Anything ambiguous stays UNKNOWN.
        </p>
      </div>

      <div class="workflow-story">
        <aside class="workflow-sticky" aria-hidden="true">
          <span class="workflow-sticky__number">03</span>
          <p>PREVIEW → COMMIT → OBSERVE</p>
          <div class="workflow-rail"><i></i></div>
          <small>VERIFIED CONSEQUENCE</small>
        </aside>

        <div class="workflow-steps">
          <article
            v-for="(step, index) in steps"
            :key="step.title"
            class="story-step reveal"
            :style="{ '--step-delay': `${index * 90}ms` }"
          >
            <div class="story-step__index">0{{ index + 1 }}</div>
            <div class="story-step__body">
              <p class="story-step__state">{{ step.state }}</p>
              <h3>{{ step.title }}</h3>
              <p>{{ step.copy }}</p>
            </div>
            <div class="story-step__mark" aria-hidden="true">
              <span>{{ step.icon }}</span>
              <i></i>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section id="developers" class="developer-section motion-section">
      <div class="developer-marquee" aria-hidden="true">
        <div>
          <span>LOCAL RUNTIME</span><i>•</i><span>NO MODEL WEIGHTS</span><i>•</i><span>VERIFIED INSTALL</span><i>•</i>
          <span>LOCAL RUNTIME</span><i>•</i><span>NO MODEL WEIGHTS</span><i>•</i><span>VERIFIED INSTALL</span><i>•</i>
        </div>
      </div>

      <div class="developer-layout">
        <div class="developer-copy reveal motion-layer" data-depth="0.12">
          <p class="kicker kicker--light"><span></span> Consumer installation</p>
          <h2>Small runtime.<br />Serious authority.</h2>
          <p>
            Production releases package the CIEAV executable with its Node runtime. No Python, npm, or model
            downloads. Installation verifies the release, enrolls the device, runs a cloud safety probe, then
            starts the always-on local Gateway.
          </p>
        </div>

        <div class="install-panel reveal motion-layer" data-depth="0.2">
          <div class="install-panel__head">
            <span>INSTALL CIEAV</span>
            <span>macOS · Linux</span>
          </div>

          <button class="command install-command" type="button" @click="copyCommand">
            <code>{{ installCommand }}</code>
            <span>{{ copied ? 'COPIED' : 'COPY' }}</span>
          </button>

          <div class="install-sequence" aria-hidden="true">
            <div><span>01</span><p>Verify release manifest + SHA-256</p><b>PASS</b></div>
            <div><span>02</span><p>Enroll device + run safety probe</p><b>PASS</b></div>
            <div><span>03</span><p>Start always-on local Gateway</p><b>ACTIVE</b></div>
          </div>

          <a
            class="install-link magnetic"
            href="https://github.com/Aravindh-dev12/Cieav-the-Commit-Layer-for-the-Internet"
            target="_blank"
            rel="noreferrer"
          >
            View CIEAV on GitHub <span>↗</span>
          </a>
        </div>
      </div>
    </section>

    <footer class="footer">
      <a class="wordmark footer-mark" href="#top" aria-label="Cieav home">
        <img :src="logoMark" alt="" class="wordmark-logo wordmark-logo--footer" />
        <span>CIEAV</span>
      </a>
      <p>The commit layer for the internet.</p>
      <div class="footer-nav">
        <a href="#product">Gateway</a>
        <a href="#workflow">Commit Flow</a>
        <a href="#developers">Install</a>
      </div>
      <span>© 2026 Cieav</span>
    </footer>
  </main>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import logoMark from './public/logo.png'
import formulaStairs from './formula-stairs.png'

const copied = ref(false)
const installCommand = 'curl -fsSL https://<CIEAV-DOWNLOAD-DOMAIN>/install.sh | sh'

const steps = [
  {
    state: 'AUTHORITY',
    icon: '✦',
    title: 'Mediate',
    copy: 'Intent reaches the local Gateway first. Deterministic policy protects consequential surfaces and reduces data before interpretation leaves the device.',
  },
  {
    state: 'CONTROL',
    icon: '⌘',
    title: 'Commit',
    copy: 'The user crosses an explicit commit boundary. Trusted replay or submit follows, while a signed Action Receipt records exactly what was authorized.',
  },
  {
    state: 'OUTCOME',
    icon: '↗',
    title: 'Verify',
    copy: 'Local observation resolves the result as success, failure, or unknown. Undo appears only after verified success and discovery of a concrete inverse.',
  },
]

function trackPointer(event) {
  const x = event.clientX / window.innerWidth - 0.5
  const y = event.clientY / window.innerHeight - 0.5
  document.documentElement.style.setProperty('--mx', `${event.clientX}px`)
  document.documentElement.style.setProperty('--my', `${event.clientY}px`)
  document.documentElement.style.setProperty('--px', x.toFixed(3))
  document.documentElement.style.setProperty('--py', y.toFixed(3))
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

function bindSectionMotion() {
  const sections = Array.from(document.querySelectorAll('.motion-section'))
  let rafId = 0

  const update = () => {
    rafId = 0
    const viewport = window.innerHeight
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect()
      const center = rect.top + rect.height / 2
      const progress = (center - viewport / 2) / Math.max(viewport, rect.height)
      const clamped = Math.max(-1, Math.min(1, progress))
      section.style.setProperty('--section-progress', clamped.toFixed(3))
      section.querySelectorAll('.motion-layer').forEach((layer) => {
        const depth = Number(layer.dataset.depth || 0.1)
        layer.style.setProperty('--motion-y', `${clamped * depth * -50}px`)
      })
    })
  }

  const onScroll = () => {
    if (!rafId) rafId = requestAnimationFrame(update)
  }

  update()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)

  return () => {
    if (rafId) cancelAnimationFrame(rafId)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
  }
}

let observer
let unbindMagnetic
let unbindSectionMotion

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible')
    })
  }, { threshold: 0.12 })

  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element))
  unbindMagnetic = bindMagnetic()
  unbindSectionMotion = bindSectionMotion()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  unbindMagnetic?.()
  unbindSectionMotion?.()
})
</script>
