<template>
  <div class="gpu-wrap" ref="wrap">
    <canvas ref="canvas" class="gpu-canvas" aria-hidden="true"></canvas>

    <div class="motion-grid" aria-hidden="true"></div>
    <div class="orbit orbit-a" aria-hidden="true"><i></i></div>
    <div class="orbit orbit-b" aria-hidden="true"><i></i></div>
    <div class="orbit orbit-c" aria-hidden="true"><i></i></div>

    <div class="moon" aria-hidden="true"></div>

    <div class="lamp" aria-hidden="true">
      <div class="lamp-glow"></div>
      <div class="lamp-head">✦</div>
      <div class="lamp-post"></div>
    </div>

    <div class="figure" aria-hidden="true"><span></span></div>

    <div class="hud hud-a">
      <small>MOTION FIELD</small>
      <strong>{{ modeLabel }}</strong>
      <span><b></b> realtime</span>
    </div>
    <div class="hud hud-b">
      <small>INTERACTION</small>
      <strong>Pointer reactive</strong>
      <span>scroll + cursor</span>
    </div>

    <div class="gpu-badge">{{ modeLabel }}</div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { appStore, useAppStore } from '../store'

const canvas = ref(null)
const wrap = ref(null)
const webgpu = useAppStore((s) => s.webgpu)
const modeLabel = computed(() => webgpu.value ? 'WEBGPU LIVE' : 'CANVAS LIVE')

let raf = 0
let resizeObserver
let stop = false

