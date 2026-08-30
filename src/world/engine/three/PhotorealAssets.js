import * as THREE from 'three/webgpu'

const PH = 'https://dl.polyhaven.org/file/ph-assets'

function preferredTextureResolution() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  if (connection?.saveData || ['slow-2g', '2g'].includes(connection?.effectiveType)) return '1k'
  const memory = navigator.deviceMemory || 4
  const wide = window.innerWidth >= 1180
  const dense = (window.devicePixelRatio || 1) >= 1.25
  return memory >= 6 && wide && dense ? '2k' : '1k'
}

function textureUrl(asset, suffix, resolution) {
  return `${PH}/Textures/jpg/${resolution}/${asset}/${asset}_${suffix}_${resolution}.jpg`
}

function assetSets(resolution) {
  return {
    asphalt: {
      map: textureUrl('asphalt_01', 'diff', resolution),
      normalMap: textureUrl('asphalt_01', 'nor_gl', resolution),
      roughnessMap: textureUrl('asphalt_01', 'rough', resolution),
    },
    concrete: {
      map: textureUrl('concrete', 'diff', resolution),
      normalMap: textureUrl('concrete', 'nor_gl', resolution),
      roughnessMap: textureUrl('concrete', 'rough', resolution),
    },
    cladding: {
      map: textureUrl('exterior_wall_cladding', 'diff', resolution),
      normalMap: textureUrl('exterior_wall_cladding', 'nor_gl', resolution),
      roughnessMap: textureUrl('exterior_wall_cladding', 'rough', resolution),
    },
  }
}

