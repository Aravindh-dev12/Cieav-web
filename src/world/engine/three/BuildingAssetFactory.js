import * as THREE from 'three/webgpu'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js'

// CC0 Poly Haven facade modules are used as genuine high-frequency architectural
// detail. Complete building envelopes are constructed around them so the campus
// reads as full architecture from every camera angle rather than flat set pieces.
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

  if ('envMapIntensity' in material) material.envMapIntensity = glassLike ? 1.32 : 0.86
  if ('roughness' in material) {
    if (glassLike) material.roughness = Math.min(material.roughness ?? 0.16, 0.22)
    else if (metalLike) material.roughness = Math.max(0.26, Math.min(material.roughness ?? 0.5, 0.64))
    else material.roughness = Math.max(0.46, material.roughness ?? 0.64)
  }
  if ('metalness' in material && metalLike) material.metalness = Math.max(material.metalness ?? 0, 0.46)
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

function box(parent, size, position, material, { cast = true, receive = true } = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material)
  mesh.position.set(...position)
  mesh.castShadow = cast
  mesh.receiveShadow = receive
  parent.add(mesh)
  return mesh
}

function createEnvelopeMaterials() {
  return {
    concrete: new THREE.MeshStandardMaterial({ color: 0xb9b7ae, roughness: 0.78, metalness: 0.03, envMapIntensity: 0.72 }),
    concreteDark: new THREE.MeshStandardMaterial({ color: 0x555b59, roughness: 0.7, metalness: 0.08, envMapIntensity: 0.76 }),
    metal: new THREE.MeshStandardMaterial({ color: 0x242a2b, roughness: 0.38, metalness: 0.64, envMapIntensity: 1.0 }),
    timber: new THREE.MeshStandardMaterial({ color: 0x75543b, roughness: 0.72, metalness: 0.01, envMapIntensity: 0.58 }),
    timberDark: new THREE.MeshStandardMaterial({ color: 0x4d392b, roughness: 0.8, metalness: 0.01, envMapIntensity: 0.5 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0x9db1b7,
      roughness: 0.12,
      metalness: 0,
      transmission: 0.44,
      thickness: 0.08,
      ior: 1.47,
      transparent: true,
      opacity: 0.58,
      depthWrite: false,
      envMapIntensity: 1.45,
      clearcoat: 0.38,
      clearcoatRoughness: 0.18,
    }),
    warmGlass: new THREE.MeshPhysicalMaterial({
      color: 0xc2b7a6,
      roughness: 0.16,
      metalness: 0,
      transmission: 0.36,
      thickness: 0.1,
      ior: 1.47,
      transparent: true,
      opacity: 0.62,
      depthWrite: false,
      envMapIntensity: 1.25,
      clearcoat: 0.3,
    }),
  }
}

function addCurtainWall(group, { width, height, z, baseY, materials, entranceGap = 0, bays = 8, levels = 3 }) {
  const bayWidth = width / bays
  const levelHeight = height / levels
  const frontZ = z

  for (let level = 0; level < levels; level += 1) {
    const y = baseY + levelHeight * (level + 0.5)
    for (let bay = 0; bay < bays; bay += 1) {
      const x = -width / 2 + bayWidth * (bay + 0.5)
      if (level === 0 && entranceGap > 0 && Math.abs(x) < entranceGap / 2) continue
      box(group, [bayWidth * 0.84, levelHeight * 0.72, 0.08], [x, y, frontZ], materials.glass, { cast: false })
    }
  }

  for (let bay = 0; bay <= bays; bay += 1) {
    const x = -width / 2 + bayWidth * bay
    box(group, [0.085, height + 0.2, 0.14], [x, baseY + height / 2, frontZ + 0.02], materials.metal)
  }
  for (let level = 0; level <= levels; level += 1) {
    const y = baseY + levelHeight * level
    box(group, [width + 0.15, 0.1, 0.14], [0, y, frontZ + 0.02], materials.metal)
  }
}

