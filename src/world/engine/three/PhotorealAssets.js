import * as THREE from 'three/webgpu'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js'

const PH = 'https://dl.polyhaven.org/file/ph-assets'

const ASSETS = {
  hdri: `${PH}/HDRIs/hdr/1k/urban_street_01_1k.hdr`,
  backplate: `${PH}/HDRIs/extra/Tonemapped%20JPG/urban_street_01.jpg`,
  asphalt: {
    map: `${PH}/Textures/jpg/1k/asphalt_01/asphalt_01_diff_1k.jpg`,
    normalMap: `${PH}/Textures/jpg/1k/asphalt_01/asphalt_01_nor_gl_1k.jpg`,
    roughnessMap: `${PH}/Textures/jpg/1k/asphalt_01/asphalt_01_rough_1k.jpg`,
  },
  concrete: {
    map: `${PH}/Textures/jpg/1k/concrete/concrete_diff_1k.jpg`,
    normalMap: `${PH}/Textures/jpg/1k/concrete/concrete_nor_gl_1k.jpg`,
    roughnessMap: `${PH}/Textures/jpg/1k/concrete/concrete_rough_1k.jpg`,
  },
  cladding: {
    map: `${PH}/Textures/jpg/1k/exterior_wall_cladding/exterior_wall_cladding_diff_1k.jpg`,
    normalMap: `${PH}/Textures/jpg/1k/exterior_wall_cladding/exterior_wall_cladding_nor_gl_1k.jpg`,
    roughnessMap: `${PH}/Textures/jpg/1k/exterior_wall_cladding/exterior_wall_cladding_rough_1k.jpg`,
  },
}

const HUMAN_SOURCES = [
  'https://three.ws/avatars/michelle.glb',
  'https://raw.githubusercontent.com/UMRAM-Bilkent/supine-human-model/main/assets/human.glb',
]

function loadTexture(loader, url, color = false) {
  return loader.loadAsync(url).then((texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.anisotropy = 8
    if (color) texture.colorSpace = THREE.SRGBColorSpace
    return texture
  })
}

async function loadSet(loader, urls, repeat = [4, 4]) {
  const entries = await Promise.all(
    Object.entries(urls).map(async ([key, url]) => [key, await loadTexture(loader, url, key === 'map')]),
  )
  const set = Object.fromEntries(entries)
  Object.values(set).forEach((texture) => texture.repeat.set(...repeat))
  return set
}

function materialHex(material) {
  return material?.color?.isColor ? material.color.getHex() : null
}

function applyTextureSet(material, set, { repeat = null, normalScale = 0.8, tint = 0xffffff } = {}) {
  if (!material?.isMaterial || !set) return
  material.map = set.map
  material.normalMap = set.normalMap
  material.roughnessMap = set.roughnessMap
  material.normalScale?.set?.(normalScale, normalScale)
  material.roughness = 0.92
  material.metalness = Math.min(material.metalness ?? 0, 0.08)
  material.color?.setHex?.(tint)
  if (repeat) Object.values(set).forEach((texture) => texture.repeat.set(...repeat))
  material.needsUpdate = true
}

