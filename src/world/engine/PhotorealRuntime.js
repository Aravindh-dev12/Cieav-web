import * as THREE from 'three/webgpu'
import { WorldRuntime } from './WorldRuntime.js'
import { poseHuman } from './three/HumanModel.js'
import { terrainHeightAt } from './three/WorldScenes.js'
import { applyPhotorealWorld, disposePhotorealResources } from './three/PhotorealAssets.js'
import {
  attachCharacterAsset,
  loadCharacterCatalog,
  pickCharacterTemplate,
} from './three/CharacterAssetController.js'
import { addEnvironmentDetailLayer } from './three/EnvironmentDetailLayer.js'
import { attachHighDetailArchitecture, removeHighDetailArchitecture } from './three/BuildingAssetFactory.js'
import { addDistantCityLayer, removeDistantCityLayer } from './three/DistantCityLayer.js'
import { attachStreetAssets, removeStreetAssets } from './three/StreetAssetFactory.js'

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
const damp = (from, to, lambda, dt) => THREE.MathUtils.lerp(from, to, 1 - Math.exp(-lambda * dt))

export class PhotorealRuntime extends WorldRuntime {
  constructor(host, callbacks = {}) {
    super(host, callbacks)
    this.realHumanControllers = []
    this.realismReady = false
    this.realFrameBase = this.frame
    this.frame = this.photorealFrame
    this.realLastTime = performance.now()

    // The base runtime owns the actual camera values. User input only changes
    // these targets, so drag / zoom never snaps the rendered camera directly.
    this.cameraTargetYaw = this.cameraYaw
    this.cameraTargetPitch = this.cameraPitch
    this.cameraTargetDistance = this.cameraDistance
  }

  bindPointer() {
    const canvas = this.renderer.domElement

    this.onPointerDown = (event) => {
      if (this.transitioning || this.inspectionOpen || event.button !== 0) return
      this.cameraDrag.active = true
      this.cameraDrag.pointerId = event.pointerId
      this.cameraDrag.x = event.clientX
      this.cameraDrag.y = event.clientY
      this.cameraDrag.moved = false
      canvas.setPointerCapture?.(event.pointerId)
      canvas.classList.add('is-camera-dragging')
    }

    this.onPointerMove = (event) => {
      if (!this.cameraDrag.active || this.cameraDrag.pointerId !== event.pointerId) return
      const dx = event.clientX - this.cameraDrag.x
      const dy = event.clientY - this.cameraDrag.y
      if (Math.abs(dx) + Math.abs(dy) > 3) this.cameraDrag.moved = true

      // Lower sensitivity + target damping gives the camera physical weight.
      this.cameraTargetYaw -= dx * 0.00275
      this.cameraTargetPitch = clamp(this.cameraTargetPitch + dy * 0.0019, 0.16, 0.58)
      this.cameraDrag.x = event.clientX
      this.cameraDrag.y = event.clientY
    }

    this.onPointerUp = (event) => {
      if (!this.cameraDrag.active || this.cameraDrag.pointerId !== event.pointerId) return
      const shouldPick = !this.cameraDrag.moved
      this.cameraDrag.active = false
      this.cameraDrag.pointerId = null
      canvas.releasePointerCapture?.(event.pointerId)
      canvas.classList.remove('is-camera-dragging')
      if (shouldPick) this.pickInteraction(event)
    }

    this.onPointerCancel = (event) => {
      if (this.cameraDrag.pointerId !== event.pointerId) return
      this.cameraDrag.active = false
      this.cameraDrag.pointerId = null
      canvas.classList.remove('is-camera-dragging')
    }

    this.onWheel = (event) => {
      if (this.transitioning || this.inspectionOpen) return
      event.preventDefault()
      const inside = this.mode === 'inside'
      const minDistance = inside ? 5.9 : 8.7
      const maxDistance = inside ? 9.1 : 13.4
      this.cameraTargetDistance = clamp(
        this.cameraTargetDistance + event.deltaY * 0.0042,
        minDistance,
        maxDistance,
      )
    }

    canvas.addEventListener('pointerdown', this.onPointerDown)
    canvas.addEventListener('pointermove', this.onPointerMove)
    canvas.addEventListener('pointerup', this.onPointerUp)
    canvas.addEventListener('pointercancel', this.onPointerCancel)
    canvas.addEventListener('wheel', this.onWheel, { passive: false })
  }

