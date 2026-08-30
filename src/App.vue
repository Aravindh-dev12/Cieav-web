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

    <section id="product" class="quiet-section quiet-product motion-section">
      <div class="quiet-shell">
        <div class="quiet-heading reveal">
          <span class="section-label">02 / FOR PEOPLE</span>
          <div>
            <h2>Invisible until<br />it matters.</h2>
            <p>
              CIEAV should not feel like another tool you have to operate. Your assistant works normally.
              CIEAV steps in only when an action crosses into real consequence.
            </p>
          </div>
        </div>

        <div class="assistant-demo reveal motion-layer" data-depth="0.04">
          <div class="demo-window">
            <div class="demo-topbar">
              <div class="demo-app">
                <span class="demo-avatar">A</span>
                <div>
                  <strong>Assistant</strong>
                  <span>Ready</span>
                </div>
              </div>
              <span class="quiet-status"><i></i> protected locally</span>
            </div>

            <div class="conversation">
              <div class="message message--assistant">
                <span class="message-avatar">A</span>
                <p>I found the renewal. It is ₹4,990 for another year.</p>
              </div>
              <div class="message message--user">
                <p>Go ahead and renew it.</p>
              </div>

              <div class="commit-inline" :class="`commit-inline--${demoStatus}`">
                <template v-if="demoStatus === 'ready'">
                  <div class="commit-icon">→</div>
                  <div class="commit-copy">
                    <span>Before this happens</span>
                    <strong>Renew Pro plan for ₹4,990</strong>
                    <p>Annual subscription · charged to card ending 1842</p>
                  </div>
                  <div class="commit-actions">
                    <button type="button" class="soft-button" @click="cancelDemo">Cancel</button>
                    <button type="button" class="solid-button" @click="approveDemo">Approve</button>
                  </div>
                </template>

                <template v-else-if="demoStatus === 'verifying'">
                  <span class="spinner" aria-hidden="true"></span>
                  <div class="commit-copy">
                    <span>Action sent</span>
                    <strong>Verifying the result…</strong>
                    <p>CIEAV is waiting for evidence before calling this successful.</p>
                  </div>
                </template>

                <template v-else-if="demoStatus === 'verified'">
                  <div class="verified-icon">✓</div>
                  <div class="commit-copy">
                    <span>Verified</span>
                    <strong>Pro plan renewed</strong>
                    <p>₹4,990 charged · renewal confirmed locally</p>
                  </div>
                  <button type="button" class="soft-button" @click="undoDemo">Undo</button>
                </template>

                <template v-else-if="demoStatus === 'cancelled'">
                  <div class="commit-icon">×</div>
                  <div class="commit-copy">
                    <span>Cancelled</span>
                    <strong>Nothing changed.</strong>
                    <p>The assistant can keep helping without the renewal being committed.</p>
                  </div>
                  <button type="button" class="soft-button" @click="resetDemo">Try again</button>
                </template>

                <template v-else>
                  <div class="verified-icon">↶</div>
                  <div class="commit-copy">
                    <span>Reversed</span>
                    <strong>Renewal undone</strong>
                    <p>The verified inverse completed successfully.</p>
                  </div>
                  <button type="button" class="soft-button" @click="resetDemo">Replay</button>
                </template>
              </div>
            </div>

            <details class="activity-disclosure">
              <summary>
                <span>What happened underneath</span>
                <span class="summary-hint">AG-UI activity</span>
              </summary>
              <div class="activity-content">
                <p>
                  The interface only shows what the person needs. Underneath, agent and local authority stay synchronized through typed events,
                  state changes, tool activity, and an explicit human interrupt at the commit boundary.
                </p>
                <div class="event-row">
                  <span v-for="event in aguiEvents" :key="event">{{ event }}</span>
                </div>
              </div>
            </details>
          </div>

          <div class="demo-note">
            <span>THE IDEA</span>
            <p>
              No permanent CIEAV dashboard. No stream of internal tools. Just a small, trustworthy intervention when the user needs control.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section id="workflow" class="quiet-section quiet-workflow motion-section">
      <div class="quiet-shell">
        <div class="quiet-heading quiet-heading--compact reveal">
          <span class="section-label">03 / BEHAVIOR</span>
          <div>
            <h2>Helpful by default.<br />Visible by exception.</h2>
            <p>CIEAV follows the consequence, not the conversation. Low-risk work stays uninterrupted; meaningful actions get just enough UI.</p>
          </div>
        </div>

        <div class="behavior-list reveal">
          <article v-for="item in behaviorItems" :key="item.title" class="behavior-row">
            <span class="behavior-index">{{ item.index }}</span>
            <div class="behavior-copy">
              <span>{{ item.when }}</span>
              <h3>{{ item.title }}</h3>
            </div>
            <p>{{ item.copy }}</p>
            <span class="behavior-result" :class="`behavior-result--${item.tone}`">{{ item.result }}</span>
          </article>
        </div>

        <div class="protocol-note reveal">
          <div>
            <span>AG-UI underneath</span>
            <strong>Messages · tools · state · interrupts</strong>
          </div>
          <p>
            AG-UI is the connection layer, not another screen. CIEAV can consume the same user/agent interaction stream and surface only the moments that require authority.
          </p>
        </div>
      </div>
    </section>

    <section id="developers" class="quiet-section quiet-install motion-section">
      <div class="quiet-shell install-simple">
        <div class="install-simple__copy reveal motion-layer" data-depth="0.04">
          <span class="section-label">04 / INSTALL</span>
          <h2>Install it once.<br />Then forget it.</h2>
          <p>
            The Gateway runs locally in the background. Apps and agents keep their own interfaces while CIEAV supplies a common commit boundary when consequence needs local authority.
          </p>
          <a
            class="text-link magnetic"
            href="https://github.com/Aravindh-dev12/Cieav-the-Commit-Layer-for-the-Internet"
            target="_blank"
            rel="noreferrer"
          >
            View the project on GitHub <span>↗</span>
          </a>
        </div>

        <article class="install-simple__card reveal motion-layer" data-depth="0.07">
          <div class="install-card-top">
            <div>
              <span>LOCAL GATEWAY</span>
              <strong>Quick install</strong>
            </div>
            <span class="quiet-status"><i></i> ready</span>
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

          <button type="button" class="command-line" @click="copyCommand">
            <code>{{ installCommand }}</code>
            <span>{{ copied ? 'Copied ✓' : 'Copy' }}</span>
          </button>

          <div class="install-after">
            <span>After install</span>
            <p>Runs quietly · verifies locally · appears only at consequence boundaries</p>
          </div>
        </article>
      </div>
    </section>

    <footer class="quiet-footer">
      <a class="wordmark footer-mark" href="#top" aria-label="Cieav home">
        <img :src="logoMark" alt="" class="wordmark-logo wordmark-logo--footer" />
        <span>CIEAV</span>
      </a>
      <p>The commit layer for the internet.</p>
      <div class="quiet-footer__links">
        <a href="#product">Experience</a>
        <a href="#workflow">Behavior</a>
        <a href="#developers">Install</a>
      </div>
      <span>© 2026 Cieav</span>
    </footer>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import logoMark from './public/logo.png'
