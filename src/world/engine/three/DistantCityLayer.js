import * as THREE from 'three/webgpu'

const material = (color, roughness = 0.78, metalness = 0.03) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness })

function box(parent, size, mat, position, cast = false) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), mat)
  mesh.position.set(...position)
  mesh.castShadow = cast
  mesh.receiveShadow = true
  parent.add(mesh)
  return mesh
}

function createBuilding({ x, z, width, depth, height, color, rows = 4, cols = 5 }) {
  const group = new THREE.Group()
  group.position.set(x, 0, z)

  const wall = material(color, 0.84, 0.02)
  const frame = material(0x343a37, 0.48, 0.34)
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x91a59d,
    roughness: 0.28,
    metalness: 0.02,
    transmission: 0.08,
    transparent: true,
    opacity: 0.76,
  })

  box(group, [width, height, depth], wall, [0, height / 2, 0])
  box(group, [width + 0.28, 0.18, depth + 0.28], frame, [0, height + 0.09, 0])

  const usableW = width * 0.82
  const usableH = Math.max(2.4, height * 0.72)
  const paneW = usableW / cols * 0.58
  const paneH = usableH / rows * 0.48
  const frontZ = depth / 2 + 0.018

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const px = -usableW / 2 + (col + 0.5) * (usableW / cols)
      const py = 1.15 + row * (usableH / rows)
      box(group, [paneW, paneH, 0.045], glass, [px, py, frontZ])
    }
  }

  // Roof equipment and parapet give the silhouette believable detail.
  const roofMat = material(0x555d58, 0.58, 0.24)
  box(group, [width * 0.28, 0.46, depth * 0.34], roofMat, [-width * 0.22, height + 0.33, 0])
  box(group, [width * 0.18, 0.32, depth * 0.24], roofMat, [width * 0.23, height + 0.24, depth * 0.12])

  return group
}

export function addDistantCityLayer(runtime) {
  const root = new THREE.Group()
  root.name = 'distant-city-layer'

  const blocks = [
    { x: 1, z: -13.5, width: 8.4, depth: 5.2, height: 7.6, color: 0x737a75, rows: 4, cols: 5 },
    { x: 11, z: -15.2, width: 9.2, depth: 5.6, height: 10.4, color: 0x666f6a, rows: 5, cols: 6 },
    { x: 22, z: -12.8, width: 7.5, depth: 5.0, height: 6.8, color: 0x7c7770, rows: 3, cols: 5 },
    { x: 32, z: -16.0, width: 10.8, depth: 6.2, height: 12.5, color: 0x626b66, rows: 6, cols: 7 },
    { x: 50, z: -14.6, width: 9.8, depth: 5.8, height: 8.9, color: 0x777b75, rows: 4, cols: 6 },
    { x: 62, z: -16.8, width: 8.8, depth: 5.4, height: 11.6, color: 0x606a65, rows: 6, cols: 5 },
    { x: 72, z: -13.5, width: 8.2, depth: 5.0, height: 7.2, color: 0x817970, rows: 4, cols: 5 },
  ]

  blocks.forEach((config, index) => {
    const building = createBuilding(config)
    building.rotation.y = (index % 2 ? -1 : 1) * 0.025
    root.add(building)
  })

  // A low retaining strip closes the horizon without looking like a backdrop card.
  const retaining = material(0x687069, 0.92, 0.01)
  box(root, [86, 1.2, 1.0], retaining, [35, 0.3, -10.2])

  runtime.outdoor.group.add(root)
  runtime.distantCityLayer = root
  return root
}

export function removeDistantCityLayer(runtime) {
  const root = runtime.distantCityLayer
  if (!root) return

  const materials = new Set()
  root.traverse((object) => {
    object.geometry?.dispose?.()
    if (object.material) {
      const list = Array.isArray(object.material) ? object.material : [object.material]
      list.forEach((mat) => materials.add(mat))
    }
  })
  materials.forEach((mat) => mat.dispose?.())
  root.parent?.remove(root)
  runtime.distantCityLayer = null
}