function loadTexture(loader, url, color = false) {
  return loader.loadAsync(url).then((texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.anisotropy = Math.min(12, texture.anisotropy || 12)
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
  material.roughness = 0.9
  material.metalness = Math.min(material.metalness ?? 0, 0.06)
  material.color?.setHex?.(tint)
  if (repeat) Object.values(set).forEach((texture) => texture.repeat.set(...repeat))
  material.needsUpdate = true
}

function improveGlass(material) {
  if (!material?.isMeshPhysicalMaterial || material.transmission <= 0) return
  material.roughness = 0.11
  material.transmission = Math.max(material.transmission, 0.44)
  material.ior = 1.48
  material.thickness = Math.max(material.thickness || 0, 0.1)
  material.clearcoat = 0.62
  material.clearcoatRoughness = 0.1
  material.envMapIntensity = 0.28
  material.needsUpdate = true
}

function removeLegacyPhotoBackdrops(runtime) {
  const removals = []

  runtime.outdoor?.group?.traverse((object) => {
    if (!object.isMesh || !object.geometry || !object.material) return
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    const hasPhotoMap = materials.some((material) => Boolean(material?.map))
    const hasBackSide = materials.some((material) => material?.side === THREE.BackSide)

    const sphere = object.geometry.boundingSphere || (() => {
      object.geometry.computeBoundingSphere?.()
      return object.geometry.boundingSphere
    })()
    if (hasPhotoMap && hasBackSide && (sphere?.radius || 0) > 25) removals.push(object)
  })

  removals.forEach((object) => {
    object.parent?.remove(object)
    object.geometry?.dispose?.()
    const list = Array.isArray(object.material) ? object.material : [object.material]
    list.forEach((material) => {
      material?.map?.dispose?.()
      material?.dispose?.()
    })
  })
}

function tuneLighting(runtime) {
  runtime.scene.background = new THREE.Color(0xd0d8d2)
  if ('backgroundNode' in runtime.scene) runtime.scene.backgroundNode = null
  runtime.scene.fog.color.set(0xd0d8d2)
  runtime.scene.fog.density = 0.0105
  runtime.renderer.toneMappingExposure = 0.96

  if (runtime.renderer.shadowMap) {
    runtime.renderer.shadowMap.enabled = true
    if (THREE.PCFSoftShadowMap !== undefined) runtime.renderer.shadowMap.type = THREE.PCFSoftShadowMap
  }

  runtime.scene.traverse((object) => {
    if (object.isHemisphereLight) {
      object.intensity = Math.min(object.intensity, 1.75)
      object.color.set(0xe8f0ed)
      object.groundColor.set(0x586058)
    }

    if (object.isDirectionalLight) {
      object.intensity = Math.min(object.intensity, 3.35)
      object.color.set(0xfff2dc)
      if (object.shadow) {
        object.shadow.mapSize.set(2048, 2048)
        object.shadow.bias = -0.00035
        object.shadow.normalBias = 0.025
        object.shadow.camera.near = 1
        object.shadow.camera.far = 90
        object.shadow.camera.left = -30
        object.shadow.camera.right = 30
        object.shadow.camera.top = 24
        object.shadow.camera.bottom = -18
      }
    }
  })

  // Cool skylight from the opposite side prevents black CG shadows without
  // flattening the sun direction.
  const fill = new THREE.DirectionalLight(0xb9d2df, 0.58)
  fill.position.set(-18, 11, -9)
  fill.castShadow = false
  runtime.outdoor.group.add(fill)

  // Local entrance light makes faces and glazing read naturally near the door.
  const entrance = new THREE.SpotLight(0xffdfad, 11, 14, Math.PI / 5, 0.65, 1.45)
  entrance.position.set(44.1, 6.4, 7.2)
  entrance.target.position.set(44.0, 1.65, 4.25)
  entrance.castShadow = true
  entrance.shadow.mapSize.set(1024, 1024)
  entrance.shadow.bias = -0.0002
  runtime.outdoor.group.add(entrance, entrance.target)

  const interiorFill = new THREE.PointLight(0xffe7c4, 7.5, 15, 2)
  interiorFill.position.set(12.5, 4.4, 0.6)
  interiorFill.castShadow = false
  runtime.interior.group.add(interiorFill)

  runtime.photorealLights = [fill, entrance, entrance.target, interiorFill]
}

export async function applyPhotorealWorld(runtime) {
  removeLegacyPhotoBackdrops(runtime)
  runtime.scene.environment = null
  tuneLighting(runtime)

  const resolution = preferredTextureResolution()
  const assets = assetSets(resolution)
  const loader = new THREE.TextureLoader()
  const [asphalt, concrete, cladding] = await Promise.all([
    loadSet(loader, assets.asphalt, [5, 3]).catch(() => null),
    loadSet(loader, assets.concrete, [2.6, 2.6]).catch(() => null),
    loadSet(loader, assets.cladding, [2.2, 2.2]).catch(() => null),
  ])

  runtime.photorealResources = runtime.photorealResources || []
  ;[asphalt, concrete, cladding].forEach((set) => {
    if (set) runtime.photorealResources.push(...Object.values(set))
  })

  const pathColors = new Set([0xb8ad99, 0x8f8677, 0x989083, 0x7f7768])
  const concreteColors = new Set([0x777e79, 0x515955, 0x7a817c, 0x6f7772, 0x66726c])

  runtime.outdoor.group.traverse((object) => {
    if (!object.isMesh || !object.material) return
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    materials.forEach((material) => {
      const hex = materialHex(material)
      if (pathColors.has(hex)) applyTextureSet(material, asphalt, { repeat: [4.5, 2.5], normalScale: 0.72 })
      if (concreteColors.has(hex)) applyTextureSet(material, concrete, { repeat: [2.4, 2.4], normalScale: 0.96 })
      if (hex === 0x777e79 || hex === 0x515955) {
        applyTextureSet(material, cladding || concrete, { repeat: [1.8, 2.2], normalScale: 0.82 })
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
          normalScale: 0.62,
          tint: 0xbec3be,
        })
      }
      improveGlass(material)
    })
  })

  return { asphalt, concrete, cladding, resolution }
}

export function disposePhotorealResources(runtime) {
  for (const resource of runtime.photorealResources || []) resource?.dispose?.()
  runtime.photorealResources = []

  for (const light of runtime.photorealLights || []) light?.parent?.remove(light)
  runtime.photorealLights = []

  if (runtime?.scene) runtime.scene.environment = null
}
