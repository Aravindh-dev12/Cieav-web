<template>
  <main @pointermove="trackPointer">
    <div class="cursor-aura" aria-hidden="true"></div>

    <header class="site-header">
      <a class="brand" href="#top" aria-label="Cieav AI home"><span class="brand-star">✦</span>Cieav AI</a>
      <nav class="desktop-nav" aria-label="Primary">
        <a href="#about">About</a>
        <a href="#product">Product</a>
        <a href="#features">Features</a>
        <a href="#stack">Stack</a>
        <a href="#contact">Contact</a>
      </nav>
      <div class="header-actions">
        <a class="login" href="#contact">Login</a>
        <a class="button button-light magnetic" href="#contact">Join Waitlist <span>→</span></a>
      </div>
    </header>

    <section id="top" class="hero section-shell">
      <div class="hero-copy hero-intro">
        <p class="eyebrow hero-reveal delay-1">Launching a new era of intelligent motion</p>
        <h1 class="hero-reveal delay-2"><span>Animate</span> <em>intelligent</em> <span>products.</span></h1>
        <p class="hero-lede hero-reveal delay-3">Cieav AI turns product ideas into cinematic, motion-native experiences — interactive, responsive, and ready to launch.</p>
        <div class="hero-actions hero-reveal delay-4">
          <a class="button button-light magnetic" href="#contact">Join Waitlist <span>→</span></a>
          <button class="button button-ghost magnetic" @click="scrollToProduct"><span class="play">▶</span> Watch Demo</button>
        </div>
        <div class="hero-meta hero-reveal delay-5">
          <div class="avatar-stack" aria-hidden="true"><span></span><span></span><span></span></div>
          <p>Built for teams shipping the future.</p>
        </div>
      </div>
      <div class="hero-visual hero-reveal delay-2">
        <WebGPUField />
      </div>
      <div class="scroll-cue hero-reveal delay-5">SCROLL TO EXPLORE <span>↓</span></div>
    </section>

    <section class="motion-marquee" aria-label="Cieav animation capabilities">
      <div class="marquee-track">
        <span>REALTIME MOTION</span><b>✦</b><span>WEBGPU</span><b>✦</b><span>GENERATIVE INTERFACES</span><b>✦</b><span>POINTER REACTIVE</span><b>✦</b><span>SCROLL DRIVEN</span><b>✦</b>
        <span>REALTIME MOTION</span><b>✦</b><span>WEBGPU</span><b>✦</b><span>GENERATIVE INTERFACES</span><b>✦</b><span>POINTER REACTIVE</span><b>✦</b><span>SCROLL DRIVEN</span><b>✦</b>
      </div>
    </section>

    <section id="features" class="features-grid section-shell reveal">
      <article v-for="feature in features" :key="feature.title" class="feature-card tilt-card">
        <div class="feature-icon" aria-hidden="true">{{ feature.icon }}</div>
        <p class="feature-kicker">0{{ feature.id }}</p>
        <h2>{{ feature.title }}</h2>
        <p>{{ feature.copy }}</p>
      </article>
    </section>

    <section id="product" class="product-showcase section-shell reveal">
      <div class="product-copy">
        <p class="eyebrow">Motion that understands context</p>
        <h2>From prompt to product story.</h2>
        <p>Compose responsive launch scenes, kinetic interfaces, generative transitions, and ambient product worlds from one motion-native system.</p>
        <ul class="product-list">
          <li><span>01</span> Context-aware animation logic</li>
          <li><span>02</span> Interactive state-driven motion</li>
          <li><span>03</span> GPU-accelerated visual systems</li>
        </ul>
      </div>
      <div class="product-canvas" aria-label="Animated product preview">
        <div class="city-lines"></div>
        <div class="scan-line"></div>
        <div class="launch-star">✦</div>
        <div class="walker"><span></span></div>
        <div class="floating-panel panel-a"><small>SCENE 04</small><strong>Launch Sequence</strong><span>Running</span></div>
        <div class="floating-panel panel-b"><small>MOTION</small><strong>42 FPS</strong><span>Realtime</span></div>
      </div>
    </section>

    <section id="stack" class="stack-section section-shell reveal">
      <div>
        <p class="eyebrow">Built with a modern stack</p>
        <h2>Fast by architecture.</h2>
      </div>
      <div class="stack-grid">
        <article class="stack-card tilt-card"><span class="stack-mark">V</span><div><strong>Vue.js</strong><small>Reactive interface layer</small></div></article>
        <article class="stack-card tilt-card"><span class="stack-mark">Z</span><div><strong>Zustand</strong><small>Lightweight shared state</small></div></article>
        <article class="stack-card tilt-card"><span class="stack-mark">W</span><div><strong>WebGPU</strong><small>Realtime GPU rendering</small></div></article>
        <article class="stack-card tilt-card"><span class="stack-mark">V</span><div><strong>Vite</strong><small>Instant development loop</small></div></article>
      </div>
    </section>

    <section id="about" class="manifesto section-shell reveal">
      <p class="eyebrow">Cieav AI</p>
      <h2>Interfaces should not just respond.<br />They should feel alive.</h2>
      <div class="manifesto-copy">
        <p>We are building an AI-native animation system for teams that want product launches to feel authored, cinematic, and deeply interactive.</p>
        <a href="#contact" class="text-link">Build with Cieav <span>↗</span></a>
      </div>
    </section>

    <section class="metrics section-shell reveal" aria-label="Launch metrics">
      <div><strong>10×</strong><span>Faster prototyping</span></div>
      <div><strong>92%</strong><span>Faster iteration</span></div>
      <div><strong>25K+</strong><span>Waitlist target</span></div>
      <div><strong>SOON</strong><span>Private launch</span></div>
    </section>

    <footer id="contact" class="footer section-shell reveal">
      <div>
        <p class="eyebrow">Ready when you are</p>
        <h2>Turn vision into motion.</h2>
      </div>
      <a class="button button-light button-large magnetic" href="mailto:hello@cieav.ai">Join the launch <span>→</span></a>
      <div class="footer-bottom"><span>© 2026 Cieav AI</span><span>Built for motion-native products.</span></div>
    </footer>
  </main>
