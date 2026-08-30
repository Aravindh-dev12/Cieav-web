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

    <section id="product" class="ui-section ui-authority motion-section">
      <div class="ui-shell">
        <div class="ui-section-heading reveal">
          <div class="ui-eyebrow">
            <span class="ui-badge">02 / LOCAL AUTHORITY</span>
            <span class="ui-muted-label">THE CONSEQUENCE BOUNDARY</span>
          </div>

          <div class="ui-heading-grid">
            <h2>Make the point of no return visible.</h2>
            <p>
              Agent intelligence can propose a change. CIEAV keeps execution authority local, exposes the exact consequence before commit,
              and refuses to call an ambiguous dispatch a success.
            </p>
          </div>
        </div>

        <div class="authority-layout">
          <article class="agent-surface reveal motion-layer" data-depth="0.055">
            <div class="surface-toolbar">
              <div>
                <span class="surface-kicker">LIVE AUTHORITY TRACE</span>
                <strong>Gateway / local</strong>
              </div>
              <span class="status-pill status-pill--active"><i></i> ENFORCING</span>
            </div>

            <div class="trace-list">
              <div v-for="(event, index) in authorityTrace" :key="event.title" class="trace-row">
                <span class="trace-index">0{{ index + 1 }}</span>
                <div>
                  <span>{{ event.label }}</span>
                  <strong>{{ event.title }}</strong>
                  <p>{{ event.copy }}</p>
                </div>
                <span class="trace-state" :class="`trace-state--${event.tone}`">{{ event.state }}</span>
              </div>
            </div>

            <div class="surface-footer">
              <span>POLICY</span>
              <strong>deny by default</strong>
              <span class="surface-footer__divider"></span>
              <span>SUCCESS</span>
              <strong>requires evidence</strong>
            </div>
          </article>

          <div class="principle-grid">
            <article v-for="principle in principles" :key="principle.title" class="ui-card principle-card reveal">
              <div class="principle-card__top">
                <span class="ui-icon-box">{{ principle.icon }}</span>
                <span class="ui-chip">{{ principle.meta }}</span>
              </div>
              <h3>{{ principle.title }}</h3>
              <p>{{ principle.copy }}</p>
              <div class="principle-card__rule">
                <span>{{ principle.ruleLabel }}</span>
                <strong>{{ principle.rule }}</strong>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section id="workflow" class="ui-section ui-workflow motion-section">
      <div class="ui-shell">
        <div class="ui-section-heading ui-section-heading--inverse reveal">
          <div class="ui-eyebrow">
            <span class="ui-badge ui-badge--inverse">03 / COMMIT FLOW</span>
            <span class="ui-muted-label">FIVE STATES / ONE CONSEQUENCE</span>
          </div>

          <div class="ui-heading-grid">
            <h2>From intent to proof, every state is explicit.</h2>
            <p>
              The flow is designed like an agent execution trace: proposal, preview, authority, observation, verified outcome.
              No hidden transition is allowed to become a real-world consequence.
            </p>
          </div>
        </div>

        <div class="flow-grid">
          <article
            v-for="(step, index) in corridorSteps"
            :key="step.title"
            class="flow-card reveal"
            :class="{ 'flow-card--commit': index === 2 }"
            tabindex="0"
          >
            <div class="flow-card__header">
              <span class="flow-number">0{{ index + 1 }}</span>
              <span class="flow-state">{{ step.state }}</span>
            </div>

            <div class="flow-card__body">
              <span class="flow-marker" aria-hidden="true">{{ index === 2 ? '◆' : '○' }}</span>
              <h3>{{ step.title }}</h3>
              <p>{{ step.copy }}</p>
            </div>

            <div class="flow-card__footer">
              <span class="ui-chip ui-chip--dark">{{ step.signal }}</span>
              <strong>{{ step.right }}</strong>
            </div>
          </article>
        </div>

        <div class="proof-strip reveal">
          <div v-for="proof in proofPoints" :key="proof.label" class="proof-item">
            <span>{{ proof.label }}</span>
            <strong>{{ proof.value }}</strong>
          </div>
        </div>
      </div>
    </section>

    <section id="developers" class="ui-section ui-install motion-section">
      <div class="ui-shell install-layout">
        <div class="install-copy reveal motion-layer" data-depth="0.05">
          <div class="ui-eyebrow">
            <span class="ui-badge">04 / INSTALL</span>
            <span class="ui-muted-label">LOCAL RUNTIME</span>
          </div>
          <h2>Put authority where consequence lives.</h2>
          <p>
            Install the local Gateway, enroll the device, and keep the execution boundary close to the user.
            The cloud can keep reasoning; the machine that will actually act keeps the final say.
          </p>

          <div class="install-guarantees">
            <div><span>01</span><p>Release integrity checked locally.</p></div>
            <div><span>02</span><p>Device enrollment is explicit.</p></div>
            <div><span>03</span><p>Gateway reports observed state.</p></div>
          </div>
        </div>

        <article class="install-card reveal motion-layer" data-depth="0.08">
          <div class="install-card__header">
            <div>
              <span class="surface-kicker">QUICK START</span>
              <strong>Install CIEAV</strong>
            </div>
            <span class="status-pill status-pill--active"><i></i> READY</span>
          </div>

          <div class="platform-switcher" aria-label="Choose operating system">
            <button
              v-for="platform in platforms"
              :key="platform.id"
              type="button"
              :class="{ 'is-active': activePlatform === platform.id }"
              @click="activePlatform = platform.id"
            >
              {{ platform.label }}
            </button>
          </div>

          <button type="button" class="command-surface" @click="copyCommand">
            <span class="command-prompt">$</span>
            <code>{{ installCommand }}</code>
            <span class="command-copy">{{ copied ? 'COPIED ✓' : 'COPY' }}</span>
          </button>

          <div class="install-steps">
            <div v-for="(step, index) in installSteps" :key="step.label">
              <span>0{{ index + 1 }}</span>
              <div>
                <strong>{{ step.label }}</strong>
                <p>{{ step.copy }}</p>
              </div>
              <b>{{ step.status }}</b>
            </div>
          </div>

          <div class="install-card__actions">
            <a
              class="ui-button ui-button--primary magnetic"
              href="https://github.com/Aravindh-dev12/Cieav-the-Commit-Layer-for-the-Internet"
              target="_blank"
              rel="noreferrer"
            >
              View on GitHub <span>↗</span>
            </a>
            <a class="ui-button ui-button--ghost magnetic" href="#workflow">Review commit flow</a>
          </div>
        </article>
      </div>
    </section>

    <footer class="ui-footer">
      <div class="ui-footer__brand">
        <a class="wordmark footer-mark" href="#top" aria-label="Cieav home">
          <img :src="logoMark" alt="" class="wordmark-logo wordmark-logo--footer" />
          <span>CIEAV</span>
        </a>
        <p>Local authority for agentic consequence.</p>
      </div>

      <div class="ui-footer__nav">
        <a href="#product">Gateway</a>
        <a href="#workflow">Commit Flow</a>
        <a href="#developers">Install</a>
      </div>

      <div class="ui-footer__meta">
        <span class="status-pill"><i></i> LOCAL-FIRST</span>
        <span>© 2026 Cieav</span>
      </div>
    </footer>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import logoMark from './public/logo.png'