function sizeCanvas() {
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

function startCanvasFallback() {
  appStore.getState().setWebgpu(false)
  const c = canvas.value
  const ctx = c.getContext('2d')

  const render = (t) => {
    if (stop) return
    const { width: w, height: h } = c
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const state = appStore.getState()
    const pointerX = (state.pointer.x - 0.5) * 55 * dpr
    const pointerY = (state.pointer.y - 0.5) * 35 * dpr

    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#050505'
    ctx.fillRect(0, 0, w, h)

    const cx = w * 0.61 + pointerX
    const cy = h * 0.60 + pointerY
    const maxR = Math.min(w, h) * 0.82

    ctx.lineWidth = Math.max(1, dpr * 0.55)
    for (let i = 0; i < 68; i++) {
      const phase = (t * 0.000105 + i * 0.052) % 1
      const wobble = Math.sin(t * 0.001 + i * 0.7) * 4 * dpr
      const r = 12 * dpr + phase * maxR + wobble
      ctx.globalAlpha = 0.06 + (1 - phase) * 0.62
      ctx.strokeStyle = i % 3 === 0 ? 'rgba(255,255,255,.92)' : 'rgba(238,236,228,.66)'
      ctx.beginPath()
      ctx.ellipse(cx, cy, r * 1.72, r * 0.42, Math.sin(t * 0.00015) * 0.018, 0, Math.PI * 2)
      ctx.stroke()
    }

    const burstX = w * 0.77 + pointerX * 0.35
    const burstY = h * 0.31 + pointerY * 0.28
    ctx.strokeStyle = 'rgba(248,247,241,.78)'
    for (let i = 0; i < 220; i++) {
      const a = i * 2.3999632297 + t * 0.00007
      const base = 18 + (i % 37) * 7
      const pulse = 0.68 + 0.32 * Math.sin(t * 0.002 + i * 0.39)
      const len = base * pulse * dpr
      ctx.globalAlpha = 0.08 + (i % 11) / 18
      ctx.beginPath()
      ctx.moveTo(burstX, burstY)
      ctx.lineTo(burstX + Math.cos(a) * len, burstY + Math.sin(a) * len)
      ctx.stroke()
    }

    for (let i = 0; i < 95; i++) {
      const seed = i * 91.127
      const x = ((Math.sin(seed) * 0.5 + 0.5) * w + t * (0.004 + (i % 4) * 0.0015)) % w
      const y = (Math.sin(seed * 1.7) * 0.5 + 0.5) * h * 0.68
      const twinkle = 0.15 + 0.7 * Math.abs(Math.sin(t * 0.0014 + i))
      ctx.globalAlpha = twinkle
      ctx.fillStyle = '#f3f1e9'
      ctx.fillRect(x, y, (i % 3 === 0 ? 1.6 : 0.8) * dpr, (i % 3 === 0 ? 1.6 : 0.8) * dpr)
    }

    ctx.globalAlpha = 1
    raf = requestAnimationFrame(render)
  }

  raf = requestAnimationFrame(render)
}

async function startWebGPU() {
  if (!navigator.gpu) return false
  const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' })
  if (!adapter) return false
  const device = await adapter.requestDevice()
  const c = canvas.value
  const context = c.getContext('webgpu')
  if (!context) return false

  appStore.getState().setWebgpu(true)
  const format = navigator.gpu.getPreferredCanvasFormat()
  context.configure({ device, format, alphaMode: 'opaque' })

  const shader = device.createShaderModule({ code: `
struct Uniforms {
  resolution: vec2f,
  time: f32,
  pointerX: f32,
  pointerY: f32,
  scroll: f32,
  pad: vec2f
}
@group(0) @binding(0) var<uniform> u: Uniforms;

@vertex fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {
  var p = array<vec2f, 3>(vec2f(-1., -1.), vec2f(3., -1.), vec2f(-1., 3.));
  return vec4f(p[i], 0., 1.);
}

fn hash(p: vec2f) -> f32 {
  let h = dot(p, vec2f(127.1, 311.7));
  return fract(sin(h) * 43758.5453);
}

fn noise(p: vec2f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let a = hash(i);
  let b = hash(i + vec2f(1., 0.));
  let c = hash(i + vec2f(0., 1.));
  let d = hash(i + vec2f(1., 1.));
  let q = f * f * (3. - 2. * f);
  return mix(a, b, q.x) + (c-a) * q.y * (1.-q.x) + (d-b) * q.x * q.y;
}

@fragment fn fs(@builtin(position) pos: vec4f) -> @location(0) vec4f {
  let uv0 = pos.xy / u.resolution;
  var uv = uv0 * 2. - 1.;
  uv.x *= u.resolution.x / u.resolution.y;

  let px = (u.pointerX - .5);
  let py = (u.pointerY - .5);
  uv.x += px * .12;
  uv.y += py * .075;

  let center = vec2f(.28, -.18 + u.scroll * .08);
  let q = uv - center;
  let warped = q + vec2f(
    sin(q.y * 5. + u.time * .45) * .012,
    cos(q.x * 4. - u.time * .38) * .009
  );
  let rr = length(vec2f(warped.x * .61, warped.y * 1.72));
  let ringPhase = rr * 132. - u.time * 2.1;
  let rings = pow(max(0., .5 + .5 * cos(ringPhase)), 18.);
  let ringFade = smoothstep(1.16, .04, rr) * smoothstep(.0, .10, rr);
  let fineRings = pow(max(0., .5 + .5 * cos(rr * 245. + u.time * 1.1)), 26.) * .24;

  let burstCenter = vec2f(.74 + px * .08, .46 - py * .04);
  let b = uv - burstCenter;
  let a = atan2(b.y, b.x);
  let br = length(b);
  let rayWave = sin(a * 46. + sin(a * 9.) * 2.6 + u.time * .42);
  let rays = pow(abs(rayWave), 24.);
  let burst = rays * smoothstep(.95, .025, br) * (.48 + .2 * sin(u.time * 1.8));
  let core = smoothstep(.085, .0, br) * (.55 + .45 * sin(u.time * 3.1));

  let flow = noise(uv * 6. + vec2f(u.time * .12, -u.time * .06));
  let dust = step(.955 - flow * .018, hash(floor(pos.xy * .58) + floor(u.time * 2.)));
  let stars = dust * smoothstep(-.20, .75, uv.y + .55) * (.35 + .5 * flow);

  let sweep = smoothstep(.016, .0, abs(fract((uv.x + uv.y * .25 + u.time * .13) * .55) - .5)) * .06;
  let vignette = smoothstep(1.4, .3, length(uv * vec2f(.72, .92)));

  let ink = clamp((rings + fineRings) * ringFade + burst + core + stars + sweep, 0., 1.) * vignette;
  let paper = vec3f(.96, .95, .91);
  let bg = vec3f(.015, .015, .015);
  let col = mix(bg, paper, ink);
  return vec4f(col, 1.);
}` })

  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: { module: shader, entryPoint: 'vs' },
    fragment: { module: shader, entryPoint: 'fs', targets: [{ format }] },
    primitive: { topology: 'triangle-list' },
  })

  const uniformBuffer = device.createBuffer({
    size: 32,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
  })

  const render = (ms) => {
    if (stop) return
    const state = appStore.getState()
    const data = new Float32Array([
      c.width, c.height,
      ms / 1000,
      state.pointer.x,
      state.pointer.y,
      state.scroll,
      0, 0,
    ])

    device.queue.writeBuffer(uniformBuffer, 0, data)
    const encoder = device.createCommandEncoder()
    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: context.getCurrentTexture().createView(),
        clearValue: { r: .015, g: .015, b: .015, a: 1 },
        loadOp: 'clear',
        storeOp: 'store',
      }],
    })
    pass.setPipeline(pipeline)
    pass.setBindGroup(0, bindGroup)
    pass.draw(3)
    pass.end()
    device.queue.submit([encoder.finish()])
    raf = requestAnimationFrame(render)
  }

  raf = requestAnimationFrame(render)
  return true
}

onMounted(async () => {
  sizeCanvas()
  resizeObserver = new ResizeObserver(sizeCanvas)
  resizeObserver.observe(wrap.value)

  try {
    const ok = await startWebGPU()
    if (!ok) startCanvasFallback()
  } catch (error) {
    console.warn('WebGPU unavailable, using canvas fallback.', error)
    startCanvasFallback()
  }
})