export async function applyPhotorealWorld(runtime) {
  const loader = new THREE.TextureLoader()
  const [asphalt, concrete, cladding] = await Promise.all([
    loadSet(loader, ASSETS.asphalt, [5, 3]).catch(() => null),
    loadSet(loader, ASSETS.concrete, [2.6, 2.6]).catch(() => null),
    loadSet(loader, ASSETS.cladding, [2.2, 2.2]).catch(() => null),
  ])

  const pathColors = new Set([0xb8ad99, 0x8f8677, 0x989083, 0x7f7768])
  const concreteColors = new Set([0x777e79, 0x515955, 0x7a817c, 0x6f7772, 0x66726c])

  runtime.outdoor.group.traverse((object) => {
    if (!object.isMesh || !object.material) return
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    materials.forEach((material) => {
      const hex = materialHex(material)
      if (pathColors.has(hex)) applyTextureSet(material, asphalt, { repeat: [4.5, 2.5], normalScale: 0.65 })
      if (concreteColors.has(hex)) applyTextureSet(material, concrete, { repeat: [2.4, 2.4], normalScale: 0.9 })
      if (hex === 0x777e79 || hex === 0x515955) applyTextureSet(material, cladding || concrete, { repeat: [1.8, 2.2], normalScale: 0.75 })
      if (material.isMeshPhysicalMaterial && material.transmission > 0) {
        material.roughness = 0.13
        material.transmission = Math.max(material.transmission, 0.42)
        material.ior = 1.48
        material.thickness = Math.max(material.thickness || 0, 0.08)
        material.clearcoat = 0.62
        material.clearcoatRoughness = 0.12
        material.envMapIntensity = 1.35
        material.needsUpdate = true
      }
    })
  })

  runtime.interior.group.traverse((object) => {
    if (!object.isMesh || !object.material) return
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    materials.forEach((material) => {
      const hex = materialHex(material)
      if ([0x535a55, 0x5d625d, 0x3b423e].includes(hex)) applyTextureSet(material, concrete, { repeat: [2.1, 2.1], normalScale: 0.55, tint: 0xbec3be })
      if (material.isMeshPhysicalMaterial && material.transmission > 0) {
        material.roughness = 0.1
        material.transmission = Math.max(material.transmission, 0.5)
        material.envMapIntensity = 1.4
        material.needsUpdate = true
      }
    })
  })

  try {
    const hdri = await new RGBELoader().loadAsync(ASSETS.hdri)
    hdri.mapping = THREE.EquirectangularReflectionMapping
    runtime.scene.environment = hdri
    runtime.renderer.toneMappingExposure = 0.9
    runtime.photorealResources = runtime.photorealResources || []
    runtime.photorealResources.push(hdri)
  } catch {
    // Keep authored lights if the external HDRI is unavailable.
  }

  try {
    const backplate = await loader.loadAsync(ASSETS.backplate)
    backplate.colorSpace = THREE.SRGBColorSpace
    backplate.mapping = THREE.EquirectangularReflectionMapping
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(86, 48, 28),
      new THREE.MeshBasicMaterial({ map: backplate, side: THREE.BackSide, toneMapped: false, fog: false }),
    )
    sphere.position.set(35, 4, 0)
    sphere.rotation.y = -0.42
    sphere.renderOrder = -20
    runtime.outdoor.group.add(sphere)
    runtime.photorealResources = runtime.photorealResources || []
    runtime.photorealResources.push(backplate, sphere.geometry, sphere.material)
  } catch {
    // The 3D scene remains usable without the photographic backplate.
  }

  return { asphalt, concrete, cladding }
}

async function loadFirstHuman() {
  const loader = new GLTFLoader()
  let lastError
  for (const url of HUMAN_SOURCES) {
    try {
      const gltf = await loader.loadAsync(url)
      return { gltf, url }
    } catch (error) {
      lastError = error
    }
  }
  throw lastError || new Error('No realistic humanoid asset could be loaded.')
}

