<template>
  <aside class="scene-os" :class="{ 'is-open': paletteOpen, 'is-focus': focusMode }" aria-label="Cieav Scene OS">
    <div class="scene-orbit" aria-hidden="true">
      <span class="orbit orbit-a"></span>
      <span class="orbit orbit-b"></span>
      <span class="orbit orbit-c"></span>
    </div>

    <div class="scene-status" aria-live="polite">
      <span class="status-pulse"></span>
      <span class="status-index">{{ activeIndex }}</span>
      <span class="status-divider"></span>
      <span class="status-name">{{ activeScene.label }}</span>
    </div>

    <nav class="scene-rail" aria-label="Scene navigation">
      <button
        v-for="(scene, index) in scenes"
        :key="scene.id"
        class="scene-node"
        :class="{ active: scene.id === activeScene.id }"
        type="button"
        :aria-label="`Go to ${scene.label}`"
        @click="goTo(scene.id)"
      >
        <span class="node-index">0{{ index + 1 }}</span>
        <span class="node-dot"></span>
        <span class="node-label">{{ scene.label }}</span>
      </button>
    </nav>

    <div class="scene-dock" role="toolbar" aria-label="Scene controls">
      <button class="dock-brand" type="button" @click="goTo('top')" aria-label="Return to hero">
        <span>✦</span>
      </button>
      <button class="dock-action" type="button" @click="paletteOpen = !paletteOpen" :aria-expanded="paletteOpen">
        <span class="dock-key">⌘K</span>
        <span>Command</span>
      </button>
      <button class="dock-action" type="button" @click="toggleFocus" :aria-pressed="focusMode">
        <span class="dock-icon">◐</span>
        <span>{{ focusMode ? 'Exit focus' : 'Focus' }}</span>
      </button>
      <span class="dock-progress" aria-hidden="true"><i :style="{ transform: `scaleX(${scrollProgress})` }"></i></span>
    </div>

    <div v-if="paletteOpen" class="command-surface" role="dialog" aria-modal="false" aria-label="Cieav command palette">
      <div class="command-head">
        <span>Scene command</span>
        <kbd>ESC</kbd>
      </div>
      <input ref="commandInput" v-model="query" class="command-input" type="text" placeholder="Jump to a scene…" @keydown.down.prevent="moveSelection(1)" @keydown.up.prevent="moveSelection(-1)" @keydown.enter.prevent="runSelected" />
      <div class="command-list">
        <button
          v-for="(scene, index) in filteredScenes"
          :key="scene.id"
          type="button"
          :class="{ selected: index === selectedIndex }"
          @mouseenter="selectedIndex = index"
          @click="selectScene(scene.id)"
        >
          <span class="command-glyph">{{ scene.glyph }}</span>
          <span><strong>{{ scene.label }}</strong><small>{{ scene.hint }}</small></span>
          <span class="command-arrow">↗</span>
        </button>
      </div>
    </div>

    <div class="cursor-lens" aria-hidden="true"></div>
  </aside>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const scenes = [
  { id: 'top', label: 'Origin', hint: 'Hero / product thesis', glyph: '✦' },
  { id: 'features', label: 'Capabilities', hint: 'Motion primitives', glyph: '◌' },
  { id: 'product', label: 'Sequence', hint: 'Product story', glyph: '⌁' },
  { id: 'stack', label: 'System', hint: 'Technology architecture', glyph: '◎' },
  { id: 'about', label: 'Manifesto', hint: 'Why Cieav exists', glyph: '◐' },
  { id: 'contact', label: 'Launch', hint: 'Join the release', glyph: '↗' },
]

const activeId = ref('top')
const paletteOpen = ref(false)
const focusMode = ref(false)
const query = ref('')
const selectedIndex = ref(0)
const commandInput = ref(null)
const scrollProgress = ref(0)

const activeScene = computed(() => scenes.find((scene) => scene.id === activeId.value) || scenes[0])
const activeIndex = computed(() => String(scenes.findIndex((scene) => scene.id === activeId.value) + 1).padStart(2, '0'))
const filteredScenes = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return scenes
  return scenes.filter((scene) => `${scene.label} ${scene.hint}`.toLowerCase().includes(q))
})

function goTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function selectScene(id) {
  goTo(id)
  paletteOpen.value = false
}

function moveSelection(direction) {
  const length = filteredScenes.value.length
  if (!length) return
  selectedIndex.value = (selectedIndex.value + direction + length) % length
}

function runSelected() {
  const scene = filteredScenes.value[selectedIndex.value]
  if (scene) selectScene(scene.id)
}

function toggleFocus() {
  focusMode.value = !focusMode.value
  document.documentElement.classList.toggle('cieav-focus-mode', focusMode.value)
}

function handleKey(event) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    paletteOpen.value = !paletteOpen.value
  }
  if (event.key === 'Escape') paletteOpen.value = false
  if (event.key.toLowerCase() === 'f' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) toggleFocus()
}

function updateScroll() {
  const max = Math.max(1, document.documentElement.scrollHeight - innerHeight)
  scrollProgress.value = Math.min(1, Math.max(0, scrollY / max))
}

function updatePointer(event) {
  document.documentElement.style.setProperty('--scene-x', `${event.clientX}px`)
  document.documentElement.style.setProperty('--scene-y', `${event.clientY}px`)
}

let observer
onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
    if (visible?.target?.id) activeId.value = visible.target.id
  }, { rootMargin: '-24% 0px -52% 0px', threshold: [0, .15, .35, .6] })

  scenes.forEach((scene) => {
    const element = document.getElementById(scene.id)
    if (element) observer.observe(element)
  })

  addEventListener('keydown', handleKey)
  addEventListener('scroll', updateScroll, { passive: true })
  addEventListener('pointermove', updatePointer, { passive: true })
  updateScroll()
})

watch(paletteOpen, async (open) => {
  selectedIndex.value = 0
  query.value = ''
  if (open) {
    await nextTick()
    commandInput.value?.focus()
  }
})

watch(filteredScenes, () => { selectedIndex.value = 0 })

onBeforeUnmount(() => {
  observer?.disconnect()
  removeEventListener('keydown', handleKey)
  removeEventListener('scroll', updateScroll)
  removeEventListener('pointermove', updatePointer)
  document.documentElement.classList.remove('cieav-focus-mode')
})
</script>