function addTimberFins(group, { width, height, z, baseY, materials, count = 8, depth = 0.48 }) {
  const spacing = width / Math.max(1, count - 1)
  for (let i = 0; i < count; i += 1) {
    const x = -width / 2 + spacing * i
    box(group, [0.16, height, depth], [x, baseY + height / 2, z], i % 2 ? materials.timber : materials.timberDark)
  }
}

function createModernBuildingShell({
  name,
  position,
  width,
  height,
  depth,
  levels = 3,
  bays = 8,
  entranceGap = 0,
  timber = false,
  terrace = false,
  materials,
}) {
  const group = new THREE.Group()
  group.name = name
  group.position.set(...position)

  const slab = 0.22
  const wall = 0.22
  const frontZ = depth / 2
  const backZ = -depth / 2

  // Full depth and volume: rear/side walls, roof and floor slabs give silhouettes
  // and parallax from every camera angle rather than a single facade card.
  box(group, [width, height, wall], [0, height / 2, backZ], materials.concreteDark)
  box(group, [wall, height, depth], [-width / 2, height / 2, 0], materials.concrete)
  box(group, [wall, height, depth], [width / 2, height / 2, 0], materials.concrete)
  box(group, [width + 0.42, 0.28, depth + 0.42], [0, height + 0.14, 0], materials.metal)

  for (let level = 0; level <= levels; level += 1) {
    const y = Math.min(height, level * (height / levels))
    box(group, [width, slab, depth], [0, y, 0], materials.concreteDark)
  }

  addCurtainWall(group, {
    width: width - 0.35,
    height: height - 0.5,
    z: frontZ + 0.05,
    baseY: 0.26,
    materials,
    entranceGap,
    bays,
    levels,
  })

  if (timber) {
    addTimberFins(group, {
      width: width - 1.2,
      height: height - 1.1,
      z: frontZ + 0.42,
      baseY: 0.48,
      materials,
      count: Math.max(6, Math.floor(bays * 0.8)),
      depth: 0.52,
    })
  }

  if (entranceGap > 0) {
    const entranceHeight = Math.min(3.15, height * 0.46)
    box(group, [entranceGap + 0.9, 0.18, 2.05], [0, entranceHeight + 0.12, frontZ + 0.92], materials.metal)
    box(group, [entranceGap * 0.38, entranceHeight, 0.06], [-entranceGap * 0.22, entranceHeight / 2, frontZ + 0.13], materials.warmGlass, { cast: false })
    box(group, [entranceGap * 0.38, entranceHeight, 0.06], [entranceGap * 0.22, entranceHeight / 2, frontZ + 0.13], materials.warmGlass, { cast: false })
    for (const x of [-entranceGap / 2 - 0.32, entranceGap / 2 + 0.32]) {
      box(group, [0.16, entranceHeight + 0.18, 0.2], [x, entranceHeight / 2, frontZ + 0.15], materials.metal)
    }
  }

  if (terrace) {
    const terraceWidth = width * 0.56
    box(group, [terraceWidth, 0.2, 2.4], [width * 0.12, height * 0.6, frontZ + 1.0], materials.concreteDark)
    box(group, [terraceWidth, 0.9, 0.06], [width * 0.12, height * 0.6 + 0.48, frontZ + 2.15], materials.glass, { cast: false })
  }

  return group
}

function placeFacade(scene, { width, position, rotationY = Math.PI, name }) {
  setPhotorealMeshDefaults(scene)
  normalizeToWidth(scene, width)
  scene.position.set(...position)
  scene.rotation.y = rotationY
  scene.name = name
  return scene
}

function cloneFacade(template, { width, position, rotationY = Math.PI, name }) {
  const clone = SkeletonUtils.clone(template)
  return placeFacade(clone, { width, position, rotationY, name })
}

