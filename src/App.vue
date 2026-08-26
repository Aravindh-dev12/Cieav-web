<template>
  <main class="site-shell">
    <header class="site-header">
      <a class="brand" href="#top" aria-label="CIEAV home">
        <img :src="logoMark" alt="" class="brand__mark" />
        <span class="brand__name">CIEAV</span>
      </a>

      <nav class="nav-links" aria-label="Primary navigation">
        <a href="#platform">Platform</a>
        <a href="#flow">Commit flow</a>
        <a href="#install">Install</a>
      </nav>

      <a class="button button--small button--dark" href="#install">
        Get CIEAV
        <span aria-hidden="true">↘</span>
      </a>
    </header>

    <section id="top" class="hero section-wrap">
      <div class="hero__ambient" aria-hidden="true">
        <div class="hero__orb hero__orb--one"></div>
        <div class="hero__orb hero__orb--two"></div>
        <div class="hero__grid"></div>
      </div>

      <div class="hero__copy">
        <div class="eyebrow">
          <span class="status-dot"></span>
          Local authority for AI actions
        </div>

        <h1>
          AI can propose.<br />
          <span>You decide what happens.</span>
        </h1>

        <p class="hero__lede">
          CIEAV is the local commit layer between digital intent and real consequence.
          It previews actions, applies device policy, commits deliberately, and verifies the result before calling anything done.
        </p>

        <div class="hero__actions">
          <a class="button button--accent" href="#install">
            Install CIEAV
            <span aria-hidden="true">→</span>
          </a>
          <a class="text-link" href="#flow">
            See how commit works
            <span aria-hidden="true">↓</span>
          </a>
        </div>

        <div class="hero__meta" aria-label="Product characteristics">
          <div>
            <strong>Local-first</strong>
            <span>Authority stays on your device</span>
          </div>
          <div>
            <strong>Evidence-based</strong>
            <span>Success requires observation</span>
          </div>
          <div>
            <strong>Reversible</strong>
            <span>Undo only when an inverse exists</span>
          </div>
        </div>
      </div>

      <div class="hero__visual" aria-label="CIEAV commit sequence illustration">
        <div class="console-card">
          <div class="console-card__header">
            <div>
              <span class="window-dot"></span>
              <span class="window-dot"></span>
              <span class="window-dot"></span>
            </div>
            <span>CIEAV / GATEWAY</span>
            <span class="live-pill"><i></i> LIVE</span>
          </div>

          <div class="console-card__body">
            <div class="request-card">
              <span class="request-card__label">Incoming intent</span>
              <p>“Send the approved proposal to the client.”</p>
              <div class="request-card__route">
                <span>cloud interpretation</span>
                <b>→</b>
                <span class="request-card__route-local">local authority</span>
              </div>
            </div>

            <div class="commit-stack">
              <div class="commit-row is-complete">
                <span class="commit-row__icon">✓</span>
                <div>
                  <strong>Policy checked</strong>
                  <small>Recipient + document approved</small>
                </div>
                <time>12ms</time>
              </div>
              <div class="commit-row is-complete">
                <span class="commit-row__icon">✓</span>
                <div>
                  <strong>Preview confirmed</strong>
                  <small>Consequence shown before submit</small>
                </div>
                <time>local</time>
              </div>
              <div class="commit-row is-active">
                <span class="commit-row__icon">03</span>
                <div>
                  <strong>Commit authorized</strong>
                  <small>Trusted replay in progress</small>
                </div>
                <span class="pulse-line"></span>
              </div>
              <div class="commit-row">
                <span class="commit-row__icon">04</span>
                <div>
                  <strong>Verify evidence</strong>
                  <small>Waiting for observed outcome</small>
                </div>
                <span class="pending-pill">PENDING</span>
              </div>
            </div>
          </div>

          <div class="console-card__footer">
            <span>Authority boundary</span>
            <span>Nothing is assumed successful.</span>
          </div>
        </div>

        <div class="floating-card floating-card--policy">
          <span class="floating-card__icon">⌁</span>
          <div>
            <small>Policy engine</small>
            <strong>Local rules applied</strong>
          </div>
        </div>

        <div class="floating-card floating-card--verify">
          <span class="floating-card__icon">◎</span>
          <div>
            <small>Outcome</small>
            <strong>Verified, not guessed</strong>
          </div>
        </div>
      </div>
    </section>

    <section class="trust-strip" aria-label="CIEAV operating principles">
      <div class="section-wrap trust-strip__inner">
        <span>THE COMMIT LAYER FOR THE INTERNET</span>
        <div class="trust-strip__items">
          <span>Intent</span><i>→</i>
          <span>Policy</span><i>→</i>
          <span>Preview</span><i>→</i>
          <span>Commit</span><i>→</i>
          <span>Evidence</span><i>→</i>
          <span>Verify</span>
        </div>
      </div>
    </section>

    <section id="platform" class="platform section-wrap section-space">
      <div class="section-intro">
        <div class="eyebrow eyebrow--dark">01 / Platform</div>
        <h2>Put consequence behind a boundary.</h2>
        <p>
          Models are good at interpretation. They should not silently become the authority for every consequential action.
          CIEAV introduces a local layer that makes execution legible, controllable, and observable.
        </p>
      </div>

      <div class="feature-grid">
        <article class="feature-card feature-card--accent">
          <div class="feature-card__top">
            <span>01</span>
            <span class="feature-card__symbol">⌁</span>
          </div>
          <div>
            <h3>Local authority</h3>
            <p>Policy and execution boundaries stay close to the user instead of disappearing inside a remote model call.</p>
          </div>
        </article>

        <article class="feature-card">
          <div class="feature-card__top">
            <span>02</span>
            <span class="feature-card__symbol">◫</span>
          </div>
          <div>
            <h3>Visible consequence</h3>
            <p>Preview makes the action concrete before commit, so the user can understand, change, or cancel it.</p>
          </div>
        </article>

        <article class="feature-card feature-card--dark">
          <div class="feature-card__top">
            <span>03</span>
            <span class="feature-card__symbol">◎</span>
          </div>
          <div>
            <h3>Verified outcome</h3>
            <p>Dispatch is not success. CIEAV waits for credible evidence and preserves UNKNOWN when the result is ambiguous.</p>
          </div>
        </article>
      </div>
    </section>

    <section id="flow" class="flow-section">
      <div class="section-wrap section-space">
        <div class="section-intro section-intro--inverse">
          <div class="eyebrow eyebrow--light">02 / Commit flow</div>
          <h2>A five-step path from intent to proof.</h2>
          <p>
            Every consequential action moves through the same explicit sequence. The boundary is easy to inspect and hard to accidentally skip.
          </p>
        </div>

        <div class="flow-list">
          <article v-for="(step, index) in flowSteps" :key="step.title" class="flow-item">
            <div class="flow-item__index">0{{ index + 1 }}</div>
            <div class="flow-item__symbol" aria-hidden="true">{{ step.symbol }}</div>
            <div class="flow-item__copy">
              <span>{{ step.state }}</span>
              <h3>{{ step.title }}</h3>
              <p>{{ step.copy }}</p>
            </div>
            <div class="flow-item__rule">
              <span>{{ step.rule }}</span>
              <i></i>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="statement section-wrap section-space">
      <div class="statement__label">
        <span class="status-dot"></span>
        Design principle
      </div>
      <blockquote>
        “The model can interpret the world.<br />
        <em>The device owns the consequence.</em>”
      </blockquote>
      <p>
        CIEAV keeps a deliberate separation between intelligence and authority—so powerful automation can remain useful without making every action invisible or irreversible.
      </p>
    </section>

    <section id="install" class="install-section">
      <div class="section-wrap install-layout">
        <div class="install-copy">
          <div class="eyebrow eyebrow--light">03 / Install</div>
          <h2>Bring the commit layer onto your device.</h2>
          <p>
            CIEAV runs as a small local gateway. Installation verifies the release, enrolls the device, runs a safety probe, and starts the local service.
          </p>
          <a
            class="button button--light"
            href="https://github.com/Aravindh-dev12/Cieav-the-Commit-Layer-for-the-Internet"
            target="_blank"
            rel="noreferrer"
          >
            View project on GitHub
            <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div class="install-card">
          <div class="install-card__header">
            <span>QUICK START</span>
            <span class="live-pill live-pill--dark"><i></i> LOCAL</span>
          </div>

          <button class="command-box" type="button" @click="copyCommand" aria-label="Copy install command">
            <code>{{ installCommand }}</code>
            <span>{{ copied ? 'COPIED ✓' : 'COPY' }}</span>
          </button>

          <div class="install-checks">
            <div><span>01</span><p>Verify release signature</p><strong>PASS</strong></div>
            <div><span>02</span><p>Enroll this device</p><strong>PASS</strong></div>
            <div><span>03</span><p>Start local gateway</p><strong>ACTIVE</strong></div>
          </div>

          <div class="install-card__note">
            <span>Note</span>
            <p>Replace the download-domain placeholder with the official release host when distribution is ready.</p>
          </div>
        </div>
      </div>
    </section>

    <footer class="site-footer section-wrap">
      <a class="brand brand--footer" href="#top" aria-label="CIEAV home">
        <img :src="logoMark" alt="" class="brand__mark" />
        <span class="brand__name">CIEAV</span>
      </a>
      <p>The commit layer for the internet.</p>
      <nav aria-label="Footer navigation">
        <a href="#platform">Platform</a>
        <a href="#flow">Commit flow</a>
        <a href="#install">Install</a>
      </nav>
      <span>© 2026 CIEAV</span>
    </footer>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import logoMark from './public/logo.png'

