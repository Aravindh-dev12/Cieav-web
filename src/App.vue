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

    <section id="product" class="authority-scene motion-section">
      <div class="authority-glow" aria-hidden="true"></div>
      <div class="authority-orbit" aria-hidden="true"><i></i><i></i><i></i></div>

      <div class="authority-inner reveal motion-layer" data-depth="0.08">
        <div class="authority-meta">
          <span>02 / AUTHORITY</span>
          <span>LOCAL CONTROL PLANE</span>
        </div>

        <div class="authority-headline">
          <span class="authority-headline__ghost">CLOUD INTERPRETS.</span>
          <span>LOCAL DECIDES.</span>
        </div>

        <div class="authority-lower">
          <p>
            CIEAV keeps consequential execution where the user can control it. The Gateway applies local policy,
            reduces data before cloud interpretation, commits only after an explicit boundary, and records what
            actually happened on-device.
          </p>
          <a class="authority-link magnetic" href="#workflow">
            Enter the commit corridor <span>↘</span>
          </a>
        </div>
      </div>

      <div class="authority-ticker" aria-hidden="true">
        <div>
          <span>INTENT</span><i>—</i><span>POLICY</span><i>—</i><span>PREVIEW</span><i>—</i><span>COMMIT</span><i>—</i><span>EVIDENCE</span><i>—</i><span>VERIFY</span><i>—</i>
          <span>INTENT</span><i>—</i><span>POLICY</span><i>—</i><span>PREVIEW</span><i>—</i><span>COMMIT</span><i>—</i><span>EVIDENCE</span><i>—</i><span>VERIFY</span><i>—</i>
        </div>
      </div>
    </section>

    <section id="workflow" class="commit-corridor motion-section">
      <div class="commit-pin">
        <div class="corridor-chrome" aria-hidden="true">
          <span>03 / COMMIT CORRIDOR</span>
          <div class="corridor-progress"><i></i></div>
          <span>SCROLL TO EXECUTE</span>
        </div>

        <div class="commit-track">
          <article
            v-for="(step, index) in corridorSteps"
            :key="step.title"
            class="corridor-panel"
            :class="`corridor-panel--${index + 1}`"
          >
            <div class="panel-grid" aria-hidden="true"></div>

            <div class="panel-number">0{{ index + 1 }}</div>

            <div class="panel-copy">
              <p class="panel-state">{{ step.state }}</p>
              <h2>{{ step.title }}</h2>
              <p class="panel-description">{{ step.copy }}</p>
            </div>

            <div class="panel-signal" aria-hidden="true">
              <div class="panel-signal__ring"><span>{{ step.symbol }}</span></div>
              <p>{{ step.signal }}</p>
            </div>

            <div class="panel-foot" aria-hidden="true">
              <span>{{ step.left }}</span>
              <span>{{ step.right }}</span>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section id="developers" class="install-stage motion-section">
      <div class="install-backdrop" aria-hidden="true">LOCAL</div>
      <div class="install-glow" aria-hidden="true"></div>

      <div class="install-layout">
        <div class="install-copy reveal motion-layer" data-depth="0.08">
          <p class="kicker kicker--light"><span></span> Consumer installation</p>
          <h2>Run authority<br />where it matters.</h2>
          <p>
            CIEAV ships as a small local runtime. No Python, npm, or model-weight downloads. Installation verifies
            the release, enrolls the device, runs a safety probe, and starts the always-on Gateway service.
          </p>
        </div>

        <div class="install-terminal reveal motion-layer" data-depth="0.13">
          <div class="install-terminal__head">
            <span>CIEAV / LOCAL</span>
            <span>READY</span>
          </div>

          <button class="command install-command" type="button" @click="copyCommand">
            <code>{{ installCommand }}</code>
            <span>{{ copied ? 'COPIED' : 'COPY' }}</span>
          </button>

          <div class="install-steps" aria-hidden="true">
            <div><span>01</span><p>VERIFY RELEASE</p><b>PASS</b></div>
            <div><span>02</span><p>ENROLL DEVICE</p><b>PASS</b></div>
            <div><span>03</span><p>START GATEWAY</p><b>ACTIVE</b></div>
          </div>

          <a
            class="install-cta magnetic"
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

