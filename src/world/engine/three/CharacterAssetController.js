import * as THREE from 'three/webgpu'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js'

// Public, browser-friendly character sources. Keep multiple fallbacks because
// external CDNs can fail independently of the application.
const CHARACTER_SOURCES = [
  {
    id: 'soldier',
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Soldier.glb',
    rotationY: Math.PI / 2,
    height: 2.78,
  },
  {
    id: 'michelle',
    url: 'https://three.ws/avatars/michelle.glb',
    rotationY: Math.PI / 2,
    height: 2.72,
  },
  {
    id: 'quaternius-human',
    url: 'https://raw.githubusercontent.com/UMRAM-Bilkent/supine-human-model/main/assets/human.glb',
    rotationY: Math.PI / 2,
    height: 2.72,
  },
]

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

function normalizeModel(model, source) {
  model.rotation.y = source.rotationY ?? Math.PI / 2
  model.updateMatrixWorld(true)

  let box = new THREE.Box3().setFromObject(model)
  const size = box.getSize(new THREE.Vector3())
  const scale = (source.height ?? 2.72) / Math.max(size.y, 0.001)
  model.scale.setScalar(scale)
  model.updateMatrixWorld(true)

  box = new THREE.Box3().setFromObject(model)
  model.position.y -= box.min.y

  model.traverse((object) => {
    if (!object.isMesh && !object.isSkinnedMesh) return
    object.castShadow = true
    object.receiveShadow = true
    object.frustumCulled = true

    const materials = Array.isArray(object.material) ? object.material : [object.material]
    materials.forEach((material) => {
      if (!material) return
      if ('roughness' in material) material.roughness = clamp(material.roughness ?? 0.62, 0.32, 0.78)
      if ('metalness' in material) material.metalness = clamp(material.metalness ?? 0, 0, 0.18)
      material.envMapIntensity = 1.18
      material.needsUpdate = true
    })
  })
}

function findClip(clips, patterns) {
  return clips.find((clip) => patterns.some((pattern) => pattern.test(clip.name))) || null
}

function varyMaterial(model, variant = 0) {
  if (!variant) return
  const seen = new Map()
  model.traverse((object) => {
    if (!object.isMesh && !object.isSkinnedMesh) return
    const list = Array.isArray(object.material) ? object.material : [object.material]
    const next = list.map((material) => {
      if (!material) return material
      if (seen.has(material)) return seen.get(material)
      const clone = material.clone()
      if (clone.color?.isColor) {
        const hsl = {}
        clone.color.getHSL(hsl)
        const hueShift = ((variant * 0.083) % 0.18) - 0.09
        const lightShift = ((variant % 3) - 1) * 0.035
        clone.color.setHSL((hsl.h + hueShift + 1) % 1, clamp(hsl.s * 0.94, 0, 1), clamp(hsl.l + lightShift, 0.08, 0.92))
      }
      clone.needsUpdate = true
      seen.set(material, clone)
      return clone
    })
    object.material = Array.isArray(object.material) ? next : next[0]
  })
}

function findBone(model, candidates) {
  let found = null
  model.traverse((object) => {
    if (found || !object.isBone) return
    const name = object.name.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (candidates.some((candidate) => name.includes(candidate))) found = object
  })
  return found
}

function manualRig(model) {
  return {
    hips: findBone(model, ['mixamorighips', 'hips', 'pelvis']),
    spine: findBone(model, ['mixamorigspine1', 'spine1', 'spine']),
    head: findBone(model, ['mixamorighead', 'head']),
    leftArm: findBone(model, ['mixamorigleftarm', 'leftarm', 'upperarmleft']),
    rightArm: findBone(model, ['mixamorigrightarm', 'rightarm', 'upperarmright']),
    leftForeArm: findBone(model, ['mixamorigleftforearm', 'leftforearm', 'lowerarmleft']),
    rightForeArm: findBone(model, ['mixamorigrightforearm', 'rightforearm', 'lowerarmright']),
    leftUpLeg: findBone(model, ['mixamorigleftupleg', 'leftupleg', 'thighleft']),
    rightUpLeg: findBone(model, ['mixamorigrightupleg', 'rightupleg', 'thighright']),
    leftLeg: findBone(model, ['mixamorigleftleg', 'leftleg', 'calfleft']),
    rightLeg: findBone(model, ['mixamorigrightleg', 'rightleg', 'calfright']),
  }
}

function snapshotRig(rig) {
  return Object.fromEntries(
    Object.entries(rig).map(([name, bone]) => [name, bone?.rotation?.clone?.() || null]),
  )
}