import formulaStairs from './formula-stairs.png'

const copied = ref(false)
const activePlatform = ref('unix')

const platforms = [
  {
    id: 'unix',
    label: 'macOS / Linux',
    command: 'curl -fsSL https://<CIEAV-DOWNLOAD-DOMAIN>/install.sh | sh',
  },
  {
    id: 'windows',
    label: 'Windows',
    command: 'irm https://<CIEAV-DOWNLOAD-DOMAIN>/install.ps1 | iex',
  },
]

const installCommand = computed(() => platforms.find((platform) => platform.id === activePlatform.value)?.command || platforms[0].command)

const authorityTrace = [
  {
    label: 'AGENT',
    title: 'Proposal received',
    copy: 'The model describes the requested action without receiving execution authority.',
    state: 'INTERPRET',
    tone: 'neutral',
  },
  {
    label: 'GATEWAY',
    title: 'Consequence previewed',
    copy: 'Local policy resolves the exact change and keeps the action cancellable.',
    state: 'PREVIEW',
    tone: 'review',
  },
  {
    label: 'USER / POLICY',
    title: 'Authority granted',
    copy: 'Only an explicit local decision crosses the commit boundary.',
    state: 'COMMIT',
    tone: 'commit',
  },
  {
    label: 'GATEWAY',
    title: 'Outcome observed',
    copy: 'Evidence, not assumption, decides whether the consequence succeeded.',
    state: 'VERIFY',
    tone: 'success',
  },
]