</template>

<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import WebGPUField from './components/WebGPUField.vue'
import { appStore } from './store'

const features = [
  { id: 1, icon: '◌', title: 'Motion Engine', copy: 'Generate cinematic interaction systems that react to content, pointer movement, scroll, and state.' },
  { id: 2, icon: '✦', title: 'Launch Faster', copy: 'Move from static concepts to expressive product stories without rebuilding every animation by hand.' },
  { id: 3, icon: '⌁', title: 'Realtime Visuals', copy: 'Use GPU-rendered particles, fields, and procedural scenes that stay smooth and responsive.' },
  { id: 4, icon: '◎', title: 'Stay Aligned', copy: 'Keep narrative, interaction, and visual direction inside one coherent product experience.' },
]

function trackPointer(event) {
  const x = event.clientX / window.innerWidth
  const y = event.clientY / window.innerHeight
  appStore.getState().setPointer(x, y)
  document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`)
  document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`)
}

function onScroll() {
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
  const progress = window.scrollY / max
  appStore.getState().setScroll(progress)
  document.documentElement.style.setProperty('--page-scroll', `${progress}`)
}

function scrollToProduct() {
  document.querySelector('#product')?.scrollIntoView({ behavior: 'smooth' })
}

function bindMagneticButtons() {
  const cleanups = []
  document.querySelectorAll('.magnetic').forEach((el) => {
    const move = (event) => {
      const rect = el.getBoundingClientRect()
      const x = event.clientX - rect.left - rect.width / 2
      const y = event.clientY - rect.top - rect.height / 2
      el.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`
    }
    const leave = () => { el.style.transform = '' }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    cleanups.push(() => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    })
  })
  return () => cleanups.forEach((fn) => fn())
}

function bindTiltCards() {
  const cleanups = []
  document.querySelectorAll('.tilt-card').forEach((el) => {
    const move = (event) => {
      const rect = el.getBoundingClientRect()
      const px = (event.clientX - rect.left) / rect.width - 0.5
      const py = (event.clientY - rect.top) / rect.height - 0.5
      el.style.transform = `perspective(700px) rotateX(${py * -4}deg) rotateY(${px * 5}deg) translateY(-3px)`
    }
    const leave = () => { el.style.transform = '' }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    cleanups.push(() => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    })
  })
  return () => cleanups.forEach((fn) => fn())
}

let observer
let unbindMagnetic
let unbindTilt

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible')
    })
  }, { threshold: 0.12 })

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
  unbindMagnetic = bindMagneticButtons()
  unbindTilt = bindTiltCards()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  observer?.disconnect()
  unbindMagnetic?.()
  unbindTilt?.()
})
</script>
