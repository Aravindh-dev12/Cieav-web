import * as THREE from 'three/webgpu'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js'
import { terrainHeightAt } from './WorldScenes.js'

// Poly Haven CC0 real-world street furniture. These load progressively and the
// local procedural versions remain as instant fallbacks on slow/low-memory devices.
const SOURCES = {
  lamp: [
    'https://dl.polyhaven.org/file/ph-assets/Models/gltf/1k/street_lamp_02/street_lamp_02_1k.gltf',
    'https://dl.polyhaven.org/file/ph-assets/Models/gltf/1k/street_lamp_02/street_lamp_02.gltf',
  ],
  seating: [
    'https://dl.polyhaven.org/file/ph-assets/Models/gltf/1k/modular_street_seating/modular_street_seating_1k.gltf',
    'https://dl.polyhaven.org/file/ph-assets/Models/gltf/1k/modular_street_seating/modular_street_seating.gltf',
  ],
}

function canLoadStreetAssets() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  if (connection?.saveData || ['slow-2g', '2g'].includes(connection?.effectiveType)) return false
  if (navigator.deviceMemory && navigator.deviceMemory < 4) return false
  return window.innerWidth >= 760
}

function tuneModel(root) {
  root.traverse((object) => {
    if (!object.isMesh) return
    object.castShadow = true
    object.receiveShadow = true
    object.frustumCulled = true
    const list = Array.isArray(object.material) ? object.material : [object.material]
    list.forEach((material) => {
      if (!material) return
      if ('envMapIntensity' in material) material.envMapIntensity = 0.82
      if ('roughness' in material) material.roughness = Math.max(0.3, material.roughness ?? 0.65)
      material.needsUpdate = true
    })
  })
}

function normalizeHeight(root, targetHeight) {
  root.position.set(0, 0, 0)
  root.scale.set(1, 1, 1)
  root.updateMatrixWorld(true)
  let box = new THREE.Box3().setFromObject(root)
  const size = box.getSize(new THREE.Vector3())
  root.scale.setScalar(targetHeight / Math.max(size.y, 0.001))
  root.updateMatrixWorld(true)
  box = new THREE.Box3().setFromObject(root)
  root.position.y -= box.min.y
}

function normalizeWidth(root, targetWidth) {
  root.position.set(0, 0, 0)
  root.scale.set(1, 1, 1)
  root.updateMatrixWorld(true)
  let box = new THREE.Box3().setFromObject(root)
  const size = box.getSize(new THREE.Vector3())
  root.scale.setScalar(targetWidth / Math.max(size.x, size.z, 0.001))
  root.updateMatrixWorld(true)
  box = new THREE.Box3().setFromObject(root)
  root.position.y -= box.min.y
}

async function loadFirst(loader, candidates) {
  let lastError = null
  for (const url of candidates) {
    try {
      const gltf = await loader.loadAsync(url)
      return gltf.scene
    } catch (error) {
      lastError = error
    }
  }
  throw lastError || new Error('Street asset unavailable.')
}

function hideProceduralLamps(runtime) {
  const hidden = []
  runtime.outdoor.group.traverse((object) => {
    if (!object.isPointLight || !object.parent || object.parent === runtime.outdoor.group) return
    const parent = object.parent
    if (parent.userData?.realStreetAsset) return
    if (!hidden.includes(parent)) {
      parent.visible = false
      hidden.push(parent)
    }
  })
  return hidden
}

export async function attachStreetAssets(runtime) {
  if (!canLoadStreetAssets()) return null
  const loader = new GLTFLoader()
  const [lampResult, seatingResult] = await Promise.allSettled([
    loadFirst(loader, SOURCES.lamp),
    loadFirst(loader, SOURCES.seating),
  ])

  if (lampResult.status !== 'fulfilled' && seatingResult.status !== 'fulfilled') return null

  const root = new THREE.Group()
  root.name = 'cc0-real-street-assets'
  root.userData.realStreetAsset = true
  runtime.outdoor.group.add(root)

  const hidden = lampResult.status === 'fulfilled' ? hideProceduralLamps(runtime) : []

  if (lampResult.status === 'fulfilled') {
    const template = lampResult.value
    tuneModel(template)
    normalizeHeight(template, 3.35)

    const placements = [
      [17, 7.2],
      [31.4, 7.0],
      [48, 7.2],
      [62, 7.0],
    ]

    placements.forEach(([x, z], index) => {
      const lamp = index === 0 ? template : SkeletonUtils.clone(template)
      lamp.position.x += x
      lamp.position.y += terrainHeightAt(x)
      lamp.position.z += z
      lamp.rotation.y = (index % 2) * 0.08
      lamp.name = `real-street-lamp-${index}`
      lamp.userData.realStreetAsset = true

      const glow = new THREE.PointLight(0xffdda3, 2.4, 8.5, 2)
      glow.position.set(0, 3.12, 0)
      glow.castShadow = false
      lamp.add(glow)
      root.add(lamp)
    })
  }

  if (seatingResult.status === 'fulfilled') {
    const template = seatingResult.value
    tuneModel(template)
    normalizeWidth(template, 2.15)

    // Additional seating is placed away from the instant fallback benches so the
    // richer asset adds density instead of z-fighting with the local geometry.
    const placements = [
      [38.0, 1.18, 6.32, 0],
      [65.0, 1.18, 6.32, Math.PI],
    ]

    placements.forEach(([x, y, z, rotation], index) => {
      const seat = index === 0 ? template : SkeletonUtils.clone(template)
      seat.position.x += x
      seat.position.y += y
      seat.position.z += z
      seat.rotation.y = rotation
      seat.name = `real-street-seating-${index}`
      seat.userData.realStreetAsset = true
      root.add(seat)
    })
  }

  runtime.realStreetAssets = { root, hidden }
  return runtime.realStreetAssets
}

export function removeStreetAssets(runtime) {
  const assets = runtime.realStreetAssets
  if (!assets) return
  assets.root?.parent?.remove(assets.root)
  for (const object of assets.hidden || []) object.visible = true
  runtime.realStreetAssets = null
}
