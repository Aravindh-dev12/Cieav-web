import { WorldRuntime } from './WorldRuntime.js'
import {
  applyPhotorealWorld,
  attachRealHuman,
  createRealHumanTemplate,
  disposePhotorealResources,
} from './three/PhotorealAssets.js'

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

    const [template] = await Promise.all([
      createRealHumanTemplate().catch(() => null),
      applyPhotorealWorld(this).catch(() => null),
    ])

    if (template) {
      this.realHumanControllers.push(attachRealHuman(this.character, template, 0.4))
      this.outdoor.npcs.forEach((npc, index) => {
        this.realHumanControllers.push(attachRealHuman(npc, template, 1.3 + index * 1.8))
      })
      if (this.interior?.operator) {
        this.realHumanControllers.push(attachRealHuman(this.interior.operator, template, 2.7))
      }
    }

    this.realismReady = true
    this.rendererName = this.rendererName.includes('WEBGPU')
      ? 'WEBGPU / HDR + PBR'
      : 'WEBGL2 / HDR + PBR'
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
    disposePhotorealResources(this)
    this.realHumanControllers.length = 0
    super.destroy()
  }
}
