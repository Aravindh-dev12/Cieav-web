import { WorldRuntime } from './WorldRuntime.js'
import { applyPhotorealWorld, disposePhotorealResources } from './three/PhotorealAssets.js'
import {
  attachCharacterAsset,
  loadCharacterCatalog,
  pickCharacterTemplate,
} from './three/CharacterAssetController.js'
import { addEnvironmentDetailLayer } from './three/EnvironmentDetailLayer.js'
import { attachHighDetailArchitecture, removeHighDetailArchitecture } from './three/BuildingAssetFactory.js'
import { addDistantCityLayer, removeDistantCityLayer } from './three/DistantCityLayer.js'

export class PhotorealRuntime extends WorldRuntime {
  constructor(host, callbacks = {}) {
    super(host, callbacks)
    this.realHumanControllers = []
    this.realismReady = false
    this.realFrameBase = this.frame
    this.frame = this.photorealFrame
    this.realLastTime = performance.now()
  }

  async init() {
    await super.init()

    // Immediate local detail keeps first interaction fast while high-detail assets
    // and civilian bodies stream in progressively.
    addEnvironmentDetailLayer(this)
    addDistantCityLayer(this)

    const [catalog] = await Promise.all([
      loadCharacterCatalog().catch(() => []),
      applyPhotorealWorld(this).catch(() => null),
      attachHighDetailArchitecture(this).catch(() => null),
    ])

    if (catalog.length) {
      const traveler = pickCharacterTemplate(catalog, 'traveler', 0)
      const travelerController = attachCharacterAsset(this.character, traveler, {
        phase: 0.35,
        variant: 0,
      })
      if (travelerController) this.realHumanControllers.push(travelerController)

      this.outdoor.npcs.forEach((npc, index) => {
        const template = pickCharacterTemplate(catalog, 'pedestrian', index)
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
      this.character?.userData?.realHuman?.update(dt, this.velocity, running)

      if (this.outdoor?.group?.visible) {
        for (const npc of this.outdoor.npcs || []) {
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

    removeHighDetailArchitecture(this)
    removeDistantCityLayer(this)

    if (this.environmentDetailLayer?.parent) {
      this.environmentDetailLayer.parent.remove(this.environmentDetailLayer)
    }

    disposePhotorealResources(this)
    super.destroy()
  }
}
