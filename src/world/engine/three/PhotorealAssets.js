import * as THREE from 'three/webgpu'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'

const PH = 'https://dl.polyhaven.org/file/ph-assets'

const ASSETS = {
  // HDRI is used for lighting/reflections only. It is intentionally NOT shown
  // as a photographic background because a sharp real photo behind realtime
  // geometry breaks scale, perspective and depth cues.
  hdri: `${PH}/HDRIs/hdr/1k/urban_street_01_1k.hdr`,
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

function improveGlass(material) {
  if (!material?.isMeshPhysicalMaterial || material.transmission <= 0) return
  material.roughness = 0.14
  material.transmission = Math.max(material.transmission, 0.4)
  material.ior = 1.48
  material.thickness = Math.max(material.thickness || 0, 0.08)
  material.clearcoat = 0.55
  material.clearcoatRoughness = 0.14
  material.envMapIntensity = 1.25
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
      if (hex === 0x777e79 || hex === 0x515955) {
        applyTextureSet(material, cladding || concrete, { repeat: [1.8, 2.2], normalScale: 0.75 })
      }
      improveGlass(material)
    })
  })

  runtime.interior.group.traverse((object) => {
    if (!object.isMesh || !object.material) return
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    materials.forEach((material) => {
      const hex = materialHex(material)
      if ([0x535a55, 0x5d625d, 0x3b423e].includes(hex)) {
        applyTextureSet(material, concrete, {
          repeat: [2.1, 2.1],
          normalScale: 0.55,
          tint: 0xbec3be,
        })
      }
      improveGlass(material)
    })
  })

  try {
    const hdri = await new RGBELoader().loadAsync(ASSETS.hdri)
    hdri.mapping = THREE.EquirectangularReflectionMapping
    runtime.scene.environment = hdri
    runtime.renderer.toneMappingExposure = 0.92
    runtime.photorealResources = runtime.photorealResources || []
    runtime.photorealResources.push(hdri)
  } catch {
    // Authored realtime lights remain active if external HDR lighting is unavailable.
  }

  // Keep a coherent realtime background. Distant 3D architecture and fog now
  // provide depth instead of a mismatched photographic street panorama.
  runtime.scene.background = new THREE.Color(0xbfc9c1)
  runtime.scene.fog.color.set(0xbfc9c1)

  return { asphalt, concrete, cladding }
}

export function disposePhotorealResources(runtime) {
  for (const resource of runtime.photorealResources || []) resource?.dispose?.()
  runtime.photorealResources = []
}
