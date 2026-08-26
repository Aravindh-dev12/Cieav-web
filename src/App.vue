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

    <section id="product" class="editorial-authority motion-section">
      <div class="editorial-shell">
        <div class="editorial-meta reveal">
          <span>02 / LOCAL AUTHORITY</span>
          <span>THE CONSEQUENCE BOUNDARY</span>
        </div>

        <div class="editorial-statement reveal motion-layer" data-depth="0.045">
          <p class="editorial-overline">The point of no return should never be invisible.</p>
          <h2>
            Intelligence can<br />
            <span>suggest.</span>
            Authority must<br />
            <em>decide.</em>
          </h2>
        </div>

        <div class="editorial-divider" aria-hidden="true">
          <span>LOCAL</span>
          <i></i>
          <span>BOUNDARY</span>
        </div>

        <div class="editorial-lower reveal">
          <p class="editorial-lede">
            CIEAV separates interpretation from consequence. Models can reason about what should happen; the local
            Gateway decides whether it may happen, shows the consequence before commit, and verifies the result afterward.
          </p>

          <div class="editorial-principles">
            <article>
              <span>01</span>
              <h3>Nothing hidden.</h3>
              <p>The action becomes concrete before authority is granted.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Nothing assumed.</h3>
              <p>Dispatch is recorded, but success waits for evidence.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Nothing irreversible by default.</h3>
              <p>Undo appears only when a real inverse is known.</p>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section id="workflow" class="kinetic-flow motion-section">
      <div class="kinetic-shell">
        <div class="kinetic-head reveal motion-layer" data-depth="0.04">
          <div>
            <span>03 / COMMIT FLOW</span>
            <span>FIVE STATES / ONE CONSEQUENCE</span>
          </div>
          <h2>From intent<br />to proof.</h2>
          <p>
            Each state is explicit. Hover or focus a step to bring it forward; the others recede so the sequence reads as one controlled path.
          </p>
        </div>

        <div class="kinetic-list">
          <article
            v-for="(step, index) in corridorSteps"
            :key="step.title"
            class="kinetic-step reveal"
            :class="{ 'kinetic-step--commit': index === 2 }"
            tabindex="0"
          >
            <div class="kinetic-step__number">0{{ index + 1 }}</div>
            <div class="kinetic-step__title">
              <span>{{ step.state }}</span>
              <h3>{{ step.title }}</h3>
            </div>
            <p>{{ step.copy }}</p>
            <div class="kinetic-step__status">
              <span>{{ step.signal }}</span>
              <strong>{{ step.right }}</strong>
            </div>
            <div class="kinetic-step__arrow" aria-hidden="true">↘</div>
          </article>
        </div>

        <div class="kinetic-caption reveal">
          <span>INTERPRETATION ≠ AUTHORITY</span>
          <span>DISPATCH ≠ SUCCESS</span>
          <span>UNDO = VERIFIED INVERSE</span>
        </div>
      </div>
    </section>

    <section id="developers" class="minimal-install motion-section">
      <div class="minimal-install__ghost" aria-hidden="true">LOCAL</div>
      <div class="minimal-shell">
        <div class="minimal-copy reveal motion-layer" data-depth="0.05">
          <div class="minimal-meta">
            <span>04 / INSTALL</span>
            <span>LOCAL RUNTIME</span>
          </div>
          <h2>Install authority<br />where consequence lives.</h2>
          <p>
            A small local runtime verifies its release, enrolls the device, starts the Gateway, and keeps the execution boundary close to the user.
          </p>
        </div>

        <div class="minimal-command reveal motion-layer" data-depth="0.08">
          <div class="minimal-command__label">
            <span>QUICK START</span>
            <span>READY</span>
          </div>

          <button type="button" class="minimal-command__copy" @click="copyCommand">
            <code>{{ installCommand }}</code>
            <span>{{ copied ? 'COPIED ✓' : 'COPY' }}</span>
          </button>

          <div class="minimal-steps">
            <div><span>01</span><p>Verify release</p><b>PASS</b></div>
            <div><span>02</span><p>Enroll device</p><b>PASS</b></div>
            <div><span>03</span><p>Start Gateway</p><b>ACTIVE</b></div>
          </div>

          <a
            class="minimal-github magnetic"
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