import formulaStairs from './formula-stairs.png'

const copied = ref(false)
const activePlatform = ref('unix')
const demoStatus = ref('ready')
let demoTimer

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

const aguiEvents = [
  'RUN_STARTED',
  'TOOL_CALL_START',
  'STATE_DELTA',
  'TOOL_CALL_RESULT',
  'RUN_FINISHED',
]

const behaviorItems = [
  {
    index: '01',
    when: 'READ / THINK / DRAFT',
    title: 'Stay out of the way.',
    copy: 'Searching, reasoning, summarizing, and drafting can feel like the assistant the user already chose.',
    result: 'NO INTERRUPTION',
    tone: 'quiet',
  },
  {
    index: '02',
    when: 'SEND / BUY / CHANGE',
    title: 'Show the consequence.',
    copy: 'When intent becomes an external action, show a compact preview with the real target, amount, scope, or change.',
    result: 'ASK ONCE',
    tone: 'review',
  },
  {
    index: '03',
    when: 'AFTER COMMIT',
    title: 'Verify, then disappear.',
    copy: 'Confirm the observed outcome. Offer Undo only when a concrete inverse is known, then return control to the original app.',
    result: 'PROVE + RECOVER',
    tone: 'success',
  },
]

function approveDemo() {
  window.clearTimeout(demoTimer)
  demoStatus.value = 'verifying'
  demoTimer = window.setTimeout(() => {
    demoStatus.value = 'verified'
  }, 1100)
}

function cancelDemo() {
  window.clearTimeout(demoTimer)
  demoStatus.value = 'cancelled'
}

function undoDemo() {
  window.clearTimeout(demoTimer)
  demoStatus.value = 'undone'
}

function resetDemo() {
  window.clearTimeout(demoTimer)
  demoStatus.value = 'ready'
}

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
  window.clearTimeout(demoTimer)
  observer?.disconnect()
  unbindMagnetic?.()
  unbindMiddleMotion?.()
})
</script>