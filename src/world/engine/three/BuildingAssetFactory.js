import * as THREE from 'three/webgpu'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js'

// CC0 Poly Haven architecture. These are progressive visual layers only; the
// authored CIEAV meshes stay as the lightweight collision/interaction shell.
const ARCHITECTURE_SOURCES = {
  primary: [
    'https://dl.polyhaven.org/file/ph-assets/Models/gltf/1k/modular_factory_facade/modular_factory_facade_1k.gltf',
    'https://dl.polyhaven.org/file/ph-assets/Models/gltf/1k/modular_factory_facade/modular_factory_facade.gltf',
  ],
  campus: [
    'https://dl.polyhaven.org/file/ph-assets/Models/gltf/1k/modular_urban_apartments_facade/modular_urban_apartments_facade_1k.gltf',
    'https://dl.polyhaven.org/file/ph-assets/Models/gltf/1k/modular_urban_apartments_facade/modular_urban_apartments_facade.gltf',
  ],
}

function canLoadHeavyArchitecture() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  if (connection?.saveData) return false
  if (['slow-2g', '2g'].includes(connection?.effectiveType)) return false
  if (navigator.deviceMemory && navigator.deviceMemory < 4) return false
  return window.innerWidth >= 760
}

function tuneMaterial(material, name = '') {
  if (!material) return
  const lower = `${name} ${material.name || ''}`.toLowerCase()
  const glassLike = /glass|window/.test(lower) || material.transparent || (material.opacity ?? 1) < 0.98
  const metalLike = /metal|steel|aluminium|aluminum|iron|trim|frame/.test(lower)

  if ('envMapIntensity' in material) material.envMapIntensity = glassLike ? 1.15 : 0.78
  if ('roughness' in material) {
    if (glassLike) material.roughness = Math.min(material.roughness ?? 0.18, 0.24)
    else if (metalLike) material.roughness = Math.max(0.28, Math.min(material.roughness ?? 0.52, 0.68))
    else material.roughness = Math.max(0.48, material.roughness ?? 0.66)
  }
  if ('metalness' in material && metalLike) material.metalness = Math.max(material.metalness ?? 0, 0.42)
  material.needsUpdate = true
}

function setPhotorealMeshDefaults(root) {
  root.traverse((object) => {
    if (!object.isMesh) return
    object.castShadow = true
    object.receiveShadow = true
    object.frustumCulled = true
    const list = Array.isArray(object.material) ? object.material : [object.material]
    list.forEach((material) => tuneMaterial(material, object.name))
  })
}

function normalizeToWidth(root, targetWidth) {
  root.position.set(0, 0, 0)
  root.rotation.set(0, 0, 0)
  root.scale.set(1, 1, 1)
  root.updateMatrixWorld(true)

  const box = new THREE.Box3().setFromObject(root)
  const size = box.getSize(new THREE.Vector3())
  const horizontal = Math.max(size.x, size.z, 0.001)
  const scale = targetWidth / horizontal
  root.scale.setScalar(scale)
  root.updateMatrixWorld(true)

  const scaledBox = new THREE.Box3().setFromObject(root)
  root.position.y -= scaledBox.min.y
}

async function loadFirst(loader, candidates) {
  let lastError = null
  for (const url of candidates) {
    try {
      const gltf = await loader.loadAsync(url)
      return { scene: gltf.scene, url }
    } catch (error) {
      lastError = error
    }
  }
  throw lastError || new Error('Architecture asset could not be loaded.')
}

function placePrimaryFacade(scene) {
  setPhotorealMeshDefaults(scene)
  normalizeToWidth(scene, 15.2)

  // Sit just behind the authored entrance shell so the interactive glass door,
  // steps and security reader still align exactly with runtime collision logic.
  scene.position.x += 40.35
  scene.position.y += 1.18
  scene.position.z += -4.85
  scene.rotation.y = Math.PI
  scene.name = 'cc0-cieav-factory-facade'
  return scene
}

function placeCampusFacade(scene) {
  setPhotorealMeshDefaults(scene)
  normalizeToWidth(scene, 17.8)
  scene.position.set(60.5, 1.18, -11.9)
  scene.rotation.y = Math.PI * 0.96
  scene.name = 'cc0-urban-campus-facade'
  return scene
}

export async function attachHighDetailArchitecture(runtime) {
  if (!canLoadHeavyArchitecture()) return null

  const loader = new GLTFLoader()
  const [primaryResult, campusResult] = await Promise.allSettled([
    loadFirst(loader, ARCHITECTURE_SOURCES.primary),
    window.innerWidth >= 1050
      ? loadFirst(loader, ARCHITECTURE_SOURCES.campus)
      : Promise.reject(new Error('Secondary facade skipped on compact viewport.')),
  ])

  let primary = null
  let campus = null
  let primaryUrl = null
  let campusUrl = null

  if (primaryResult.status === 'fulfilled') {
    primary = placePrimaryFacade(primaryResult.value.scene)
    primaryUrl = primaryResult.value.url
    runtime.outdoor.group.add(primary)
  }

  if (campusResult.status === 'fulfilled') {
    campus = placeCampusFacade(campusResult.value.scene)
    campusUrl = campusResult.value.url
    runtime.outdoor.group.add(campus)
  } else if (primary) {
    // If the second source is unavailable, a distant clone still gives the campus
    // architectural depth without making the foreground look duplicated.
    campus = SkeletonUtils.clone(primary)
    campus.position.set(61.5, 1.18, -12.6)
    campus.rotation.y = Math.PI * 0.94
    campus.scale.multiplyScalar(0.78)
    campus.name = 'cc0-distant-campus-fallback'
    runtime.outdoor.group.add(campus)
  }

  if (!primary && !campus) return null

  runtime.highDetailArchitecture = {
    primary,
    campus,
    primaryUrl,
    campusUrl,
  }
  return runtime.highDetailArchitecture
}

export function removeHighDetailArchitecture(runtime) {
  const assets = runtime.highDetailArchitecture
  if (!assets) return
  assets.primary?.parent?.remove(assets.primary)
  assets.campus?.parent?.remove(assets.campus)
  runtime.highDetailArchitecture = null
}
