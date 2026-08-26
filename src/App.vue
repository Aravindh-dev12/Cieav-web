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

    <section id="product" class="protocol-split motion-section">
      <div class="protocol-noise" aria-hidden="true"></div>
      <div class="protocol-shell">
        <div class="section-code section-code--light reveal">
          <span>02 / PROTOCOL SPLIT</span>
          <i></i>
          <span>INTELLIGENCE ≠ AUTHORITY</span>
        </div>

        <div class="protocol-stage">
          <div class="protocol-side protocol-side--cloud reveal motion-layer" data-depth="0.05">
            <span class="protocol-label">CLOUD</span>
            <h2>Interpret<br />anything.</h2>
            <p>
              Models can understand intent, reason over context, and propose what should happen next.
            </p>
            <div class="protocol-capabilities">
              <span>REASONING</span>
              <span>PLANNING</span>
              <span>INTERPRETATION</span>
            </div>
          </div>

          <div class="protocol-axis" aria-hidden="true">
            <span>LOCAL AUTHORITY BOUNDARY</span>
            <div class="axis-line"><i></i></div>
            <div class="axis-core">
              <b>C</b>
              <small>GATEWAY</small>
            </div>
            <div class="axis-packet">INTENT</div>
          </div>

          <div class="protocol-side protocol-side--local reveal motion-layer" data-depth="0.09">
            <span class="protocol-label">LOCAL</span>
            <h2>Decide what<br />becomes real.</h2>
            <p>
              CIEAV owns the consequence boundary: policy, preview, commit, observation, and verified outcome.
            </p>
            <div class="protocol-capabilities protocol-capabilities--local">
              <span>POLICY</span>
              <span>COMMIT</span>
              <span>EVIDENCE</span>
            </div>
          </div>
        </div>

        <div class="protocol-status reveal">
          <div>
            <span>REQUEST</span>
            <strong>Send approved proposal</strong>
          </div>
          <i></i>
          <div>
            <span>POLICY</span>
            <strong>PASS</strong>
          </div>
          <i></i>
          <div>
            <span>AUTHORITY</span>
            <strong>LOCAL ONLY</strong>
          </div>
          <i></i>
          <div>
            <span>OUTCOME</span>
            <strong>UNPROVEN</strong>
          </div>
        </div>
      </div>
    </section>

    <section id="workflow" class="signal-rail motion-section">
      <div class="signal-shell">
        <div class="signal-heading reveal motion-layer" data-depth="0.05">
          <div class="section-code">
            <span>03 / SIGNAL RAIL</span>
            <i></i>
            <span>REQUEST → PROOF</span>
          </div>
          <h2>One action.<br /><span>Five controlled states.</span></h2>
          <p>
            Instead of burying execution inside automation, CIEAV turns consequence into a visible sequence.
            Every transition has a reason, a state, and evidence behind it.
          </p>
        </div>

        <div class="rail-layout">
          <div class="rail-line" aria-hidden="true">
            <div class="rail-line__active"></div>
          </div>

          <article
            v-for="(step, index) in corridorSteps"
            :key="step.title"
            class="rail-stop reveal"
            :class="{ 'rail-stop--commit': index === 2 }"
          >
            <div class="rail-stop__node">
              <span>0{{ index + 1 }}</span>
              <i></i>
            </div>
            <div class="rail-stop__title">
              <span>{{ step.state }}</span>
              <h3>{{ step.title }}</h3>
            </div>
            <p class="rail-stop__copy">{{ step.copy }}</p>
            <div class="rail-stop__signal">
              <span>{{ step.signal }}</span>
              <b>{{ step.right }}</b>
            </div>
          </article>
        </div>

        <div class="rail-manifest reveal">
          <div><span>RULE 01</span><strong>Interpretation is not authority.</strong></div>
          <div><span>RULE 02</span><strong>Dispatch is not success.</strong></div>
          <div><span>RULE 03</span><strong>Undo requires an observed inverse.</strong></div>
        </div>
      </div>
    </section>

    <section id="developers" class="access-bay motion-section">
      <div class="access-grid" aria-hidden="true"></div>
      <div class="access-shell">
        <div class="access-copy reveal motion-layer" data-depth="0.06">
          <div class="section-code section-code--light">
            <span>04 / ACCESS BAY</span>
            <i></i>
            <span>LOCAL RUNTIME</span>
          </div>
          <span class="access-kicker">DEPLOY AUTHORITY</span>
          <h2>Install the<br />boundary.</h2>
          <p>
            The Gateway runs locally, verifies its release, enrolls the device, and starts the service that stands
            between intent and consequence.
          </p>
          <div class="access-meta">
            <div><span>01</span><strong>Signed release</strong></div>
            <div><span>02</span><strong>Device enrollment</strong></div>
            <div><span>03</span><strong>Always-on gateway</strong></div>
          </div>
        </div>

        <div class="access-terminal reveal motion-layer" data-depth="0.1">
          <div class="access-terminal__top">
            <div><i></i><span>CIEAV / ACCESS</span></div>
            <b>READY</b>
          </div>

          <div class="access-terminal__screen">
            <span class="terminal-label">INSTALL COMMAND</span>
            <button class="access-command" type="button" @click="copyCommand">
              <code>{{ installCommand }}</code>
              <span>{{ copied ? 'COPIED ✓' : 'COPY' }}</span>
            </button>

            <div class="access-log" aria-label="Installation sequence">
              <div><span>[01]</span><p>verify release signature</p><b>PASS</b></div>
              <div><span>[02]</span><p>enroll local device</p><b>PASS</b></div>
              <div><span>[03]</span><p>probe safety boundary</p><b>PASS</b></div>
              <div><span>[04]</span><p>start gateway service</p><b>ACTIVE</b></div>
            </div>
          </div>

          <a
            class="access-terminal__cta magnetic"
            href="https://github.com/Aravindh-dev12/Cieav-the-Commit-Layer-for-the-Internet"
            target="_blank"
            rel="noreferrer"
          >
            <span>Open source / GitHub</span>
            <b>↗</b>
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
    copy: 'A digital intention arrives, but understanding the request does not grant execution authority. CIEAV receives the proposed action at the local boundary.',
  },
  {
    state: 'BOUNDARY / PREVIEW',
    title: 'PREVIEW',
    symbol: 'P',
    signal: 'CONSEQUENCE VISIBLE',
    left: 'DETERMINISTIC POLICY',
    right: 'USER CAN CANCEL',
    copy: 'The Gateway applies local policy and renders the consequence before anything irreversible happens. The action is legible while cancellation is still possible.',
  },
  {
    state: 'AUTHORITY / COMMIT',
    title: 'COMMIT',
    symbol: 'C',
    signal: 'BOUNDARY CROSSED',
    left: 'SIGNED ACTION RECEIPT',
    right: 'TRUSTED REPLAY',
    copy: 'Authorization becomes explicit. CIEAV dispatches the exact approved action and records the commit locally, but does not confuse dispatch with success.',
  },
  {
    state: 'EVIDENCE / OBSERVE',
    title: 'OBSERVE',
    symbol: 'O',
    signal: 'LOCAL EVIDENCE',
    left: 'SUCCESS / FAILURE / UNKNOWN',
    right: 'NO ASSUMED OUTCOME',
    copy: 'After dispatch, the Gateway watches the environment for credible evidence. Ambiguity remains UNKNOWN instead of becoming a convenient success state.',
  },
  {
    state: 'OUTCOME / VERIFIED',
    title: 'VERIFIED',
    symbol: 'V',
    signal: 'CONSEQUENCE PROVEN',
    left: 'SUCCESS REQUIRES EVIDENCE',
    right: 'UNDO REQUIRES AN INVERSE',
    copy: 'Only observed evidence resolves the consequence. Undo is exposed only when success is verified and a concrete inverse is actually available.',
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
  }

  const requestUpdate = () => {
    if (!rafId) rafId = requestAnimationFrame(update)
  }

  update()
  window.addEventListener('scroll', requestUpdate, { passive: true })
  window.addEventListener('resize', requestUpdate)

  return () => {
    if (rafId) cancelAnimationFrame(rafId)
    window.removeEventListener('scroll', requestUpdate)
    window.removeEventListener('resize', requestUpdate)
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
