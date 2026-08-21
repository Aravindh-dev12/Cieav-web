<template>
  <main @pointermove="trackPointer">
    <div class="cursor-aura" aria-hidden="true"></div>

    <header class="site-header">
      <a class="brand" href="#top" aria-label="Cieav AI home">
        <span class="brand-star">✦</span>
        <span>Cieav AI</span>
      </a>

      <nav class="desktop-nav" aria-label="Primary">
        <a href="#about">About</a>
        <a href="#product">Product</a>
        <a href="#features">Features</a>
        <a href="#stack">Stack</a>
        <a href="#contact">Contact</a>
      </nav>

      <div class="header-actions">
        <a class="login" href="#contact">Login</a>
        <a class="button button-light magnetic" href="#contact">Join waitlist <span>→</span></a>
      </div>
    </header>

    <section id="top" class="hero section-shell">
      <div class="hero-copy hero-intro">
        <div class="hero-system hero-reveal delay-1">
          <span class="status-dot"></span>
          <span>Motion intelligence / private preview</span>
        </div>

        <p class="eyebrow hero-reveal delay-1">Launching a new era of intelligent motion</p>
        <h1 class="hero-reveal delay-2">
          <span>The AI that turns</span>
          <em>vision into motion.</em>
        </h1>
        <p class="hero-lede hero-reveal delay-3">
          Cieav AI turns product ideas into cinematic, motion-native experiences — interactive, responsive, and ready to launch.
        </p>

        <div class="hero-actions hero-reveal delay-4">
          <a class="button button-light magnetic" href="#contact">Join waitlist <span>→</span></a>
          <button class="button button-ghost magnetic" type="button" @click="scrollToProduct">
            <span class="play">▶</span>
            Watch demo
          </button>
        </div>

        <div class="hero-meta hero-reveal delay-5">
          <div class="avatar-stack" aria-hidden="true"><span></span><span></span><span></span></div>
          <p>Built for teams shipping the future.</p>
        </div>

        <div class="hero-stack hero-reveal delay-5" aria-label="Technology stack">
          <span>Vue 3</span>
          <i></i>
          <span>Zustand</span>
          <i></i>
          <span>WebGPU</span>
        </div>
      </div>

      <div class="hero-visual hero-reveal delay-2">
        <WebGPUField />
        <div class="hero-coordinate coordinate-a" aria-hidden="true">X 48.12 / Y 72.04</div>
        <div class="hero-coordinate coordinate-b" aria-hidden="true">FIELD 01 — ACTIVE</div>
      </div>

      <div class="scroll-cue hero-reveal delay-5">SCROLL TO EXPLORE <span>↓</span></div>
    </section>

    <section class="motion-marquee" aria-label="Cieav animation capabilities">
      <div class="marquee-track">
        <template v-for="n in 2" :key="n">
          <span>REALTIME MOTION</span><b>✦</b>
          <span>WEBGPU</span><b>✦</b>
          <span>GENERATIVE INTERFACES</span><b>✦</b>
          <span>POINTER REACTIVE</span><b>✦</b>
          <span>SCROLL DRIVEN</span><b>✦</b>
        </template>
      </div>
    </section>

    <section id="features" class="features-wrap section-shell reveal">
      <div class="section-heading">
        <p class="eyebrow">Capabilities</p>
        <h2>Motion is not decoration.<br /><em>It is the product language.</em></h2>
      </div>

      <div class="features-grid">
        <article v-for="feature in features" :key="feature.title" class="feature-card tilt-card">
          <div class="feature-top">
            <div class="feature-icon" aria-hidden="true">{{ feature.icon }}</div>
            <p class="feature-kicker">0{{ feature.id }}</p>
          </div>
          <div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.copy }}</p>
          </div>
        </article>
      </div>
    </section>

    <section id="product" class="product-showcase section-shell reveal">
      <div class="product-copy">
        <p class="eyebrow">Motion that understands context</p>
        <h2>From prompt to<br /><em>product story.</em></h2>
        <p>
          Compose responsive launch scenes, kinetic interfaces, generative transitions, and ambient product worlds from one motion-native system.
        </p>

        <ul class="product-list">
          <li><span>01</span><strong>Context-aware animation logic</strong><small>Motion that reacts to content and intent.</small></li>
          <li><span>02</span><strong>Interactive state-driven motion</strong><small>Every transition follows the product state.</small></li>
          <li><span>03</span><strong>GPU-accelerated visual systems</strong><small>Realtime fields, particles, and shaders.</small></li>
        </ul>
      </div>

      <div class="product-canvas product-console" aria-label="Realtime Cieav system preview">
        <div class="canvas-grid"></div>
        <div class="scan-line"></div>

        <div class="console-title">
          <small>CIEAV / MOTION ENGINE</small>
          <strong>Realtime system</strong>
          <span><i></i> Online</span>
        </div>

        <div class="console-wave" aria-hidden="true">
          <span v-for="n in 22" :key="n" :style="{ '--bar': n }"></span>
        </div>

        <div class="console-orbits" aria-hidden="true">
          <i></i><i></i><i></i><b>✦</b>
        </div>

        <div class="floating-panel panel-a">
          <small>SCENE</small>
          <strong>Launch sequence</strong>
          <span><i></i> Running</span>
        </div>
        <div class="floating-panel panel-b">
          <small>RENDER</small>
          <strong>60 FPS</strong>
          <span><i></i> WebGPU live</span>
        </div>
        <div class="floating-panel panel-c">
          <small>STATE</small>
          <strong>Reactive</strong>
          <span><i></i> Zustand sync</span>
        </div>
      </div>
    </section>

    <section id="stack" class="stack-section section-shell reveal">
      <div class="stack-intro">
        <p class="eyebrow">Built with a modern stack</p>
        <h2>Fast by<br /><em>architecture.</em></h2>
        <p>
          A reactive Vue interface, lightweight shared state, and native GPU rendering keep Cieav fluid from first input to final frame.
        </p>
      </div>

      <div class="stack-grid">
        <article v-for="item in stack" :key="item.name" class="stack-card tilt-card">
          <div class="stack-mark">{{ item.mark }}</div>
          <div class="stack-copy">
            <strong>{{ item.name }}</strong>
            <small>{{ item.label }}</small>
          </div>
          <span class="stack-index">{{ item.index }}</span>
        </article>
      </div>
    </section>

    <section id="about" class="manifesto section-shell reveal">
      <div class="manifesto-index">04 / MANIFESTO</div>
      <p class="eyebrow">Cieav AI</p>
      <h2>Interfaces should not just respond.<br /><em>They should feel alive.</em></h2>
      <div class="manifesto-copy">
        <p>
          We are building an AI-native animation system for teams that want product launches to feel authored, cinematic, and deeply interactive — without trading away speed or control.
        </p>
        <a href="#contact" class="text-link">Build with Cieav <span>↗</span></a>
      </div>
    </section>

    <section class="metrics section-shell reveal" aria-label="Launch metrics">
      <div><span>01</span><strong>10×</strong><small>Faster prototyping</small></div>
      <div><span>02</span><strong>92%</strong><small>Faster iteration</small></div>
      <div><span>03</span><strong>25K+</strong><small>Waitlist target</small></div>
      <div><span>04</span><strong>SOON</strong><small>Private launch</small></div>
    </section>

    <footer id="contact" class="footer section-shell reveal">
      <div class="footer-art" aria-hidden="true">
        <span class="footer-orbit orbit-one"></span>
        <span class="footer-orbit orbit-two"></span>
        <span class="footer-orbit orbit-three"></span>
        <i>✦</i>
      </div>

      <div class="footer-main">
        <div>
          <p class="eyebrow">Ready when you are</p>
          <h2>Turn vision<br /><em>into motion.</em></h2>
        </div>
        <a class="button button-light button-large magnetic" href="mailto:hello@cieav.ai">Join the launch <span>→</span></a>
      </div>

      <div class="footer-bottom">
        <span>© 2026 Cieav AI</span>
        <span>Vue 3 / Zustand / WebGPU</span>
        <span>Built for motion-native products.</span>
      </div>
    </footer>
  </main>
