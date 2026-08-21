<template>
  <div class="gpu-wrap" ref="wrap">
    <canvas ref="canvas" class="gpu-canvas" aria-hidden="true"></canvas>
    <div class="moon" aria-hidden="true"></div>
    <div class="figure" aria-hidden="true"><span></span></div>
    <div class="gpu-badge">{{ modeLabel }}</div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { appStore, useAppStore } from '../store'

const canvas = ref(null)
const wrap = ref(null)
const webgpu = useAppStore((s) => s.webgpu)
const modeLabel = computed(() => webgpu.value ? 'WEBGPU LIVE' : 'CANVAS FALLBACK')

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
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#050505'
    ctx.fillRect(0, 0, w, h)

    const state = appStore.getState()
    const px = (state.pointer.x - 0.5) * 30 * dpr
    const py = (state.pointer.y - 0.5) * 18 * dpr
    const cx = w * 0.63 + px
    const cy = h * 0.56 + py
    const maxR = Math.min(w, h) * 0.68

    ctx.lineWidth = Math.max(1, dpr * 0.55)
    ctx.strokeStyle = 'rgba(245,245,240,.72)'
    for (let i = 0; i < 54; i++) {
      const phase = (t * 0.00012 + i * 0.071) % 1
      const r = 18 * dpr + phase * maxR
      ctx.globalAlpha = 0.16 + (1 - phase) * 0.48
      ctx.beginPath()
      ctx.ellipse(cx, cy, r * 1.6, r * 0.44, 0, 0, Math.PI * 2)
      ctx.stroke()
    }

    ctx.globalAlpha = 0.5
    const burstX = w * 0.76
    const burstY = h * 0.29
    for (let i = 0; i < 170; i++) {
      const a = i * 2.3999632297 + t * 0.00003
      const len = (20 + (i % 29) * 8) * dpr
      const pulse = 0.75 + 0.25 * Math.sin(t * 0.0018 + i)
      ctx.beginPath()
      ctx.moveTo(burstX, burstY)
      ctx.lineTo(burstX + Math.cos(a) * len * pulse, burstY + Math.sin(a) * len * pulse)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
    raf = requestAnimationFrame(render)
  }
  raf = requestAnimationFrame(render)
}

async function startWebGPU() {
  if (!navigator.gpu) return false
  const adapter = await navigator.gpu.requestAdapter()
  if (!adapter) return false
  const device = await adapter.requestDevice()
  const c = canvas.value
  const context = c.getContext('webgpu')
  if (!context) return false

  appStore.getState().setWebgpu(true)
  const format = navigator.gpu.getPreferredCanvasFormat()
  context.configure({ device, format, alphaMode: 'opaque' })

  const shader = device.createShaderModule({ code: `
struct Uniforms { resolution: vec2f, time: f32, pointerX: f32, pointerY: f32, scroll: f32, pad: vec2f }
@group(0) @binding(0) var<uniform> u: Uniforms;

@vertex fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {
  var p = array<vec2f, 3>(vec2f(-1., -1.), vec2f(3., -1.), vec2f(-1., 3.));
  return vec4f(p[i], 0., 1.);
}

fn hash(p: vec2f) -> f32 {
  let h = dot(p, vec2f(127.1, 311.7));
  return fract(sin(h) * 43758.5453);
}

@fragment fn fs(@builtin(position) pos: vec4f) -> @location(0) vec4f {
  let uv0 = pos.xy / u.resolution;
  var uv = uv0 * 2. - 1.;
  uv.x *= u.resolution.x / u.resolution.y;
  uv.x += (u.pointerX - .5) * .08;
  uv.y += (u.pointerY - .5) * .05;

  let center = vec2f(.34, -.13);
  let q = uv - center;
  let rr = length(vec2f(q.x * .63, q.y * 1.7));
  let rings = pow(max(0., .5 + .5 * cos(rr * 122. - u.time * 1.7)), 16.);
  let ringFade = smoothstep(1.05, .05, rr) * smoothstep(.0, .12, rr);

  let burstCenter = vec2f(.72, .48);
  let b = uv - burstCenter;
  let a = atan2(b.y, b.x);
  let br = length(b);
  let rays = pow(abs(sin(a * 38. + sin(a * 7.) * 2. + u.time * .15)), 20.);
  let burst = rays * smoothstep(.9, .05, br) * .65;

  let grain = step(.965, hash(floor(pos.xy * .66) + floor(u.time * 2.)));
  let stars = grain * smoothstep(.08, .72, uv.y + .58) * .7;

  let horizon = smoothstep(-.22, -.08, uv.y) * (1. - smoothstep(-.08, .04, uv.y));
  let ink = clamp(rings * ringFade + burst + stars + horizon * .15, 0., 1.);
  let paper = vec3f(.95, .94, .90);
  let bg = vec3f(.018, .018, .018);
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
        clearValue: { r: .018, g: .018, b: .018, a: 1 },
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
