import * as THREE from 'three/webgpu'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js'

// High-fidelity civilian bodies first; the lighter known-rigged model is only a
// fallback for motion if a richer body cannot animate on the current browser.
const CHARACTER_SOURCES = [
  {
    id: 'realistic-male',
    url: 'https://three.ws/avatars/realistic-male.glb',
    rotationY: Math.PI / 2,
    height: 1.78,
    role: 'civilian',
  },
  {
    id: 'realistic-female',
    url: 'https://three.ws/avatars/realistic-female.glb',
    rotationY: Math.PI / 2,
    height: 1.68,
    role: 'civilian',
  },
  {
    id: 'michelle-civilian',
    url: 'https://three.ws/avatars/michelle.glb',
    rotationY: Math.PI / 2,
    height: 1.70,
    role: 'fallback',
  },
  {
    id: 'default-civilian',
    url: 'https://three.ws/avatars/default.glb',
    rotationY: Math.PI / 2,
    height: 1.75,
    role: 'fallback',
  },
]

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
const cleanName = (value = '') => value.toLowerCase().replace(/[^a-z0-9]/g, '')
const tacticalPattern = /(weapon|gun|rifle|pistol|ammo|holster|grenade|knife|helmet|tactical|armor|armour|shield|combat)/i
const skinPattern = /(skin|face|head|body|hand|arm|leg|neck)/i
const hairPattern = /(hair|brow|lash)/i
const eyePattern = /(eye|iris|cornea|teeth|mouth|lip)/i
const clothingPattern = /(cloth|shirt|top|jacket|coat|dress|skirt|trouser|pant|jean|shoe|boot|sneaker|suit|blazer|hood|sock|sweater)/i

function inspectTemplate(scene, animations = []) {
  let boneCount = 0
  let skinnedMeshes = 0
  scene.traverse((object) => {
    if (object.isBone) boneCount += 1
    if (object.isSkinnedMesh) skinnedMeshes += 1
  })

  const locomotionClips = animations.filter((clip) => /walk|run|idle|locomotion/i.test(clip.name)).length
  return {
    boneCount,
    skinnedMeshes,
    motionCapable: locomotionClips > 0 || (skinnedMeshes > 0 && boneCount >= 14),
  }
}

function sanitizeCivilianModel(model) {
  model.traverse((object) => {
    const name = `${object.name || ''} ${object.material?.name || ''}`
    if (tacticalPattern.test(name)) object.visible = false
  })
}

function tuneMaterial(object, material) {
  if (!material) return
  const name = `${object.name || ''} ${material.name || ''}`
  const skinLike = skinPattern.test(name)
  const hairLike = hairPattern.test(name)
  const eyeLike = eyePattern.test(name)
  const clothingLike = clothingPattern.test(name)

  // Keep authored textures and colors intact. Only correct physically implausible
  // response ranges that make people look like plastic/game assets.
  if ('metalness' in material && !/metal|zip|button|buckle/i.test(name)) material.metalness = 0
  if ('roughness' in material) {
    if (skinLike) material.roughness = clamp(material.roughness ?? 0.52, 0.42, 0.62)
    else if (hairLike) material.roughness = clamp(material.roughness ?? 0.68, 0.56, 0.82)
    else if (eyeLike) material.roughness = clamp(material.roughness ?? 0.24, 0.16, 0.36)
    else if (clothingLike) material.roughness = clamp(material.roughness ?? 0.78, 0.62, 0.94)
    else material.roughness = clamp(material.roughness ?? 0.68, 0.42, 0.92)
  }
  if ('envMapIntensity' in material) material.envMapIntensity = skinLike ? 0.62 : 0.88
  material.needsUpdate = true
}

function normalizeModel(model, source) {
  model.position.set(0, 0, 0)
  model.scale.set(1, 1, 1)
  model.rotation.set(0, source.rotationY ?? Math.PI / 2, 0)
  model.updateMatrixWorld(true)

  let box = new THREE.Box3().setFromObject(model)
  const size = box.getSize(new THREE.Vector3())
  const scale = (source.height ?? 1.73) / Math.max(size.y, 0.001)
  model.scale.setScalar(scale)
  model.updateMatrixWorld(true)

  box = new THREE.Box3().setFromObject(model)
  model.position.y -= box.min.y

  sanitizeCivilianModel(model)
  model.traverse((object) => {
    if (!object.isMesh && !object.isSkinnedMesh) return
    object.castShadow = true
    object.receiveShadow = true
    object.frustumCulled = true
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    materials.forEach((material) => tuneMaterial(object, material))
  })
}

function varyClothing(model, variant = 0) {
  if (!variant) return
  const seen = new Map()

  model.traverse((object) => {
    if (!object.isMesh && !object.isSkinnedMesh) return
    const materialName = `${object.name || ''} ${Array.isArray(object.material) ? '' : object.material?.name || ''}`
    if (!clothingPattern.test(materialName) || skinPattern.test(materialName) || hairPattern.test(materialName)) return

    const list = Array.isArray(object.material) ? object.material : [object.material]
    const next = list.map((material) => {
      if (!material) return material
      if (seen.has(material)) return seen.get(material)
      const clone = material.clone()
      const name = `${object.name || ''} ${clone.name || ''}`
      if (clothingPattern.test(name) && clone.color?.isColor && !clone.map) {
        const hsl = {}
        clone.color.getHSL(hsl)
        const hueShift = ((variant * 0.043) % 0.11) - 0.055
        clone.color.setHSL(
          (hsl.h + hueShift + 1) % 1,
          clamp(hsl.s * 0.72, 0.04, 0.5),
          clamp(hsl.l + ((variant % 3) - 1) * 0.018, 0.08, 0.9),
        )
      }
      tuneMaterial(object, clone)
      seen.set(material, clone)
      return clone
    })
    object.material = Array.isArray(object.material) ? next : next[0]
  })
}