  updateMovement(dt) {
    const forward = this.keys.has('arrowup') || this.keys.has('w')
    const backward = this.keys.has('arrowdown') || this.keys.has('s')
    const left = this.keys.has('arrowleft') || this.keys.has('a')
    const right = this.keys.has('arrowright') || this.keys.has('d')
    const running = this.keys.has('shift')

    let forwardInput = (forward ? 1 : 0) - (backward ? 1 : 0)
    let strafeInput = (right ? 1 : 0) - (left ? 1 : 0)
    if (forwardInput && strafeInput) {
      forwardInput *= Math.SQRT1_2
      strafeInput *= Math.SQRT1_2
    }

    if (forwardInput > 0.05) this.direction = 1
    if (forwardInput < -0.05) this.direction = -1

    // Deliberately pedestrian speeds with eased acceleration and release.
    const forwardSpeed = running ? 4.35 : 2.45
    const lateralSpeed = running ? 3.15 : 1.95
    const forwardResponse = forwardInput ? 3.35 : 4.15
    const lateralResponse = strafeInput ? 3.65 : 4.35

    this.velocity = damp(this.velocity, forwardInput * forwardSpeed, forwardResponse, dt)
    this.strafeVelocity = damp(this.strafeVelocity, strafeInput * lateralSpeed, lateralResponse, dt)

    if (!forwardInput && Math.abs(this.velocity) < 0.012) this.velocity = 0
    if (!strafeInput && Math.abs(this.strafeVelocity) < 0.012) this.strafeVelocity = 0

    if (this.mode === 'outside') {
      this.character.position.x = clamp(this.character.position.x + this.velocity * dt, 1.5, 69)
      this.character.position.z = clamp(
        this.character.position.z + this.strafeVelocity * dt,
        this.outdoor.pathZ - 2.2,
        this.outdoor.pathZ + 2.2,
      )
      this.character.position.y = terrainHeightAt(this.character.position.x)
    } else if (this.mode === 'inside') {
      this.character.position.x = clamp(this.character.position.x + this.velocity * dt, 2.1, 21.2)
      this.character.position.z = clamp(
        this.character.position.z + this.strafeVelocity * dt,
        this.interior.pathZ - 1.65,
        this.interior.pathZ + 1.65,
      )
      this.character.position.y = 0
    }

    const movementSpeed = Math.hypot(this.velocity, this.strafeVelocity)
    poseHuman(this.character, dt, movementSpeed, running, this.direction)
    this.updatePrompt()
  }

  updateCamera(dt) {
    if (this.transitioning) return

    const inside = this.mode === 'inside'
    const minDistance = inside ? 5.9 : 8.7
    const maxDistance = inside ? 9.1 : 13.4
    const minPitch = inside ? 0.18 : 0.16
    const maxPitch = inside ? 0.50 : 0.58

    this.cameraTargetDistance = clamp(this.cameraTargetDistance, minDistance, maxDistance)
    this.cameraTargetPitch = clamp(this.cameraTargetPitch, minPitch, maxPitch)

    this.cameraYaw = damp(this.cameraYaw, this.cameraTargetYaw, 6.4, dt)
    this.cameraPitch = damp(this.cameraPitch, this.cameraTargetPitch, 6.0, dt)
    this.cameraDistance = damp(this.cameraDistance, this.cameraTargetDistance, 5.2, dt)

    const horizontalDistance = Math.cos(this.cameraPitch) * this.cameraDistance
    const verticalDistance = Math.sin(this.cameraPitch) * this.cameraDistance
    const focusLead = inside ? 1.25 : 1.8

    const focusX = this.character.position.x + this.direction * focusLead
    const focusY = this.character.position.y + (inside ? 1.3 : 1.42)
    const focusZ = this.character.position.z

    const targetX = focusX + Math.cos(this.cameraYaw) * horizontalDistance
    const targetY = focusY + verticalDistance
    const targetZ = focusZ + Math.sin(this.cameraYaw) * horizontalDistance

    // Position damping is intentionally slower than input damping: the camera
    // follows like a stabilized dolly rather than a game camera attached to a spring.
    this.camera.position.x = damp(this.camera.position.x, targetX, 3.25, dt)
    this.camera.position.y = damp(this.camera.position.y, targetY, 3.0, dt)
    this.camera.position.z = damp(this.camera.position.z, targetZ, 3.25, dt)
    this.camera.lookAt(focusX, focusY, focusZ)
  }