onBeforeUnmount(() => {
  stop = true
  cancelAnimationFrame(raf)
  resizeObserver?.disconnect()
})
</script>

<style scoped>
.motion-grid {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  opacity: .16;
  background-image:
    linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: linear-gradient(to bottom, transparent 4%, #000 28%, #000 78%, transparent 100%);
  animation: gridDrift 18s linear infinite;
}

@keyframes gridDrift {
  to { background-position: 72px 72px; }
}

.orbit {
  position: absolute;
  z-index: 3;
  left: 62%;
  top: 60%;
  border: 1px solid rgba(255,255,255,.18);
  border-radius: 50%;
  transform: translate(-50%, -50%) rotateX(68deg);
  pointer-events: none;
}
.orbit i {
  position: absolute;
  left: 50%;
  top: -3px;
  width: 6px;
  height: 6px;
  margin-left: -3px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 16px rgba(255,255,255,.9);
}
.orbit-a { width: 240px; height: 240px; animation: orbitSpin 9s linear infinite; }
.orbit-b { width: 390px; height: 390px; opacity: .66; animation: orbitSpinReverse 14s linear infinite; }
.orbit-c { width: 560px; height: 560px; opacity: .34; animation: orbitSpin 21s linear infinite; }

@keyframes orbitSpin {
  from { transform: translate(-50%, -50%) rotateX(68deg) rotateZ(0); }
  to { transform: translate(-50%, -50%) rotateX(68deg) rotateZ(360deg); }
}
@keyframes orbitSpinReverse {
  from { transform: translate(-50%, -50%) rotateX(68deg) rotateZ(360deg); }
  to { transform: translate(-50%, -50%) rotateX(68deg) rotateZ(0); }
}

.lamp {
  position: absolute;
  z-index: 5;
  left: 76.5%;
  top: 30.5%;
  width: 46px;
  height: 170px;
  transform: translate(-50%, -50%);
  pointer-events: none;
  animation: lampFloat 5s ease-in-out infinite;
}
.lamp-head {
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  width: 32px;
  height: 38px;
  display: grid;
  place-items: center;
  color: #050505;
  background: #f2f0e9;
  clip-path: polygon(50% 0, 92% 23%, 79% 100%, 21% 100%, 8% 23%);
  font-size: 13px;
}
.lamp-head::before,
.lamp-head::after {
  content: '';
  position: absolute;
  background: #050505;
}
.lamp-head::before { width: 1px; height: 31px; }
.lamp-head::after { width: 22px; height: 1px; }
.lamp-post {
  position: absolute;
  left: 50%;
  top: 35px;
  width: 3px;
  height: 128px;
  transform: translateX(-50%);
  background: linear-gradient(#f2f0e9, #85847f);
}
.lamp-post::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -4px;
  width: 30px;
  height: 3px;
  transform: translateX(-50%);
  background: #aaa9a3;
}
.lamp-glow {
  position: absolute;
  left: 50%;
  top: 15px;
  width: 260px;
  height: 260px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,.16);
  box-shadow:
    0 0 35px rgba(255,255,255,.18),
    inset 0 0 45px rgba(255,255,255,.08);
  animation: glowPulse 2.7s ease-in-out infinite;
}
@keyframes lampFloat { 50% { transform: translate(-50%, -52%); } }
@keyframes glowPulse {
  50% { transform: translate(-50%, -50%) scale(1.18); opacity: .45; }
}

.hud {
  position: absolute;
  z-index: 8;
  width: 166px;
  padding: 12px 14px;
  border: 1px solid rgba(255,255,255,.16);
  border-radius: 12px;
  background: rgba(4,4,4,.58);
  backdrop-filter: blur(12px);
  display: grid;
  gap: 5px;
  pointer-events: none;
  animation: hudFloat 6s ease-in-out infinite;
}
.hud small { font-size: 8px; letter-spacing: .18em; color: #777; }
.hud strong { font-size: 11px; font-weight: 500; }
.hud span { font-size: 9px; color: #8f8e89; display: flex; gap: 7px; align-items: center; }
.hud b { width: 5px; height: 5px; border-radius: 50%; background: #f2f0e9; box-shadow: 0 0 8px #fff; animation: blink 1.2s ease-in-out infinite; }
.hud-a { left: 9%; top: 24%; }
.hud-b { right: 7%; bottom: 19%; animation-delay: -2.5s; }
@keyframes hudFloat { 50% { transform: translateY(-10px); } }
@keyframes blink { 50% { opacity: .2; } }

@media (max-width: 900px) {
  .hud { display: none; }
  .lamp { left: 73%; top: 31%; transform: translate(-50%, -50%) scale(.82); }
  .orbit-a { width: 190px; height: 190px; }
  .orbit-b { width: 300px; height: 300px; }
  .orbit-c { width: 430px; height: 430px; }
}

@media (prefers-reduced-motion: reduce) {
  .motion-grid,
  .orbit,
  .lamp,
  .lamp-glow,
  .hud,
  .hud b { animation: none !important; }
}
</style>