const copied = ref(false)
const installCommand = 'curl -fsSL https://<CIEAV-DOWNLOAD-DOMAIN>/install.sh | sh'

const flowSteps = [
  {
    state: 'INPUT',
    title: 'Intent',
    symbol: 'I',
    rule: 'Interpretation is not authority',
    copy: 'A request arrives and can be interpreted by cloud intelligence, but execution authority remains local.',
  },
  {
    state: 'BOUNDARY',
    title: 'Preview',
    symbol: 'P',
    rule: 'Consequence becomes visible',
    copy: 'Policy is applied and the concrete action is shown before the user crosses the commit boundary.',
  },
  {
    state: 'AUTHORITY',
    title: 'Commit',
    symbol: 'C',
    rule: 'Authorization is explicit',
    copy: 'Once authorized, the Gateway performs trusted replay or submit and records exactly what was dispatched.',
  },
  {
    state: 'EVIDENCE',
    title: 'Observe',
    symbol: 'O',
    rule: 'Dispatch is not success',
    copy: 'CIEAV watches the local environment for credible evidence instead of assuming the intended result occurred.',
  },
  {
    state: 'OUTCOME',
    title: 'Verify',
    symbol: 'V',
    rule: 'Undo requires a real inverse',
    copy: 'The outcome resolves only when evidence supports it. Reversal appears only when success and a concrete inverse are known.',
  },
]

async function copyCommand() {
  try {
    await navigator.clipboard.writeText(installCommand)
    copied.value = true
    window.setTimeout(() => {
      copied.value = false
    }, 1600)
  } catch {
    copied.value = false
  }
}
</script>
