import { WorldRuntime } from './WorldRuntime.js'
import { applyPhotorealWorld, disposePhotorealResources } from './three/PhotorealAssets.js'
import { attachCharacterAsset, loadCharacterTemplate } from './three/CharacterAssetController.js'
import { addEnvironmentDetailLayer } from './three/EnvironmentDetailLayer.js'
import { attachHighDetailArchitecture, removeHighDetailArchitecture } from './three/BuildingAssetFactory.js'

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

    // Geometry detail is local and immediate; network assets progressively replace
    // the procedural visual layer without blocking movement or interaction.
    addEnvironmentDetailLayer(this)

    const [template] = await Promise.all([
      loadCharacterTemplate().catch(() => null),
      applyPhotorealWorld(this).catch(() => null),
      attachHighDetailArchitecture(this).catch(() => null),
    ])

    if (template) {
      this.realHumanControllers.push(attachCharacterAsset(this.character, template, { phase: 0.4, variant: 0 }))

      this.outdoor.npcs.forEach((npc, index) => {
        this.realHumanControllers.push(
          attachCharacterAsset(npc, template, {
            phase: 1.3 + index * 1.8,
            variant: index + 1,
          }),
        )
      })

      if (this.interior?.operator) {
        this.realHumanControllers.push(
          attachCharacterAsset(this.interior.operator, template, { phase: 2.7, variant: 4 }),
        )
      }
    }

    this.realismReady = true
    this.rendererName = this.rendererName.includes('WEBGPU')
      ? 'WEBGPU / PRODUCTION ASSETS'
      : 'WEBGL2 / PRODUCTION ASSETS'
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

    if (this.environmentDetailLayer?.parent) {
      this.environmentDetailLayer.parent.remove(this.environmentDetailLayer)
    }

    disposePhotorealResources(this)
    super.destroy()
  }
}