const principles = [
  {
    icon: '⌁',
    meta: 'PREVIEW',
    title: 'Nothing hidden.',
    copy: 'Turn an agent proposal into a concrete local consequence before any authority is granted.',
    ruleLabel: 'Boundary rule',
    rule: 'show before commit',
  },
  {
    icon: '◎',
    meta: 'EVIDENCE',
    title: 'Nothing assumed.',
    copy: 'Dispatch is recorded as an attempt. Success remains unresolved until credible evidence appears.',
    ruleLabel: 'Outcome rule',
    rule: 'proof over optimism',
  },
  {
    icon: '↶',
    meta: 'INVERSE',
    title: 'Undo is earned.',
    copy: 'A reversal appears only after success is proven and a concrete inverse can be executed safely.',
    ruleLabel: 'Recovery rule',
    rule: 'verified inverse only',
  },
]

const corridorSteps = [
  {
    state: 'INPUT / INTENT',
    title: 'INTENT',
    signal: 'REQUEST RECEIVED',
    right: 'LOCAL AUTHORITY BEGINS',
    copy: 'A digital intention arrives. Understanding it is useful, but understanding alone never grants execution authority.',
  },
  {
    state: 'BOUNDARY / PREVIEW',
    title: 'PREVIEW',
    signal: 'CONSEQUENCE VISIBLE',
    right: 'USER CAN CANCEL',
    copy: 'Local policy is applied and the exact consequence is shown while the action is still reversible.',
  },
  {
    state: 'AUTHORITY / COMMIT',
    title: 'COMMIT',
    signal: 'BOUNDARY CROSSED',
    right: 'TRUSTED REPLAY',
    copy: 'Authorization becomes explicit. The approved action is dispatched and recorded locally as a real commit.',
  },
  {
    state: 'EVIDENCE / OBSERVE',
    title: 'OBSERVE',
    signal: 'LOCAL EVIDENCE',
    right: 'NO ASSUMED OUTCOME',
    copy: 'CIEAV watches for credible local evidence instead of turning an ambiguous result into convenient success.',
  },
  {
    state: 'OUTCOME / VERIFIED',
    title: 'VERIFIED',
    signal: 'CONSEQUENCE PROVEN',
    right: 'UNDO REQUIRES AN INVERSE',
    copy: 'Only evidence resolves the outcome. A reversal is offered only after success and a concrete inverse are known.',
  },
]

const proofPoints = [
  { label: 'INTERPRETATION', value: '≠ AUTHORITY' },
  { label: 'DISPATCH', value: '≠ SUCCESS' },
  { label: 'UNDO', value: '= VERIFIED INVERSE' },
]

const installSteps = [
  { label: 'Verify release', copy: 'Check the signed runtime before execution.', status: 'PASS' },
  { label: 'Enroll device', copy: 'Bind this machine to its local authority context.', status: 'PASS' },
  { label: 'Start Gateway', copy: 'Expose the local commit boundary to trusted clients.', status: 'ACTIVE' },
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
    await navigator.clipboard.writeText(installCommand.value)
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
