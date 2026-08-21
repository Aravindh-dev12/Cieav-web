<template>
  <main class="site" @pointermove="trackPointer">
    <div class="cursor-cross" aria-hidden="true"></div>

    <header class="topbar">
      <a
        class="wordmark"
        href="#top"
        aria-label="Cieav home"
        style="display: inline-flex; align-items: center; gap: 10px;"
      >
        <img
          :src="logoMark"
          alt=""
          width="32"
          height="32"
          style="display: block; width: 32px; height: 32px; object-fit: contain; flex: 0 0 auto;"
        />
        <span>Cieav</span>
      </a>

      <nav class="nav" aria-label="Primary navigation">
        <a href="#product">Product</a>
        <a href="#workflow">Workflow</a>
        <a href="#developers">Developers</a>
      </nav>

      <a class="primary-button magnetic" href="#developers">
        Start Building
      </a>
    </header>

    <section
      id="top"
      class="hero"
      :style="{
        backgroundImage: `url(${formulaStairs})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
        backgroundRepeat: 'no-repeat',
      }"
    >
      <div class="hero-grid" aria-hidden="true"></div>

      <div class="hero-copy reveal-on-load">
        <p class="kicker"><span></span> AI website engineering</p>
        <h1>Turn Every Product Idea<br />Into A Working Website</h1>
        <p class="hero-lede">
          Cieav turns product requirements into production-ready websites —
          generating structure, interfaces, and workflows your team can refine and ship.
        </p>

        <div class="hero-actions">
          <a class="primary-button primary-button--large magnetic" href="#developers">
            Start Building
          </a>
          <a class="outline-button magnetic" href="#workflow">
            View Workflow
          </a>
        </div>
      </div>

      <div class="hero-index hero-index--left" aria-hidden="true">
        <span>01</span>
        <span>PRODUCT / WEB</span>
      </div>
      <div class="hero-index hero-index--right" aria-hidden="true">
        <span>2026</span>
        <span>BUILD SYSTEM</span>
      </div>
    </section>

    <section id="product" class="red-story reveal">
      <div class="red-noise" aria-hidden="true"></div>

      <div class="red-copy">
        <p class="kicker kicker--light"><span></span> From intent to interface</p>
        <h2>Build the foundation.<br />Keep the freedom.</h2>
        <p>
          Describe the product once. Cieav maps the structure, generates the interface,
          and gives you a real codebase instead of a locked visual mockup.
        </p>
        <a class="light-button magnetic" href="#workflow">Explore the system</a>

        <div class="red-meta">
          <span>ARCHITECTURE</span>
          <span>INTERFACE</span>
          <span>WORKFLOW</span>
          <span>CODE</span>
        </div>
      </div>
    </section>

    <section id="workflow" class="workflow-section">
      <div class="section-heading reveal">
        <p class="kicker"><span></span> One tool. Full pipeline.</p>
        <h2>From a sentence to something you can ship.</h2>
        <p>
          Cieav keeps the workflow legible: define the product, generate the system,
          then refine the output in the tools you already use.
        </p>
      </div>

      <div class="workflow-grid reveal">
        <article v-for="(step, index) in steps" :key="step.title" class="workflow-card">
          <div class="card-top">
            <span>0{{ index + 1 }}</span>
            <span>{{ step.state }}</span>
          </div>
          <div class="card-icon" aria-hidden="true">{{ step.icon }}</div>
          <h3>{{ step.title }}</h3>
          <p>{{ step.copy }}</p>
        </article>
      </div>
    </section>

    <section id="developers" class="developer-section reveal">
      <div class="developer-copy">
        <p class="kicker kicker--light"><span></span> Download / CLI</p>
        <h2>Install once.<br />Build from anywhere.</h2>
        <p>
          A developer-first workflow for turning product intent into a real web project.
          Keep the files, edit the code, deploy wherever you want.
        </p>
      </div>

      <div class="terminal-card">
        <div class="terminal-head">
          <span>INSTALL CIEAV</span>
          <span>macOS · Linux</span>
        </div>
        <button class="command" type="button" @click="copyCommand">
          <code>{{ installCommand }}</code>
          <span>{{ copied ? 'COPIED' : 'COPY' }}</span>
        </button>
        <div class="terminal-lines" aria-hidden="true">
          <p><b>→</b> resolving latest release</p>
          <p><b>→</b> installing cieav</p>
          <p><b>✓</b> ready to build</p>
        </div>
        <a class="terminal-cta magnetic" href="https://github.com/Aravindh-dev12/Cieav-web" target="_blank" rel="noreferrer">
          View on GitHub ↗
        </a>
      </div>
    </section>

    <footer class="footer">
      <a
        class="wordmark footer-mark"
        href="#top"
        aria-label="Cieav home"
        style="display: inline-flex; align-items: center; gap: 12px;"
      >
        <img
          :src="logoMark"
          alt=""
          width="40"
          height="40"
          style="display: block; width: 40px; height: 40px; object-fit: contain; flex: 0 0 auto;"
        />
        <span>Cieav</span>
      </a>
      <p>AI-native website engineering.</p>
      <div class="footer-nav">
        <a href="#product">Product</a>
        <a href="#workflow">Workflow</a>
        <a href="#developers">Developers</a>
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
const installCommand = 'curl -fsSL cieav.dev/install | sh'

const steps = [
  {
    state: 'INPUT',
    icon: '✦',
    title: 'Describe',
    copy: 'Write the product idea in plain language. Define the audience, pages, behavior, and constraints.',
  },
  {
    state: 'SYSTEM',
    icon: '⌘',
    title: 'Generate',
    copy: 'Cieav turns the requirements into structure, components, content, interaction, and implementation.',
  },
  {
    state: 'OUTPUT',
    icon: '↗',
    title: 'Ship',
    copy: 'Open the generated project, refine anything you want, and deploy through your existing workflow.',
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

let observer
let unbindMagnetic

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible')
    })
  }, { threshold: 0.14 })

  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element))
  unbindMagnetic = bindMagnetic()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  unbindMagnetic?.()
})
</script>