function findClip(clips, patterns) {
  return clips.find((clip) => patterns.some((pattern) => pattern.test(clip.name))) || null
}

function findBone(model, candidates) {
  let found = null
  model.traverse((object) => {
    if (found || !object.isBone) return
    const name = cleanName(object.name)
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

function easeBone(bone, bind, x = 0, y = 0, z = 0, amount = 0.15) {
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
    this.idle = findClip(clips, [/^idle$/i, /idle/i, /breath/i])
    this.walk = findClip(clips, [/^walk$/i, /walk/i, /locomotion/i])
    this.run = findClip(clips, [/^run$/i, /run/i, /jog/i])
    this.active = null
    this.rig = manualRig(model)
    this.bind = snapshotRig(this.rig)
    this.hasManualLegs = Boolean(this.rig.leftUpLeg && this.rig.rightUpLeg)

    if (this.mixer && this.idle) this.play(this.idle, 0)
  }

  play(clip, fade = 0.28) {
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
    const state = abs < 0.055 ? 'idle' : running ? 'run' : 'walk'

    if (this.mixer && (this.walk || this.idle)) {
      const clip = state === 'idle'
        ? this.idle || this.walk
        : state === 'run'
          ? this.run || this.walk
          : this.walk || this.idle
      this.play(clip)
      this.mixer.timeScale = state === 'idle'
        ? 0.82
        : state === 'run'
          ? 1.04
          : clamp(0.7 + abs * 0.09, 0.74, 1.02)
      this.mixer.update(dt)
      return
    }

    if (!this.hasManualLegs) return

    // Restrained pedestrian fallback: smaller stride and shoulder motion than a
    // game/combat cycle, with just enough torso/head counter-motion to feel alive.
    this.phase += dt * (running ? 6.55 : 4.45) * clamp(0.44 + abs / 3.25, 0.44, 1.2)
    const swing = abs > 0.055 ? Math.sin(this.phase) : 0
    const stride = running ? 0.54 : 0.34
    const kneeL = Math.max(0, -swing)
    const kneeR = Math.max(0, swing)

    easeBone(this.rig.leftUpLeg, this.bind.leftUpLeg, swing * stride)
    easeBone(this.rig.rightUpLeg, this.bind.rightUpLeg, -swing * stride)
    easeBone(this.rig.leftLeg, this.bind.leftLeg, -kneeL * (running ? 0.68 : 0.4))
    easeBone(this.rig.rightLeg, this.bind.rightLeg, -kneeR * (running ? 0.68 : 0.4))
    easeBone(this.rig.leftArm, this.bind.leftArm, -swing * (running ? 0.38 : 0.23))
    easeBone(this.rig.rightArm, this.bind.rightArm, swing * (running ? 0.38 : 0.23))
    easeBone(this.rig.leftForeArm, this.bind.leftForeArm, -0.08 - kneeR * 0.14)
    easeBone(this.rig.rightForeArm, this.bind.rightForeArm, -0.08 - kneeL * 0.14)
    easeBone(this.rig.spine, this.bind.spine, 0, 0, abs > 0.055 ? -swing * 0.012 : 0)
    easeBone(this.rig.head, this.bind.head, 0, abs > 0.055 ? swing * 0.009 : Math.sin(this.phase * 0.18) * 0.012, 0)
  }

  dispose() {
    this.mixer?.stopAllAction()
  }
}

async function loadSource(loader, source) {
  const gltf = await loader.loadAsync(source.url)
  const analysis = inspectTemplate(gltf.scene, gltf.animations || [])
  return {
    source,
    scene: gltf.scene,
    animations: gltf.animations || [],
    ...analysis,
  }
}

export async function loadCharacterCatalog() {
  const loader = new GLTFLoader()
  const results = await Promise.allSettled(CHARACTER_SOURCES.map((source) => loadSource(loader, source)))
  const catalog = results.filter((result) => result.status === 'fulfilled').map((result) => result.value)
  if (!catalog.length) throw new Error('No civilian production character asset could be loaded.')
  return catalog
}

export function pickCharacterTemplate(catalog, role = 'traveler', index = 0) {
  const needsMotion = role !== 'operator'
  const available = needsMotion
    ? catalog.filter((template) => template.motionCapable)
    : catalog
  const pool = available.length ? available : catalog

  const preferences = role === 'traveler'
    ? ['realistic-male', 'realistic-female', 'default-civilian', 'michelle-civilian']
    : role === 'operator'
      ? ['realistic-female', 'realistic-male', 'default-civilian', 'michelle-civilian']
      : index % 2 === 0
        ? ['realistic-female', 'realistic-male', 'default-civilian', 'michelle-civilian']
        : ['realistic-male', 'realistic-female', 'michelle-civilian', 'default-civilian']

  const ordered = preferences
    .map((id) => pool.find((template) => template.source.id === id))
    .filter(Boolean)

  return ordered[index % Math.max(1, ordered.length)] || pool[index % pool.length]
}

export function attachCharacterAsset(root, template, { phase = 0, variant = 0 } = {}) {
  if (!template) return null
  const model = SkeletonUtils.clone(template.scene)
  normalizeModel(model, template.source)
  varyClothing(model, variant)

  const proceduralRig = root.userData?.rig?.rig
  if (proceduralRig) proceduralRig.visible = false

  model.position.z = 0
  root.add(model)

  const controller = new CharacterAssetController(root, model, template.animations, { phase })
  root.userData.realHuman = controller
  root.userData.assetModel = model
  root.userData.assetSource = template.source.id
  return controller
}