</template>

<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import WebGPUField from './components/WebGPUField.vue'
import { appStore } from './store'

const features = [
  {
    id: 1,
    icon: '◌',
    title: 'Motion Engine',
    copy: 'Generate cinematic interaction systems that react to content, pointer movement, scroll, and state.',
  },
  {
    id: 2,
    icon: '✦',
    title: 'Launch Faster',
    copy: 'Move from static concepts to expressive product stories without rebuilding every animation by hand.',
  },
  {
    id: 3,
    icon: '⌁',
    title: 'Realtime Visuals',
    copy: 'Use GPU-rendered particles, fields, and procedural scenes that stay smooth and responsive.',
  },
  {
    id: 4,
    icon: '◎',
    title: 'Stay Aligned',
    copy: 'Keep narrative, interaction, and visual direction inside one coherent product experience.',
  },
]

const stack = [
  { index: '01', mark: 'V', name: 'Vue 3', label: 'Reactive interface layer' },
  { index: '02', mark: 'Z', name: 'Zustand', label: 'Lightweight shared state' },
  { index: '03', mark: 'W', name: 'WebGPU', label: 'Realtime GPU rendering' },
  { index: '04', mark: 'V', name: 'Vite', label: 'Instant development loop' },
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
      el.style.transform = `perspective(900px) rotateX(${py * -3}deg) rotateY(${px * 4}deg) translateY(-3px)`
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
  }, { threshold: 0.1 })

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