const corridorSteps = [
  {
    state: 'INPUT / INTENT',
    title: 'INTENT',
    symbol: 'I',
    signal: 'REQUEST RECEIVED',
    left: 'CLOUD MAY INTERPRET',
    right: 'LOCAL AUTHORITY BEGINS',
    copy: 'A digital intention arrives, but it does not receive execution authority simply because a model understood it. CIEAV routes consequential intent through the local Gateway first.',
  },
  {
    state: 'BOUNDARY / PREVIEW',
    title: 'PREVIEW',
    symbol: 'P',
    signal: 'CONSEQUENCE VISIBLE',
    left: 'DETERMINISTIC POLICY',
    right: 'USER CAN CANCEL',
    copy: 'Before consequence, the Gateway applies the safety floor and makes the action legible. The user sees what is about to happen before crossing the commit boundary.',
  },
  {
    state: 'AUTHORITY / COMMIT',
    title: 'COMMIT',
    symbol: 'C',
    signal: 'BOUNDARY CROSSED',
    left: 'SIGNED ACTION RECEIPT',
    right: 'TRUSTED REPLAY',
    copy: 'Commit is deliberate. Once authorized, CIEAV performs trusted replay or submit and records the exact action locally. Dispatch is real — but it is still not proof of success.',
  },
  {
    state: 'EVIDENCE / OBSERVE',
    title: 'OBSERVE',
    symbol: 'O',
    signal: 'LOCAL EVIDENCE',
    left: 'SUCCESS / FAILURE / UNKNOWN',
    right: 'NO ASSUMED OUTCOME',
    copy: 'After dispatch, CIEAV observes the local environment for credible evidence. Ambiguous results remain UNKNOWN rather than being promoted into a convenient success state.',
  },
  {
    state: 'OUTCOME / VERIFIED',
    title: 'VERIFIED',
    symbol: 'V',
    signal: 'CONSEQUENCE PROVEN',
    left: 'SUCCESS REQUIRES EVIDENCE',
    right: 'UNDO REQUIRES AN INVERSE',
    copy: 'Only observed evidence resolves consequence. Undo appears only after verified success and discovery of a concrete inverse. The system exposes what it knows — and what it does not.',
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

function bindMiddleMotion() {
  const sections = Array.from(document.querySelectorAll('.motion-section'))
  const corridor = document.querySelector('.commit-corridor')
  const track = document.querySelector('.commit-track')
  const panels = Array.from(document.querySelectorAll('.corridor-panel'))
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
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
        const depth = Number(layer.dataset.depth || 0.08)
        layer.style.setProperty('--motion-y', `${clamped * depth * -48}px`)
      })
    })

    if (!corridor || !track) return

    const horizontal = window.innerWidth > 820 && !reduceMotion.matches
    if (!horizontal) {
      track.style.transform = ''
      corridor.style.setProperty('--corridor-progress', '0')
      panels.forEach((panel) => panel.style.setProperty('--panel-focus', '1'))
      return
    }

    const rect = corridor.getBoundingClientRect()
    const scrollable = Math.max(1, corridor.offsetHeight - viewport)
    const progress = Math.max(0, Math.min(1, -rect.top / scrollable))
    const distance = Math.max(0, track.scrollWidth - window.innerWidth)
    const position = progress * distance

    track.style.transform = `translate3d(${-position}px, 0, 0)`
    corridor.style.setProperty('--corridor-progress', progress.toFixed(4))

    const panelProgress = progress * Math.max(1, panels.length - 1)
    panels.forEach((panel, index) => {
      const focus = Math.max(0, 1 - Math.abs(index - panelProgress) * 0.72)
      panel.style.setProperty('--panel-focus', focus.toFixed(3))
    })
  }

  const requestUpdate = () => {
    if (!rafId) rafId = requestAnimationFrame(update)
  }

  update()
  window.addEventListener('scroll', requestUpdate, { passive: true })
  window.addEventListener('resize', requestUpdate)
  reduceMotion.addEventListener?.('change', requestUpdate)

  return () => {
    if (rafId) cancelAnimationFrame(rafId)
    window.removeEventListener('scroll', requestUpdate)
    window.removeEventListener('resize', requestUpdate)
    reduceMotion.removeEventListener?.('change', requestUpdate)
  }
}

let observer
let unbindMagnetic
let unbindMiddleMotion

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible')
    })
  }, { threshold: 0.12 })

  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element))
  unbindMagnetic = bindMagnetic()
  unbindMiddleMotion = bindMiddleMotion()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  unbindMagnetic?.()
  unbindMiddleMotion?.()
})
</script>