export async function attachHighDetailArchitecture(runtime) {
  if (!canLoadHeavyArchitecture()) return null

  const loader = new GLTFLoader()
  const [primaryResult, campusResult] = await Promise.allSettled([
    loadFirst(loader, ARCHITECTURE_SOURCES.primary),
    window.innerWidth >= 960
      ? loadFirst(loader, ARCHITECTURE_SOURCES.campus)
      : Promise.reject(new Error('Secondary facade skipped on compact viewport.')),
  ])

  const materials = createEnvelopeMaterials()
  const architectureGroup = new THREE.Group()
  architectureGroup.name = 'high-detail-architecture'

  // CIEAV consequence building: a complete glass/concrete/timber volume set behind
  // the authored interactive entrance. Collision, security reader and door remain
  // the original lightweight objects, so gameplay is unchanged.
  const primaryShell = createModernBuildingShell({
    name: 'cieav-integrity-building-shell',
    position: [40.5, 1.18, -2.7],
    width: 16.4,
    height: 8.2,
    depth: 7.2,
    levels: 4,
    bays: 9,
    entranceGap: 4.0,
    timber: true,
    terrace: true,
    materials,
  })
  architectureGroup.add(primaryShell)

  let primaryFacade = null
  let campusTemplate = null
  let primaryUrl = null
  let campusUrl = null

  if (primaryResult.status === 'fulfilled') {
    primaryUrl = primaryResult.value.url
    primaryFacade = placeFacade(primaryResult.value.scene, {
      width: 15.4,
      position: [40.4, 1.18, -6.1],
      rotationY: Math.PI,
      name: 'cc0-cieav-factory-detail',
    })
    architectureGroup.add(primaryFacade)
  }

  if (campusResult.status === 'fulfilled') {
    campusUrl = campusResult.value.url
    campusTemplate = campusResult.value.scene
    setPhotorealMeshDefaults(campusTemplate)
  }

  const campusSpecs = [
    {
      name: 'campus-west',
      position: [12.5, 0, -9.2],
      width: 14.8,
      height: 7.2,
      depth: 7.6,
      levels: 3,
      bays: 8,
      timber: true,
      terrace: false,
      facadePosition: [12.5, 0, -5.25],
      facadeWidth: 14.0,
      rotationY: Math.PI,
    },
    {
      name: 'campus-mid',
      position: [25.7, 0.48, -11.1],
      width: 12.2,
      height: 9.2,
      depth: 8.2,
      levels: 4,
      bays: 7,
      timber: false,
      terrace: true,
      facadePosition: [25.7, 0.48, -6.85],
      facadeWidth: 11.6,
      rotationY: Math.PI,
    },
    {
      name: 'campus-east',
      position: [61.2, 1.18, -10.8],
      width: 17.6,
      height: 8.8,
      depth: 8.6,
      levels: 4,
      bays: 10,
      timber: true,
      terrace: true,
      facadePosition: [61.2, 1.18, -6.35],
      facadeWidth: 16.8,
      rotationY: Math.PI * 0.98,
    },
  ]

  for (let index = 0; index < campusSpecs.length; index += 1) {
    const spec = campusSpecs[index]
    architectureGroup.add(createModernBuildingShell({ ...spec, materials }))

    if (campusTemplate) {
      const facade = cloneFacade(campusTemplate, {
        width: spec.facadeWidth,
        position: spec.facadePosition,
        rotationY: spec.rotationY,
        name: `cc0-${spec.name}-facade-detail`,
      })
      architectureGroup.add(facade)
    }
  }

  runtime.outdoor.group.add(architectureGroup)
  runtime.highDetailArchitecture = {
    group: architectureGroup,
    primary: primaryFacade,
    primaryUrl,
    campusUrl,
    materials,
  }
  return runtime.highDetailArchitecture
}

export function removeHighDetailArchitecture(runtime) {
  const assets = runtime.highDetailArchitecture
  if (!assets) return
  assets.group?.parent?.remove(assets.group)
  runtime.highDetailArchitecture = null
}
