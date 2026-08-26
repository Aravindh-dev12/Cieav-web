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
      <div class="authority-shell">
        <div class="authority-copy reveal motion-layer" data-depth="0.06">
          <div class="section-code">
            <span>02 / LOCAL AUTHORITY</span>
            <i></i>
            <span>CONTROL PLANE</span>
          </div>

          <p class="authority-kicker">Execution should have a boundary.</p>
          <h2>
            Cloud interprets.<br />
            <span>Local decides.</span>
          </h2>
          <p class="authority-lede">
            CIEAV keeps consequential execution on the device. The Gateway applies local policy, reveals the
            consequence before commit, records what was actually sent, and refuses to call an outcome successful
            until evidence exists.
          </p>

          <div class="authority-principles">
            <div>
              <span>01</span>
              <strong>Policy first</strong>
              <p>Local rules decide whether an action may cross the boundary.</p>
            </div>
            <div>
              <span>02</span>
              <strong>Preview before commit</strong>
              <p>The exact consequence is visible while there is still time to cancel.</p>
            </div>
            <div>
              <span>03</span>
              <strong>Evidence after action</strong>
              <p>Observed state, not model confidence, determines the result.</p>
            </div>
          </div>
        </div>

        <div class="authority-console reveal motion-layer" data-depth="0.1">
          <div class="authority-console__head">
            <div class="console-dots" aria-hidden="true"><i></i><i></i><i></i></div>
            <span>CIEAV / GATEWAY</span>
            <span class="console-live"><i></i> LOCAL</span>
          </div>

          <div class="intent-card">
            <span>INCOMING INTENT</span>
            <p>Send the approved proposal to the client.</p>
            <div><small>CLOUD / INTERPRETED</small><b>→</b><small>LOCAL / AUTHORITY</small></div>
          </div>

          <div class="authority-stack">
            <div class="authority-row is-done">
              <span class="authority-row__index">01</span>
              <div><strong>Policy checked</strong><small>Recipient + document approved</small></div>
              <b>PASS</b>
            </div>
            <div class="authority-row is-done">
              <span class="authority-row__index">02</span>
              <div><strong>Preview generated</strong><small>Consequence visible before submit</small></div>
              <b>READY</b>
            </div>
            <div class="authority-row is-active">
              <span class="authority-row__index">03</span>
              <div><strong>Commit boundary</strong><small>User authorization required</small></div>
              <b>WAIT</b>
            </div>
            <div class="authority-row">
              <span class="authority-row__index">04</span>
              <div><strong>Outcome evidence</strong><small>Success / failure / unknown</small></div>
              <b>—</b>
            </div>
          </div>

          <div class="authority-console__foot">
            <span>AUTHORITY STAYS LOCAL</span>
            <span>NOTHING IS ASSUMED</span>
          </div>
        </div>
      </div>
    </section>

    <section id="workflow" class="commit-corridor motion-section">
      <div class="flow-shell">
        <div class="flow-heading reveal motion-layer" data-depth="0.05">
          <div class="section-code section-code--light">
            <span>03 / COMMIT FLOW</span>
            <i></i>
            <span>INTENT → EVIDENCE</span>
          </div>
          <div class="flow-heading__grid">
            <h2>A deliberate path<br />from request to proof.</h2>
            <p>
              Every consequential action moves through the same explicit sequence. Each stage makes the next one
              harder to trigger accidentally and easier to inspect afterward.
            </p>
          </div>
        </div>

        <div class="flow-list">
          <article
            v-for="(step, index) in corridorSteps"
            :key="step.title"
            class="flow-card reveal"
            :class="{ 'flow-card--commit': index === 2 }"
          >
            <div class="flow-card__index">0{{ index + 1 }}</div>
            <div class="flow-card__symbol" aria-hidden="true">{{ step.symbol }}</div>
            <div class="flow-card__copy">
              <span>{{ step.state }}</span>
              <h3>{{ step.title }}</h3>
              <p>{{ step.copy }}</p>
            </div>
            <div class="flow-card__status">
              <span>{{ step.signal }}</span>
              <i></i>
              <small>{{ step.right }}</small>
            </div>
          </article>
        </div>

        <div class="flow-rule reveal">
          <span>01</span><p>Interpretation is not authority.</p>
          <span>02</span><p>Dispatch is not success.</p>
          <span>03</span><p>Undo is earned by evidence.</p>
        </div>
      </div>
    </section>

    <section id="developers" class="install-stage motion-section">
      <div class="install-grid" aria-hidden="true"></div>
      <div class="install-glow" aria-hidden="true"></div>

      <div class="install-layout">
        <div class="install-copy reveal motion-layer" data-depth="0.06">
          <div class="section-code section-code--light">
            <span>04 / INSTALL</span>
            <i></i>
            <span>LOCAL RUNTIME</span>
          </div>
          <p class="install-kicker">Small runtime. Clear boundary.</p>
          <h2>Put authority<br />on your device.</h2>
          <p>
            CIEAV ships as a lightweight local runtime. Installation verifies the release, enrolls the device,
            runs a safety probe, and starts the always-on Gateway service—without model-weight downloads.
          </p>

          <div class="install-badges" aria-label="Installation features">
            <span>Signed release</span>
            <span>Local policy</span>
            <span>Always-on gateway</span>
          </div>
        </div>

        <div class="install-terminal reveal motion-layer" data-depth="0.1">
          <div class="install-terminal__head">
            <div>
              <span class="terminal-dot"></span>
              <span>CIEAV / LOCAL</span>
            </div>
            <span class="terminal-ready"><i></i> READY</span>
          </div>

          <div class="install-terminal__body">
            <span class="terminal-label">QUICK START</span>
            <button class="command install-command" type="button" @click="copyCommand">
              <code>{{ installCommand }}</code>
              <span>{{ copied ? 'COPIED ✓' : 'COPY' }}</span>
            </button>

            <div class="install-steps">
              <div><span>01</span><p>Verify release signature</p><b>PASS</b></div>
              <div><span>02</span><p>Enroll this device</p><b>PASS</b></div>
              <div><span>03</span><p>Start local gateway</p><b>ACTIVE</b></div>
            </div>
          </div>

          <a
            class="install-cta magnetic"
            href="https://github.com/Aravindh-dev12/Cieav-the-Commit-Layer-for-the-Internet"
            target="_blank"
            rel="noreferrer"
          >
            <span>Explore the project on GitHub</span>
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