  async init() {
    await super.init()

    addEnvironmentDetailLayer(this)
    addDistantCityLayer(this)

    const [catalog] = await Promise.all([
      loadCharacterCatalog().catch(() => []),
      applyPhotorealWorld(this).catch(() => null),
      attachHighDetailArchitecture(this).catch(() => null),
      attachStreetAssets(this).catch(() => null),
    ])

    if (catalog.length) {
      const usedOutdoorSources = new Set()
      const traveler = pickCharacterTemplate(catalog, 'traveler', 0)
      const travelerController = attachCharacterAsset(this.character, traveler, {
        phase: 0.35,
        variant: 0,
      })
      if (travelerController) {
        this.realHumanControllers.push(travelerController)
        if (traveler?.source?.id) usedOutdoorSources.add(traveler.source.id)
      }

      this.outdoor.npcs.forEach((npc, index) => {
        const unused = catalog.filter((template) => !usedOutdoorSources.has(template.source.id))
        const pool = unused.length ? unused : catalog
        const template = pickCharacterTemplate(pool, 'pedestrian', index)

        if (!template || (index >= 2 && usedOutdoorSources.has(template.source.id))) {
          npc.visible = false
          return
        }

        usedOutdoorSources.add(template.source.id)
        if (npc.userData?.npc) {
          npc.userData.npc.speed *= index === 0 ? 0.82 : 0.74
        }

        const controller = attachCharacterAsset(npc, template, {
          phase: 1.15 + index * 1.73,
          variant: index + 1,
        })
        if (controller) this.realHumanControllers.push(controller)
      })

      if (this.interior?.operator) {
        const operator = pickCharacterTemplate(catalog, 'operator', 0)
        const controller = attachCharacterAsset(this.interior.operator, operator, {
          phase: 2.55,
          variant: 3,
        })
        if (controller) this.realHumanControllers.push(controller)
      }
    }

    this.realismReady = true
    this.rendererName = this.rendererName.includes('WEBGPU')
      ? 'WEBGPU / HIGH-FIDELITY PBR'
      : 'WEBGL2 / HIGH-FIDELITY PBR'
    this.emitState({ renderer: this.rendererName })
  }

  photorealFrame = (time) => {
    const dt = Math.min(0.05, Math.max(0.001, (time - this.realLastTime) / 1000))
    this.realLastTime = time

    if (this.realismReady) {
      const running = this.keys.has('shift')
      const travelerSpeed = Math.hypot(this.velocity || 0, this.strafeVelocity || 0)
      this.character?.userData?.realHuman?.update(dt, travelerSpeed, running)

      if (this.outdoor?.group?.visible) {
        for (const npc of this.outdoor.npcs || []) {
          if (!npc.visible) continue
          const state = npc.userData.npc
          npc.userData.realHuman?.update(dt, state?.speed || 0, false)
        }
      }

      if (this.interior?.group?.visible && this.interior.operator) {
        this.interior.operator.userData.realHuman?.update(dt, 0, false)
      }
    }

    this.realFrameBase(time)
  }

  destroy() {
    this.realHumanControllers.forEach((controller) => controller?.dispose?.())
    this.realHumanControllers.length = 0

    removeStreetAssets(this)
    removeHighDetailArchitecture(this)
    removeDistantCityLayer(this)

    if (this.environmentDetailLayer?.parent) {
      this.environmentDetailLayer.parent.remove(this.environmentDetailLayer)
    }

    disposePhotorealResources(this)
    super.destroy()
  }
}
