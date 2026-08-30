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
import { attachStreetAssets, removeStreetAssets } from './three/StreetAssetFactory.js'

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

        // A repeated close-up clone is more distracting than a quieter campus.
        // Keep the foreground cast distinct and leave duplicates out of frame.
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
