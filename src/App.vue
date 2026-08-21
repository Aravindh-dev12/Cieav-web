<template>
  <main class="site" @pointermove="trackPointer">
    <div class="cursor-halo" aria-hidden="true"></div>

    <header class="site-header">
      <a class="brand" href="#top" aria-label="Cieav AI home">
        <span class="brand-mark" aria-hidden="true">✦</span>
        <span>Cieav AI</span>
      </a>

      <nav class="desktop-nav" aria-label="Primary navigation">
        <a href="#about">About</a>
        <a href="#product">Product</a>
        <a href="#features">Features</a>
        <a href="#stack">Stack</a>
        <a href="#contact">Contact</a>
      </nav>

      <div class="header-actions">
        <a class="login" href="#contact">Login</a>
        <a class="button button-cream magnetic" href="#contact">Join Waitlist <span>→</span></a>
      </div>
    </header>

    <section id="top" class="hero section-shell">
      <div class="hero-copy">
        <p class="eyebrow hero-reveal delay-1">Launching a new era of intelligent motion</p>
        <h1 class="hero-reveal delay-2">The AI That<br />Turns Vision<br />Into Motion</h1>
        <p class="hero-lede hero-reveal delay-3">
          Cieav AI transforms your ideas into intelligent, beautifully animated products — powered by WebGPU and built for the motion generation era.
        </p>

        <div class="hero-actions hero-reveal delay-4">
          <a class="button button-cream magnetic" href="#contact">Join Waitlist <span>→</span></a>
          <button class="watch-button magnetic" type="button" @click="scrollToProduct">
            <span class="play">▶</span>
            <span>Watch Trailer</span>
          </button>
        </div>

        <div class="hero-stack hero-reveal delay-5" aria-label="Technology stack">
          <span>Vue 3</span><i></i><span>Zustand</span><i></i><span>WebGPU</span>
        </div>
      </div>

      <div class="hero-art hero-reveal delay-2" aria-label="Animated concentric motion field">
        <WebGPUField />
      </div>
    </section>

    <section id="features" class="feature-strip section-shell reveal" aria-label="Product capabilities">
      <article v-for="feature in features" :key="feature.title" class="feature-item">
        <div class="feature-glyph" aria-hidden="true">{{ feature.icon }}</div>
        <div>
          <h2>{{ feature.title }}</h2>
          <p>{{ feature.copy }}</p>
        </div>
      </article>
    </section>

    <section id="product" class="story-panel lamp-panel section-shell reveal">
      <div class="story-copy">
        <p class="eyebrow">Adaptive motion intelligence</p>
        <h2>Motion That<br />Feels Alive</h2>
        <p>
          Cieav AI doesn’t just animate. It interprets, adapts, and brings ideas to life with emotion, rhythm, and flow.
        </p>
        <a class="text-link magnetic" href="#stack">Explore Features <span>→</span></a>
      </div>

      <div class="lamp-scene" aria-hidden="true">
        <div class="lamp-moon"></div>
        <div class="lamp-energy energy-a"></div>
        <div class="lamp-energy energy-b"></div>
        <div class="lamp-energy energy-c"></div>
        <div class="lamp-rays"></div>
        <div class="street-lamp">
          <span class="lamp-cap"></span>
          <span class="lamp-light"></span>
          <span class="lamp-stem"></span>
          <span class="lamp-base"></span>
        </div>
      </div>
    </section>

    <section id="about" class="story-panel city-panel section-shell reveal">
      <div class="city-scene" aria-hidden="true">
        <div class="city-star">✦</div>
        <div class="building building-a"></div>
        <div class="building building-b"></div>
        <div class="building building-c"></div>
        <div class="building building-d"></div>
        <div class="city-path"></div>
        <div class="city-person"><span></span></div>
      </div>

      <div class="story-copy city-copy">
        <p class="eyebrow">Made for ambitious teams</p>
        <h2>Built for Visionaries,<br />Designed for Impact</h2>
        <p>
          Create stunning animated products, faster. Cieav AI is the motion engine for a new generation of builders, designers, and dreamers.
        </p>
        <a class="text-link magnetic" href="#stack">See the Product <span>→</span></a>
      </div>
    </section>

    <section id="stack" class="stack-section section-shell reveal">
      <div class="stack-heading">
        <p class="eyebrow">Modern by architecture</p>
        <h2>Built for the realtime web.</h2>
      </div>

      <div class="stack-grid">
        <article v-for="item in stack" :key="item.name" class="stack-card">
          <span class="stack-mark">{{ item.mark }}</span>
          <div>
            <strong>{{ item.name }}</strong>
            <small>{{ item.label }}</small>
          </div>
        </article>
      </div>
    </section>

    <section class="launch-band section-shell reveal">
      <div>
        <p class="eyebrow">Private preview</p>
        <h2>Bring your next idea<br />to life in motion.</h2>
      </div>
      <a class="button button-cream button-large magnetic" href="#contact">Request Access <span>→</span></a>
    </section>

    <footer id="contact" class="footer section-shell">
      <a class="brand footer-brand" href="#top"><span class="brand-mark">✦</span><span>Cieav AI</span></a>
      <p>AI-native motion for product teams.</p>
      <div class="footer-links">
        <a href="#product">Product</a>
        <a href="#stack">Technology</a>
        <a href="mailto:hello@cieav.ai">hello@cieav.ai</a>
      </div>
      <span>© 2026 Cieav AI</span>
    </footer>
  </main>
</template>

<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import WebGPUField from './components/WebGPUField.vue'
import { appStore } from './store'

const features = [
  {
    icon: '✦',
    title: 'Intelligent Animation',
    copy: 'AI-powered motion design that understands intent and context.',
  },
  {
    icon: '◇',
    title: 'Built for the Web',
    copy: 'Realtime generation with WebGPU for cinematic, interactive experiences.',
  },
  {
    icon: '◎',
    title: 'Limitless Possibilities',
    copy: 'From product demos to immersive stories — your imagination, animated.',
  },
]

const stack = [
  { mark: 'V', name: 'Vue 3', label: 'Reactive interface layer' },
  { mark: 'Z', name: 'Zustand', label: 'Shared interaction state' },
  { mark: 'W', name: 'WebGPU', label: 'Realtime GPU rendering' },
  { mark: 'V', name: 'Vite', label: 'Fast development pipeline' },
]

function trackPointer(event) {
  const x = event.clientX / window.innerWidth
  const y = event.clientY / window.innerHeight
  appStore.getState().setPointer(x, y)
  document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`)
  document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`)
}

function scrollToProduct() {
  document.querySelector('#product')?.scrollIntoView({ behavior: 'smooth' })
}

function bindMagnetic() {
  const cleanups = []
  document.querySelectorAll('.magnetic').forEach((element) => {
    const move = (event) => {
      const rect = element.getBoundingClientRect()
      const x = event.clientX - rect.left - rect.width / 2
      const y = event.clientY - rect.top - rect.height / 2
      element.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`
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
  }, { threshold: 0.12 })

  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element))
  unbindMagnetic = bindMagnetic()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  unbindMagnetic?.()
})
</script>
