<template>
  <div class="gpu-wrap" ref="wrap">
    <canvas ref="canvas" class="gpu-canvas" aria-hidden="true"></canvas>
    <div class="moon" aria-hidden="true"></div>
    <div class="figure" aria-hidden="true"><span></span></div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { appStore } from '../store'

const canvas = ref(null)
const wrap = ref(null)
let raf = 0
let resizeObserver
let stopped = false

function resize() {
  const c = canvas.value
  const host = wrap.value
  if (!c || !host) return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const rect = host.getBoundingClientRect()
  c.width = Math.max(1, Math.floor(rect.width * dpr))
  c.height = Math.max(1, Math.floor(rect.height * dpr))
  c.style.width = `${rect.width}px`
  c.style.height = `${rect.height}px`
}

function drawFallback() {
  const c = canvas.value
  const ctx = c.getContext('2d')
  if (!ctx) return

  const render = (time) => {
    if (stopped) return
    const w = c.width
    const h = c.height
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const state = appStore.getState()
    const px = (state.pointer.x - 0.5) * 28 * dpr
    const py = (state.pointer.y - 0.5) * 18 * dpr

    ctx.fillStyle = '#123fba'
    ctx.fillRect(0, 0, w, h)

    const horizon = h * 0.56 + py
    const cx = w * 0.60 + px
    const max = Math.min(w, h) * 0.92

    const grad = ctx.createLinearGradient(0, horizon - 40 * dpr, 0, h)
    grad.addColorStop(0, 'rgba(240,223,185,0)')
    grad.addColorStop(.12, 'rgba(240,223,185,.95)')
    grad.addColorStop(1, 'rgba(240,223,185,1)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.moveTo(0, horizon)
    ctx.quadraticCurveTo(w * .52, horizon - 75 * dpr, w, horizon + 5 * dpr)
    ctx.lineTo(w, h)
    ctx.lineTo(0, h)
    ctx.closePath()
    ctx.fill()

    ctx.lineWidth = Math.max(1, dpr * .8)
    for (let i = 0; i < 72; i++) {
      const phase = (i / 72 + time * 0.000015) % 1
      const r = 12 * dpr + phase * max
      const wobble = Math.sin(i * 1.47 + time * .0007) * 3 * dpr
      ctx.globalAlpha = .14 + (1 - phase) * .62
      ctx.strokeStyle = '#123fba'
      ctx.beginPath()
      ctx.ellipse(cx, h * .63 + py, r * 1.9 + wobble, r * .36, 0, 0, Math.PI * 2)
      ctx.stroke()
    }

    for (let i = 0; i < 1100; i++) {
      const seed = i * 91.713
      const x = (Math.sin(seed) * .5 + .5) * w
      const y = horizon + (Math.sin(seed * 1.33) * .5 + .5) * (h - horizon)
      if (Math.abs(y - horizon) < 20 * dpr) continue
      ctx.globalAlpha = .08 + (i % 11) * .012
      ctx.fillStyle = '#123fba'
      ctx.fillRect(x, y, dpr * .8, dpr * .8)
    }

    for (let i = 0; i < 210; i++) {
      const seed = i * 73.17
      const x = (Math.sin(seed) * .5 + .5) * w
      const y = (Math.sin(seed * 1.9) * .5 + .5) * horizon * .72
      ctx.globalAlpha = .08 + .2 * Math.abs(Math.sin(time * .001 + i))
      ctx.fillStyle = '#f0dfb9'
      ctx.fillRect(x, y, dpr, dpr)
    }

    ctx.globalAlpha = 1
    raf = requestAnimationFrame(render)
  }

  raf = requestAnimationFrame(render)
}

onMounted(() => {
  resize()
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(wrap.value)
  drawFallback()
})

onBeforeUnmount(() => {
  stopped = true
  cancelAnimationFrame(raf)
  resizeObserver?.disconnect()
})
</script>

<style scoped>
.gpu-wrap { position: absolute; inset: 0; overflow: hidden; }
.gpu-canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.moon {
  position: absolute;
  z-index: 6;
  left: 46%;
  top: 14%;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  box-shadow: -11px 5px 0 0 #f0dfb9;
  transform: rotate(-22deg);
  animation: moonFloat 7s ease-in-out infinite;
}
.figure {
  position: absolute;
  z-index: 7;
  left: 60.3%;
  top: 62%;
  width: 18px;
  height: 68px;
  transform: translate(-50%, -50%);
}
.figure::before {
  content: '';
  position: absolute;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  left: 3.5px;
  top: 0;
  background: #050505;
}
.figure span {
  position: absolute;
  left: 2px;
  top: 10px;
  width: 14px;
  height: 54px;
  background: #050505;
  clip-path: polygon(28% 0,72% 0,100% 56%,75% 100%,56% 60%,44% 60%,25% 100%,0 56%);
}
@keyframes moonFloat {
  50% { transform: rotate(-18deg) translateY(-8px); }
}
@media (max-width: 700px) {
  .moon { left: 48%; top: 11%; width: 38px; height: 38px; box-shadow: -8px 4px 0 0 #f0dfb9; }
  .figure { left: 58%; top: 63%; transform: translate(-50%, -50%) scale(.8); }
}
@media (prefers-reduced-motion: reduce) {
  .moon { animation: none; }
}
</style>