function normalizeHuman(model, height = 2.72) {
  model.rotation.y = Math.PI / 2
  model.updateMatrixWorld(true)
  let box = new THREE.Box3().setFromObject(model)
  const size = box.getSize(new THREE.Vector3())
  const scale = height / Math.max(size.y, 0.001)
  model.scale.setScalar(scale)
  model.updateMatrixWorld(true)
  box = new THREE.Box3().setFromObject(model)
  model.position.y -= box.min.y
  model.traverse((object) => {
    if (object.isMesh || object.isSkinnedMesh) {
      object.castShadow = true
      object.receiveShadow = true
      const mats = Array.isArray(object.material) ? object.material : [object.material]
      mats.forEach((material) => {
        if (!material) return
        material.envMapIntensity = 1.15
        if ('roughness' in material) material.roughness = Math.max(0.42, material.roughness ?? 0.65)
        material.needsUpdate = true
      })
    }
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

function captureBone(bone) {
  return bone ? bone.rotation.clone() : null
}

function buildManualRig(model) {
  const rig = {
    leftArm: findBone(model, ['leftarm', 'upperarmleft']),
    rightArm: findBone(model, ['rightarm', 'upperarmright']),
    leftForeArm: findBone(model, ['leftforearm', 'lowerarmleft']),
    rightForeArm: findBone(model, ['rightforearm', 'lowerarmright']),
    leftUpLeg: findBone(model, ['leftupleg', 'thighleft']),
    rightUpLeg: findBone(model, ['rightupleg', 'thighright']),
    leftLeg: findBone(model, ['leftleg', 'calfleft']),
    rightLeg: findBone(model, ['rightleg', 'calfright']),
    hips: findBone(model, ['hips', 'pelvis']),
    spine: findBone(model, ['spine1', 'spine']),
    head: findBone(model, ['head']),
  }
  rig.bind = Object.fromEntries(Object.entries(rig).filter(([key]) => key !== 'bind').map(([key, bone]) => [key, captureBone(bone)]))
  return rig
}

function lerpRotation(bone, bind, x, y, z, amount = 0.18) {
  if (!bone || !bind) return
  bone.rotation.x = THREE.MathUtils.lerp(bone.rotation.x, bind.x + x, amount)
  bone.rotation.y = THREE.MathUtils.lerp(bone.rotation.y, bind.y + y, amount)
  bone.rotation.z = THREE.MathUtils.lerp(bone.rotation.z, bind.z + z, amount)
}

export class RealHumanController {
  constructor(root, model, animations = [], phase = 0) {
    this.root = root
    this.model = model
    this.phase = phase
    this.manualRig = buildManualRig(model)
    this.mixer = animations.length ? new THREE.AnimationMixer(model) : null
    this.walkClip = animations.find((clip) => /walk/i.test(clip.name)) || null
    this.runClip = animations.find((clip) => /run/i.test(clip.name)) || null
    this.idleClip = animations.find((clip) => /idle/i.test(clip.name)) || null
    this.activeAction = null
    if (this.mixer && this.idleClip) this.switchAction(this.idleClip, 0)
  }

  switchAction(clip, fade = 0.22) {
    if (!this.mixer || !clip) return
    const next = this.mixer.clipAction(clip)
    if (next === this.activeAction) return
    next.reset().play()
    if (this.activeAction) this.activeAction.crossFadeTo(next, fade, false)
    this.activeAction = next
  }

  update(dt, speed = 0, running = false) {
    const abs = Math.abs(speed)
    if (this.mixer && (this.walkClip || this.idleClip)) {
      const target = abs < 0.04 ? this.idleClip : running && this.runClip ? this.runClip : this.walkClip || this.idleClip
      this.switchAction(target)
      this.mixer.timeScale = running ? 1.22 : Math.max(0.72, Math.min(1.15, 0.72 + abs * 0.12))
      this.mixer.update(dt)
      return
    }

    this.phase += dt * (running ? 7.4 : 5.3) * Math.max(0.35, Math.min(1.35, abs / 2.7))
    const r = this.manualRig
    const moving = abs > 0.04
    const swing = moving ? Math.sin(this.phase) : 0
    const kneeL = moving ? Math.max(0, -swing) : 0
    const kneeR = moving ? Math.max(0, swing) : 0
    const stride = running ? 0.72 : 0.48
    lerpRotation(r.leftUpLeg, r.bind.leftUpLeg, swing * stride, 0, 0)
    lerpRotation(r.rightUpLeg, r.bind.rightUpLeg, -swing * stride, 0, 0)
    lerpRotation(r.leftLeg, r.bind.leftLeg, -kneeL * (running ? 0.95 : 0.62), 0, 0)
    lerpRotation(r.rightLeg, r.bind.rightLeg, -kneeR * (running ? 0.95 : 0.62), 0, 0)
    lerpRotation(r.leftArm, r.bind.leftArm, -swing * (running ? 0.62 : 0.44), 0, 0)
    lerpRotation(r.rightArm, r.bind.rightArm, swing * (running ? 0.62 : 0.44), 0, 0)
    lerpRotation(r.leftForeArm, r.bind.leftForeArm, -0.16 - kneeR * 0.34, 0, 0)
    lerpRotation(r.rightForeArm, r.bind.rightForeArm, -0.16 - kneeL * 0.34, 0, 0)
    lerpRotation(r.spine, r.bind.spine, 0, 0, moving ? -swing * 0.025 : 0)
    lerpRotation(r.head, r.bind.head, 0, moving ? swing * 0.025 : Math.sin(this.phase * 0.2) * 0.02, 0)
  }
}

export async function createRealHumanTemplate() {
  const { gltf, url } = await loadFirstHuman()
  normalizeHuman(gltf.scene)
  return { scene: gltf.scene, animations: gltf.animations || [], url }
}

export function attachRealHuman(root, template, phase = 0) {
  const model = SkeletonUtils.clone(template.scene)
  normalizeHuman(model)
  const proceduralRig = root.userData?.rig?.rig
  if (proceduralRig) proceduralRig.visible = false
  model.position.z = 0
  root.add(model)
  const controller = new RealHumanController(root, model, template.animations, phase)
  root.userData.realHuman = controller
  return controller
}

export function disposePhotorealResources(runtime) {
  for (const resource of runtime.photorealResources || []) resource?.dispose?.()
  runtime.photorealResources = []
}
