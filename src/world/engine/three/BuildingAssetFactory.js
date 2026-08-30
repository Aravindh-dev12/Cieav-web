import * as THREE from 'three/webgpu'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js'

// Poly Haven assets are CC0. The model is intentionally loaded as a progressive
// visual layer; the local CIEAV geometry remains the interaction/collision shell.
const ARCHITECTURE_CANDIDATES = [
  'https://dl.polyhaven.org/file/ph-assets/Models/gltf/1k/modular_urban_apartments_facade/modular_urban_apartments_facade_1k.gltf',
  'https://dl.polyhaven.org/file/ph-assets/Models/gltf/1k/modular_urban_apartments_facade/modular_urban_apartments_facade.gltf',
]

function canLoadHeavyArchitecture() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  if (connection?.saveData) return false
  if (['slow-2g', '2g'].includes(connection?.effectiveType)) return false
  if (navigator.deviceMemory && navigator.deviceMemory < 4) return false
  return window.innerWidth >= 760
}

function setPhotorealMeshDefaults(root) {
  root.traverse((object) => {
    if (!object.isMesh) return
    object.castShadow = true
    object.receiveShadow = true
    object.frustumCulled = true
    const list = Array.isArray(object.material) ? object.material : [object.material]
    list.forEach((material) => {
      if (!material) return
      if ('envMapIntensity' in material) material.envMapIntensity = 1.2
      if ('roughness' in material) material.roughness = Math.max(0.18, material.roughness ?? 0.55)
      material.needsUpdate = true
    })
  })
}

function normalizeToWidth(root, targetWidth) {
  root.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(root)
  const size = box.getSize(new THREE.Vector3())
  const scale = targetWidth / Math.max(size.x, size.z, 0.001)
  root.scale.setScalar(scale)
  root.updateMatrixWorld(true)

  const scaledBox = new THREE.Box3().setFromObject(root)
  root.position.y -= scaledBox.min.y
}

async function loadFirstArchitecture() {
  const loader = new GLTFLoader()
  let lastError = null
  for (const url of ARCHITECTURE_CANDIDATES) {
    try {
      const gltf = await loader.loadAsync(url)
      return { scene: gltf.scene, url }
    } catch (error) {
      lastError = error
    }
  }
  throw lastError || new Error('Architecture asset could not be loaded.')
}

export async function attachHighDetailArchitecture(runtime) {
  if (!canLoadHeavyArchitecture()) return null

  const { scene, url } = await loadFirstArchitecture()
  setPhotorealMeshDefaults(scene)
  normalizeToWidth(scene, 15.5)

  // Use the real facade as the deep architectural mass behind CIEAV's authored
  // entrance shell. This keeps the interactive door aligned while replacing the
  // simplistic skyline with actual modeled facade detail.
  scene.position.x += 40.2
  scene.position.y += 1.18
  scene.position.z += -4.1
  scene.rotation.y = Math.PI
  scene.name = 'cc0-high-detail-architecture'
  runtime.outdoor.group.add(scene)

  // Reuse the loaded asset for a distant campus wing without duplicating buffers.
  const wing = SkeletonUtils.clone(scene)
  wing.position.set(60.2, 1.18, -10.8)
  wing.rotation.y = Math.PI * 0.96
  wing.scale.multiplyScalar(0.78)
  wing.name = 'cc0-high-detail-campus-wing'
  runtime.outdoor.group.add(wing)

  runtime.highDetailArchitecture = { scene, wing, url }
  return runtime.highDetailArchitecture
}

export function removeHighDetailArchitecture(runtime) {
  const assets = runtime.highDetailArchitecture
  if (!assets) return
  assets.scene?.parent?.remove(assets.scene)
  assets.wing?.parent?.remove(assets.wing)
  runtime.highDetailArchitecture = null
}