function easeBone(bone, bind, x = 0, y = 0, z = 0, amount = 0.16) {
  if (!bone || !bind) return
  bone.rotation.x = THREE.MathUtils.lerp(bone.rotation.x, bind.x + x, amount)
  bone.rotation.y = THREE.MathUtils.lerp(bone.rotation.y, bind.y + y, amount)
  bone.rotation.z = THREE.MathUtils.lerp(bone.rotation.z, bind.z + z, amount)
}

export class CharacterAssetController {
  constructor(root, model, clips = [], { phase = 0 } = {}) {
    this.root = root
    this.model = model
    this.phase = phase
    this.mixer = clips.length ? new THREE.AnimationMixer(model) : null
    this.idle = findClip(clips, [/^idle$/i, /idle/i, /tpose/i])
    this.walk = findClip(clips, [/^walk$/i, /walk/i])
    this.run = findClip(clips, [/^run$/i, /run/i])
    this.active = null
    this.rig = manualRig(model)
    this.bind = snapshotRig(this.rig)
    this.lastState = 'idle'

    if (this.mixer && this.idle) this.play(this.idle, 0)
  }

  play(clip, fade = 0.24) {
    if (!this.mixer || !clip) return
    const action = this.mixer.clipAction(clip)
    if (action === this.active) return
    action.enabled = true
    action.reset().setEffectiveWeight(1).play()
    if (this.active) this.active.crossFadeTo(action, fade, false)
    this.active = action
  }

  update(dt, speed = 0, running = false) {
    const abs = Math.abs(speed)
    const state = abs < 0.06 ? 'idle' : running ? 'run' : 'walk'
    this.lastState = state

    if (this.mixer && (this.walk || this.idle)) {
      const clip = state === 'idle' ? this.idle || this.walk : state === 'run' ? this.run || this.walk : this.walk || this.idle
      this.play(clip)
      this.mixer.timeScale = state === 'idle' ? 0.9 : state === 'run' ? 1.12 : clamp(0.72 + abs * 0.11, 0.74, 1.08)
      this.mixer.update(dt)
      return
    }

    // Generic Mixamo-style fallback when the asset has a rig but no locomotion clips.
    this.phase += dt * (running ? 7.6 : 5.3) * clamp(0.42 + abs / 3.1, 0.42, 1.35)
    const swing = abs > 0.06 ? Math.sin(this.phase) : 0
    const stride = running ? 0.72 : 0.48
    const kneeL = Math.max(0, -swing)
    const kneeR = Math.max(0, swing)

    easeBone(this.rig.leftUpLeg, this.bind.leftUpLeg, swing * stride)
    easeBone(this.rig.rightUpLeg, this.bind.rightUpLeg, -swing * stride)
    easeBone(this.rig.leftLeg, this.bind.leftLeg, -kneeL * (running ? 0.95 : 0.6))
    easeBone(this.rig.rightLeg, this.bind.rightLeg, -kneeR * (running ? 0.95 : 0.6))
    easeBone(this.rig.leftArm, this.bind.leftArm, -swing * (running ? 0.6 : 0.43))
    easeBone(this.rig.rightArm, this.bind.rightArm, swing * (running ? 0.6 : 0.43))
    easeBone(this.rig.leftForeArm, this.bind.leftForeArm, -0.18 - kneeR * 0.34)
    easeBone(this.rig.rightForeArm, this.bind.rightForeArm, -0.18 - kneeL * 0.34)
    easeBone(this.rig.spine, this.bind.spine, 0, 0, abs > 0.06 ? -swing * 0.025 : 0)
    easeBone(this.rig.head, this.bind.head, 0, abs > 0.06 ? swing * 0.022 : Math.sin(this.phase * 0.2) * 0.025, 0)
  }

  dispose() {
    this.mixer?.stopAllAction()
  }
}

export async function loadCharacterTemplate() {
  const loader = new GLTFLoader()
  let lastError = null

  for (const source of CHARACTER_SOURCES) {
    try {
      const gltf = await loader.loadAsync(source.url)
      normalizeModel(gltf.scene, source)
      return { source, scene: gltf.scene, animations: gltf.animations || [] }
    } catch (error) {
      lastError = error
    }
  }

  throw lastError || new Error('No production character asset could be loaded.')
}

export function attachCharacterAsset(root, template, { phase = 0, variant = 0 } = {}) {
  const model = SkeletonUtils.clone(template.scene)
  normalizeModel(model, template.source)
  varyMaterial(model, variant)

  const proceduralRig = root.userData?.rig?.rig
  if (proceduralRig) proceduralRig.visible = false
  model.position.set(0, 0, 0)
  root.add(model)

  const controller = new CharacterAssetController(root, model, template.animations, { phase })
  root.userData.realHuman = controller
  root.userData.assetModel = model
  return controller
}
