import * as THREE from 'three/webgpu'
import { gsap } from 'gsap'
import { createHumanModel, poseHuman } from './three/HumanModel.js'
import { createInteriorWorld, createOutdoorWorld, terrainHeightAt } from './three/WorldScenes.js'

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
const damp = (from, to, lambda, dt) => THREE.MathUtils.lerp(from, to, 1 - Math.exp(-lambda * dt))

export class WorldRuntime {
  constructor(host, callbacks = {}) {
    this.host = host
    this.callbacks = callbacks
    this.renderer = null
    this.scene = null
    this.camera = null
    this.outdoor = null
    this.interior = null
    this.character = null
    this.mode = 'outside'
    this.keys = new Set()
    this.velocity = 0
    this.direction = 1
    this.inspectionOpen = false
    this.rendererName = 'THREE / INITIALIZING'
    this.lastTime = performance.now()
    this.lastStateSignature = ''
    this.transitioning = false
    this.raycaster = new THREE.Raycaster()
    this.pointer = new THREE.Vector2()
    this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  }

  async init() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0xcdd8cf)
    this.scene.fog = new THREE.FogExp2(0xcdd8cf, 0.013)

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 180)
    this.camera.position.set(6, 4.2, 13.5)

    this.renderer = new THREE.WebGPURenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    this.renderer.setSize(this.host.clientWidth, this.host.clientHeight)
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.02
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    await this.renderer.init()
    this.renderer.shadowMap.enabled = true

    const backendIsWebGPU = Boolean(this.renderer.backend?.isWebGPUBackend)
    this.rendererName = backendIsWebGPU ? 'THREE / WEBGPU' : 'THREE / WEBGL2'
    this.renderer.domElement.className = 'cieav-world-canvas'
    this.host.appendChild(this.renderer.domElement)

    this.outdoor = createOutdoorWorld()
    this.interior = createInteriorWorld()
    this.scene.add(this.outdoor.group, this.interior.group)

    this.character = createHumanModel({
      name: 'cieav-traveler',
      jacket: 0x426a58,
      jacketDark: 0x2d4b3e,
      trousers: 0x303837,
      trousersDark: 0x242a29,
      skin: 0xca9975,
      hair: 0x201f1d,
      scale: 1.02,
    })
    this.character.position.set(5, terrainHeightAt(5), this.outdoor.pathZ)
    this.outdoor.group.add(this.character)

    this.outdoor.building.userData.doorPanel.userData.interactive = 'door'
    this.interior.terminal.traverse((object) => {
      if (object.isMesh) object.userData.interactive = 'console'
    })
    this.interior.exitPivot.traverse((object) => {
      if (object.isMesh) object.userData.interactive = 'exit'
    })

    this.bindInput()
    this.bindPointer()
    this.onResize = () => this.resize()
    window.addEventListener('resize', this.onResize)
    this.resize()
    this.lastTime = performance.now()
    this.renderer.setAnimationLoop(this.frame)
    this.emitState({ renderer: this.rendererName })
  }

  resize() {
    if (!this.renderer || !this.camera) return
    const width = Math.max(1, this.host.clientWidth)
    const height = Math.max(1, this.host.clientHeight)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height, false)
  }

  bindInput() {
    this.onKeyDown = (event) => {
      const key = event.key.toLowerCase()
      if (['arrowleft', 'arrowright', 'a', 'd', 'e', 'escape', 'shift'].includes(key)) event.preventDefault()
      if (key === 'e') {
        this.interact()
        return
      }
      if (key === 'escape' && this.inspectionOpen) {
        this.closeInspection()
        return
      }
      if (['arrowleft', 'arrowright', 'a', 'd', 'shift'].includes(key)) this.keys.add(key)
    }
    this.onKeyUp = (event) => this.keys.delete(event.key.toLowerCase())
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
  }

  bindPointer() {
    this.onPointerDown = (event) => {
      if (!this.renderer || this.transitioning || this.inspectionOpen) return
      const rect = this.renderer.domElement.getBoundingClientRect()
      this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      this.raycaster.setFromCamera(this.pointer, this.camera)
      const targets = []
      if (this.mode === 'outside') targets.push(this.outdoor.building.userData.doorPanel)
      if (this.mode === 'inside') {
        targets.push(...this.interior.terminal.children.filter((child) => child.isMesh))
        targets.push(...this.interior.exitPivot.children.filter((child) => child.isMesh))
      }
      const hit = this.raycaster.intersectObjects(targets, true)[0]
      if (!hit) return
      let object = hit.object
      while (object && !object.userData.interactive) object = object.parent
      const kind = object?.userData?.interactive || hit.object.userData.interactive
      if (kind === 'door' && Math.abs(this.character.position.x - this.outdoor.doorX) < 3.2) this.enterBuilding()
      if (kind === 'console' && Math.abs(this.character.position.x - this.interior.terminalX) < 2.3) this.openInspection()
      if (kind === 'exit' && Math.abs(this.character.position.x - this.interior.exitX) < 2.2) this.exitBuilding()
    }
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown)
  }

  startVirtualMove(direction, running = false) {
    this.keys.add(direction < 0 ? 'arrowleft' : 'arrowright')
    if (running) this.keys.add('shift')
  }

  stopVirtualMove(direction) {
    this.keys.delete(direction < 0 ? 'arrowleft' : 'arrowright')
    this.keys.delete('shift')
  }

  frame = (time) => {
    if (!this.renderer || !this.scene || !this.camera || !this.character) return
    const dt = Math.min(0.05, Math.max(0.001, (time - this.lastTime) / 1000))
    this.lastTime = time

    if (!this.transitioning && !this.inspectionOpen) this.updateMovement(dt)
    else poseHuman(this.character, dt, 0, false, this.direction)

    this.updateNPCs(dt)
    this.updateCamera(dt)
    this.renderer.render(this.scene, this.camera)
  }

  updateMovement(dt) {
    const left = this.keys.has('arrowleft') || this.keys.has('a')
    const right = this.keys.has('arrowright') || this.keys.has('d')
    const running = this.keys.has('shift')
    const input = left === right ? 0 : left ? -1 : 1
    if (input) this.direction = input

    const maxSpeed = running ? 5.6 : 3.25
    const target = input * maxSpeed
    this.velocity = damp(this.velocity, target, input ? 7.2 : 5.6, dt)
    if (!input && Math.abs(this.velocity) < 0.025) this.velocity = 0

    if (this.mode === 'outside') {
      this.character.position.x = clamp(this.character.position.x + this.velocity * dt, 1.5, 69)
      this.character.position.y = terrainHeightAt(this.character.position.x)
      this.character.position.z = this.outdoor.pathZ
    } else if (this.mode === 'inside') {
      this.character.position.x = clamp(this.character.position.x + this.velocity * dt, 2.1, 21.2)
      this.character.position.y = 0
      this.character.position.z = this.interior.pathZ
    }

    poseHuman(this.character, dt, this.velocity, running, this.direction)
    this.updatePrompt()
  }

  updateNPCs(dt) {
    if (this.outdoor?.group.visible) {
      for (const npc of this.outdoor.npcs) {
        const state = npc.userData.npc
        npc.position.x += state.direction * state.speed * dt
        if (npc.position.x > state.maxX) state.direction = -1
        if (npc.position.x < state.minX) state.direction = 1
        npc.position.y = terrainHeightAt(npc.position.x)
        poseHuman(npc, dt, state.speed, false, state.direction)
      }
    }

    if (this.interior?.group.visible) {
      const operator = this.interior.operator
      const idle = Math.sin(performance.now() * 0.0014)
      poseHuman(operator, dt, 0, false, 1)
      operator.userData.rig.headPivot.rotation.y = idle * 0.08
      operator.userData.rig.rightArm.rotation.z = -0.18 + Math.sin(performance.now() * 0.0011) * 0.035
    }
  }

  updateCamera(dt) {
    if (this.transitioning) return
    const inside = this.mode === 'inside'
    const targetX = this.character.position.x + this.direction * (inside ? 1.4 : 1.8)
    const targetY = this.character.position.y + (inside ? 3.15 : 3.85)
    const targetZ = inside ? 11.2 : 13.8
    this.camera.position.x = damp(this.camera.position.x, targetX, 3.6, dt)
    this.camera.position.y = damp(this.camera.position.y, targetY, 3.2, dt)
    this.camera.position.z = damp(this.camera.position.z, targetZ, 3.5, dt)
    const lookZ = inside ? 0.2 : 0.4
    this.camera.lookAt(
      this.character.position.x + this.direction * (inside ? 1.9 : 2.4),
      this.character.position.y + 1.4,
      lookZ,
    )
  }

  updatePrompt() {
    let prompt = null
    let location = this.mode

    if (this.mode === 'outside') {
      const distance = Math.abs(this.character.position.x - this.outdoor.doorX)
      if (distance < 3.0) prompt = { key: 'E', label: 'OPEN CONSEQUENCE BUILDING', type: 'door' }
      location = distance < 6.5 ? 'boundary' : 'outside'
    }

    if (this.mode === 'inside') {
      const terminalDistance = Math.abs(this.character.position.x - this.interior.terminalX)
      const exitDistance = Math.abs(this.character.position.x - this.interior.exitX)
      if (terminalDistance < 2.2) prompt = { key: 'E', label: 'INSPECT CONSEQUENCE', type: 'console' }
      else if (exitDistance < 1.8) prompt = { key: 'E', label: 'EXIT BUILDING', type: 'exit' }
      location = terminalDistance < 4.3 ? 'compiler' : 'inside'
    }

    const signature = `${location}:${prompt?.type || 'none'}:${this.inspectionOpen}`
    if (signature !== this.lastStateSignature) {
      this.lastStateSignature = signature
      this.emitState({ location, prompt })
    }
  }

  interact() {
    if (this.transitioning) return
    if (this.inspectionOpen) {
      this.closeInspection()
      return
    }

    if (this.mode === 'outside' && Math.abs(this.character.position.x - this.outdoor.doorX) < 3.2) {
      this.enterBuilding()
      return
    }

    if (this.mode === 'inside') {
      if (Math.abs(this.character.position.x - this.interior.terminalX) < 2.3) {
        this.openInspection()
        return
      }
      if (Math.abs(this.character.position.x - this.interior.exitX) < 2.0) this.exitBuilding()
    }
  }

  enterBuilding() {
    if (this.transitioning || this.mode !== 'outside') return
    this.transitioning = true
    this.mode = 'transition'
    this.velocity = 0
    this.keys.clear()
    this.emitState({ location: 'boundary', prompt: null, transition: 'entering' })

    const doorPivot = this.outdoor.building.userData.doorPivot
    const securityLight = this.outdoor.building.userData.securityLight
    const targetX = this.outdoor.doorX - 0.55
    this.direction = 1

    gsap.timeline({ defaults: { ease: 'power2.inOut' } })
      .to(this.character.position, { x: targetX, duration: this.reducedMotion ? 0.01 : 0.62 })
      .to(doorPivot.rotation, { y: -1.32, duration: this.reducedMotion ? 0.01 : 0.85, ease: 'power3.inOut' }, '-=0.12')
      .to(securityLight.material, { emissiveIntensity: 2.7, duration: 0.35 }, '<')
      .to(this.camera.position, { z: 11.1, x: this.outdoor.doorX - 1.4, duration: this.reducedMotion ? 0.01 : 0.65 }, '<0.1')
      .to(this.character.position, {
        z: this.outdoor.doorZ - 0.65,
        y: 1.35,
        duration: this.reducedMotion ? 0.01 : 0.9,
        ease: 'power1.inOut',
      })
      .call(() => this.swapToInterior())
      .to(this.camera.position, { x: 5.6, y: 3.25, z: 11.2, duration: this.reducedMotion ? 0.01 : 0.42 })
      .call(() => {
        this.transitioning = false
        this.mode = 'inside'
        this.emitState({ location: 'inside', prompt: null, transition: null })
      })
  }

  swapToInterior() {
    this.outdoor.group.remove(this.character)
    this.outdoor.group.visible = false
    this.interior.group.visible = true
    this.interior.group.add(this.character)
    this.character.position.set(4.6, 0, this.interior.pathZ)
    this.scene.background.set(0x1f2925)
    this.scene.fog.color.set(0x1f2925)
    this.scene.fog.density = 0.018
  }

  exitBuilding() {
    if (this.transitioning || this.mode !== 'inside') return
    this.transitioning = true
    this.mode = 'transition'
    this.velocity = 0
    this.keys.clear()
    this.emitState({ location: 'inside', prompt: null, transition: 'exiting' })
    this.direction = -1

    gsap.timeline({ defaults: { ease: 'power2.inOut' } })
      .to(this.character.position, { x: this.interior.exitX, duration: this.reducedMotion ? 0.01 : 0.5 })
      .to(this.interior.exitPivot.rotation, { y: 1.24, duration: this.reducedMotion ? 0.01 : 0.72, ease: 'power3.inOut' }, '-=0.1')
      .to(this.character.position, { z: 5.2, duration: this.reducedMotion ? 0.01 : 0.68 })
      .call(() => this.swapToOutdoor())
      .to(this.camera.position, { x: this.outdoor.doorX - 2.4, y: 5.1, z: 13.8, duration: this.reducedMotion ? 0.01 : 0.48 })
      .to(this.outdoor.building.userData.doorPivot.rotation, { y: 0, duration: this.reducedMotion ? 0.01 : 0.65 }, '<')
      .to(this.outdoor.building.userData.securityLight.material, { emissiveIntensity: 1.2, duration: 0.35 }, '<')
      .call(() => {
        this.interior.exitPivot.rotation.y = 0
        this.transitioning = false
        this.mode = 'outside'
        this.emitState({ location: 'boundary', prompt: { key: 'E', label: 'OPEN CONSEQUENCE BUILDING', type: 'door' }, transition: null })
      })
  }

  swapToOutdoor() {
    this.interior.group.remove(this.character)
    this.interior.group.visible = false
    this.outdoor.group.visible = true
    this.outdoor.group.add(this.character)
    this.character.position.set(this.outdoor.doorX - 1.8, terrainHeightAt(this.outdoor.doorX - 1.8), this.outdoor.pathZ)
    this.scene.background.set(0xcdd8cf)
    this.scene.fog.color.set(0xcdd8cf)
    this.scene.fog.density = 0.013
  }

  openInspection() {
    if (this.inspectionOpen || this.mode !== 'inside') return
    this.inspectionOpen = true
    this.velocity = 0
    this.keys.clear()
    this.direction = 1
    const indicator = this.interior.terminal.userData.indicator
    gsap.to(indicator.material, { emissiveIntensity: 3.0, duration: 0.32 })
    gsap.to(this.character.rotation, { y: -0.16, duration: 0.32 })
    this.emitState({ location: 'compiler', prompt: null, inspection: true })
  }

  closeInspection() {
    if (!this.inspectionOpen) return
    this.inspectionOpen = false
    const indicator = this.interior.terminal.userData.indicator
    gsap.to(indicator.material, { emissiveIntensity: 1.3, duration: 0.28 })
    gsap.to(this.character.rotation, { y: 0, duration: 0.28 })
    this.emitState({ location: 'compiler', prompt: { key: 'E', label: 'INSPECT CONSEQUENCE', type: 'console' }, inspection: false })
  }

  emitState(patch = {}) {
    this.callbacks.onState?.({
      mode: this.mode,
      renderer: this.rendererName,
      location: this.mode === 'inside' ? 'inside' : 'outside',
      prompt: null,
      inspection: this.inspectionOpen,
      transition: null,
      ...patch,
    })
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    window.removeEventListener('resize', this.onResize)
    this.renderer?.domElement?.removeEventListener('pointerdown', this.onPointerDown)
    this.renderer?.setAnimationLoop(null)

    const materials = new Set()
    this.scene?.traverse((object) => {
      object.geometry?.dispose?.()
      if (object.material) {
        const list = Array.isArray(object.material) ? object.material : [object.material]
        list.forEach((material) => materials.add(material))
      }
    })
    materials.forEach((material) => material.dispose?.())
    this.renderer?.dispose?.()
    this.renderer?.domElement?.remove()
    this.renderer = null
    this.scene = null
  }
}
