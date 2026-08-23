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

    <section id="product" class="red-story reveal motion-section">
      <div class="red-noise" aria-hidden="true"></div>
      <div class="ambient-orb ambient-orb--one" aria-hidden="true"></div>
      <div class="ambient-orb ambient-orb--two" aria-hidden="true"></div>

      <div class="gateway-layout">
        <div class="red-copy motion-layer" data-depth="0.34">
          <p class="kicker kicker--light"><span></span> Cloud = interpretation. Local = authority.</p>
          <h2>Execution authority<br />stays on your device.</h2>
          <p>
            The CIEAV Gateway starts with the operating system, mediates protected surfaces, applies a
            deterministic safety floor, reduces data locally, and keeps replay and commit capability on-device.
            CIEAV Cloud receives only the minimum semantic evidence needed for interpretation.
          </p>
          <a class="light-button magnetic" href="#workflow">See commit flow</a>

          <div class="red-meta stagger-group">
            <span>LOCAL GATEWAY</span>
            <span>PRIVACY REDUCTION</span>
            <span>SAFETY FLOOR</span>
            <span>ACTION RECEIPTS</span>
          </div>
        </div>

        <div class="gateway-visual motion-layer" data-depth="0.58" aria-hidden="true">
          <div class="gateway-hud gateway-hud--top">
            <span>LOCAL CONTROL PLANE</span>
            <b>ONLINE</b>
          </div>

          <div class="gateway-core">
            <div class="core-ring core-ring--outer"></div>
            <div class="core-ring core-ring--middle"></div>
            <div class="core-ring core-ring--inner"></div>
            <div class="core-orbit core-orbit--one"><i></i></div>
            <div class="core-orbit core-orbit--two"><i></i></div>
            <div class="core-center">
              <span>C</span>
              <small>AUTHORITY</small>
            </div>
          </div>

          <div class="signal-column signal-column--left">
            <span>INTENT</span>
            <i></i><i></i><i></i>
          </div>
          <div class="signal-column signal-column--right">
            <span>OUTCOME</span>
            <i></i><i></i><i></i>
          </div>

          <div class="gateway-readouts">
            <div><span>POLICY</span><b>PASS</b></div>
            <div><span>PRIVACY</span><b>LOCAL</b></div>
            <div><span>REPLAY</span><b>READY</b></div>
          </div>
        </div>
      </div>
    </section>

    <section id="workflow" class="workflow-section motion-section">
      <div class="section-heading reveal motion-layer" data-depth="0.22">
        <p class="kicker"><span></span> Commit is not success</p>
        <h2>Preview. Commit. Observe. Undo only when verified.</h2>
        <p>
          CIEAV separates action dispatch from remote outcome. A committed action is not treated as success
          until credible local evidence supports it. Ambiguous outcomes remain UNKNOWN.
        </p>
      </div>

      <div class="flow-track reveal" aria-hidden="true">
        <span class="flow-track__label">TRUSTED EXECUTION PATH</span>
        <div class="flow-track__line"><i></i></div>
        <span class="flow-track__state">OBSERVE → VERIFY</span>
      </div>

      <div class="workflow-grid reveal">
        <article
          v-for="(step, index) in steps"
          :key="step.title"
          class="workflow-card depth-card"
          :style="{ '--card-delay': `${index * 110}ms`, '--step-index': index + 1 }"
        >
          <div class="card-surface" aria-hidden="true"></div>
          <div class="card-top">
            <span>0{{ index + 1 }}</span>
            <span>{{ step.state }}</span>
          </div>
          <div class="card-icon-wrap">
            <div class="card-icon" aria-hidden="true">{{ step.icon }}</div>
            <span class="card-pulse" aria-hidden="true"></span>
          </div>
          <h3>{{ step.title }}</h3>
          <p>{{ step.copy }}</p>
          <div class="card-status" aria-hidden="true">
            <span></span>
            <span>{{ index === 0 ? 'POLICY CHECK' : index === 1 ? 'SIGNED RECEIPT' : 'LOCAL EVIDENCE' }}</span>
          </div>
        </article>
      </div>
    </section>

    <section id="developers" class="developer-section reveal motion-section">
      <div class="developer-glow developer-glow--one" aria-hidden="true"></div>
      <div class="developer-glow developer-glow--two" aria-hidden="true"></div>
      <div class="developer-grid-field" aria-hidden="true"></div>

      <div class="developer-copy motion-layer" data-depth="0.18">
        <p class="kicker kicker--light"><span></span> Consumer installation</p>
        <h2>Small local runtime.<br />No model weights.</h2>
        <p>
          Production releases package the CIEAV executable with its Node runtime. Users do not need Python,
          npm, or large model downloads. The installer verifies the release, enrolls the device, runs a cloud
          safety probe, and only then installs the always-on local Gateway service.
        </p>

        <div class="runtime-status" aria-hidden="true">
          <div><i></i><span>GATEWAY SERVICE</span><b>ACTIVE</b></div>
          <div><i></i><span>LOCAL POLICY</span><b>ENFORCED</b></div>
          <div><i></i><span>CLOUD LINK</span><b>MINIMAL</b></div>
        </div>
      </div>

      <div class="terminal-shell motion-layer" data-depth="0.31">
        <div class="terminal-frame-label terminal-frame-label--left">CIEAV / LOCAL</div>
        <div class="terminal-frame-label terminal-frame-label--right">SECURE RUNTIME</div>

        <div class="terminal-card depth-card">
          <div class="terminal-scan" aria-hidden="true"></div>
          <div class="terminal-head">
            <span>INSTALL CIEAV</span>
            <span>macOS · Linux</span>
          </div>
          <button class="command" type="button" @click="copyCommand">
            <code>{{ installCommand }}</code>
            <span>{{ copied ? 'COPIED' : 'COPY' }}</span>
          </button>
          <div class="terminal-lines" aria-hidden="true">
            <p><b>→</b> HTTPS manifest + SHA-256 verification</p>
            <p><b>→</b> device enrollment + CRITICAL safety probe</p>
            <p><b>✓</b> installs the always-on local Gateway</p>
          </div>
          <div class="terminal-meter" aria-hidden="true">
            <span>LOCAL TRUST</span>
            <i><b></b></i>
            <em>VERIFIED</em>
          </div>
          <a
            class="terminal-cta magnetic"
            href="https://github.com/Aravindh-dev12/Cieav-the-Commit-Layer-for-the-Internet"
            target="_blank"
            rel="noreferrer"
          >
            View CIEAV on GitHub ↗
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
    copy: 'The local Gateway sits between intent and protected digital surfaces, applies deterministic safety policy, and reduces data before any cloud interpretation.',
  },
  {
    state: 'CONTROL',
    icon: '⌘',
    title: 'Commit',
    copy: 'Consequential actions move through PREVIEW → COMMIT / CANCEL, then trusted replay or submit. The resulting Action Receipt is signed and stored locally.',
  },
  {
    state: 'OUTCOME',
    icon: '↗',
    title: 'Verify',
    copy: 'Local observation records OBSERVED_SUCCESS, OBSERVED_FAILURE, or UNKNOWN. Undo appears only after verified success and discovery of a concrete inverse.',
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
        const depth = Number(layer.dataset.depth || 0.2)
        layer.style.setProperty('--motion-y', `${clamped * depth * -54}px`)
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

function bindDepthCards() {
  const cleanups = []
  document.querySelectorAll('.depth-card').forEach((card) => {
    const move = (event) => {
      if (window.matchMedia('(pointer: coarse)').matches) return
      const rect = card.getBoundingClientRect()
      const px = (event.clientX - rect.left) / rect.width - 0.5
      const py = (event.clientY - rect.top) / rect.height - 0.5
      card.style.setProperty('--card-rx', `${(-py * 4.5).toFixed(2)}deg`)
      card.style.setProperty('--card-ry', `${(px * 5.5).toFixed(2)}deg`)
      card.style.setProperty('--card-glow-x', `${((px + 0.5) * 100).toFixed(1)}%`)
      card.style.setProperty('--card-glow-y', `${((py + 0.5) * 100).toFixed(1)}%`)
    }
    const leave = () => {
      card.style.setProperty('--card-rx', '0deg')
      card.style.setProperty('--card-ry', '0deg')
    }
    card.addEventListener('pointermove', move)
    card.addEventListener('pointerleave', leave)
    cleanups.push(() => {
      card.removeEventListener('pointermove', move)
      card.removeEventListener('pointerleave', leave)
    })
  })
  return () => cleanups.forEach((cleanup) => cleanup())
}

let observer
let unbindMagnetic
let unbindSectionMotion
let unbindDepthCards

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible')
    })
  }, { threshold: 0.14 })

  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element))
  unbindMagnetic = bindMagnetic()
  unbindSectionMotion = bindSectionMotion()
  unbindDepthCards = bindDepthCards()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  unbindMagnetic?.()
  unbindSectionMotion?.()
  unbindDepthCards?.()
})
</script>
