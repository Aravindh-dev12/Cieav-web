import * as THREE from 'three/webgpu'
import { createHumanModel } from './HumanModel.js'

const standard = (color, roughness = 0.72, metalness = 0.03, extras = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extras })
const physical = (color, extras = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.24, metalness: 0.04, ...extras })

function addMesh(parent, geometry, material, position = [0, 0, 0], rotation = [0, 0, 0], { cast = true, receive = true } = {}) {
  const value = new THREE.Mesh(geometry, material)
  value.position.set(...position)
  value.rotation.set(...rotation)
  value.castShadow = cast
  value.receiveShadow = receive
  parent.add(value)
  return value
}

function addBox(parent, size, material, position, rotation = [0, 0, 0], options = {}) {
  return addMesh(parent, new THREE.BoxGeometry(...size), material, position, rotation, options)
}

function addWindow(parent, x, y, z, width, height, glass, frame) {
  addBox(parent, [width, height, 0.08], glass, [x, y, z], [0, 0, 0], { cast: false })
  const border = 0.075
  addBox(parent, [width + border * 2, border, 0.12], frame, [x, y + height / 2, z + 0.005])
  addBox(parent, [width + border * 2, border, 0.12], frame, [x, y - height / 2, z + 0.005])
  addBox(parent, [border, height, 0.12], frame, [x - width / 2, y, z + 0.005])
  addBox(parent, [border, height, 0.12], frame, [x + width / 2, y, z + 0.005])
  addBox(parent, [border * 0.72, height, 0.1], frame, [x, y, z + 0.01])
}

function createTree(x, z, scale = 1, tint = 0x5e7861) {
  const tree = new THREE.Group()
  tree.position.set(x, 0, z)
  const trunkMat = standard(0x69533d, 0.96)
  const leafMat = standard(tint, 0.92)
  addMesh(tree, new THREE.CylinderGeometry(0.12 * scale, 0.18 * scale, 1.9 * scale, 9), trunkMat, [0, 0.95 * scale, 0])
  addMesh(tree, new THREE.IcosahedronGeometry(0.8 * scale, 2), leafMat, [0, 2.05 * scale, 0])
  addMesh(tree, new THREE.IcosahedronGeometry(0.56 * scale, 2), leafMat, [-0.48 * scale, 1.85 * scale, 0.08])
  addMesh(tree, new THREE.IcosahedronGeometry(0.54 * scale, 2), leafMat, [0.5 * scale, 1.9 * scale, -0.05])
  return tree
}

function createLamp(x, z, height = 3.3) {
  const group = new THREE.Group()
  group.position.set(x, 0, z)
  const metal = standard(0x333936, 0.52, 0.48)
  addMesh(group, new THREE.CylinderGeometry(0.045, 0.07, height, 12), metal, [0, height / 2, 0])
  addMesh(group, new THREE.CylinderGeometry(0.26, 0.21, 0.22, 12), metal, [0, height + 0.05, 0])
  addMesh(group, new THREE.SphereGeometry(0.17, 12, 10), new THREE.MeshStandardMaterial({ color: 0xffe7b3, emissive: 0xffc56b, emissiveIntensity: 0.8 }), [0, height + 0.08, 0])
  const light = new THREE.PointLight(0xffd99c, 2.2, 8, 2)
  light.position.set(0, height + 0.1, 0)
  group.add(light)
  return group
}

function createBackgroundBuilding({ x, z, width, height, depth, color = 0x7a817c, glassColor = 0x9fb3aa, roof = true }) {
  const group = new THREE.Group()
  group.position.set(x, 0, z)
  const wall = standard(color, 0.66, 0.06)
  const frame = standard(0x2e3632, 0.45, 0.42)
  const glass = physical(glassColor, { transparent: true, opacity: 0.54, transmission: 0.16, thickness: 0.06 })
  addBox(group, [width, height, depth], wall, [0, height / 2, 0])
  const levels = Math.max(2, Math.floor(height / 2.1))
  const columns = Math.max(2, Math.floor(width / 1.5))
  for (let level = 0; level < levels; level += 1) {
    for (let col = 0; col < columns; col += 1) {
      const paneWidth = width / columns * 0.62
      const px = -width / 2 + (col + 0.5) * (width / columns)
      const py = 1.05 + level * 1.9
      addWindow(group, px, py, depth / 2 + 0.045, paneWidth, 1.18, glass, frame)
    }
  }
  if (roof) addBox(group, [width + 0.6, 0.24, depth + 0.6], frame, [0, height + 0.12, 0])
  return group
}

export function terrainHeightAt(x) {
  if (x < 22) return 0
  if (x < 28) return (x - 22) / 6 * 0.48
  if (x < 33) return 0.48 + Math.floor((x - 28) / 1) * 0.14
  return 1.18
}

function createPath(group) {
  const stone = standard(0xb8ad99, 0.93)
  const edge = standard(0x8f8677, 0.88)
  addBox(group, [22, 0.28, 5.4], stone, [11, -0.16, 4.35])
  const ramp = addBox(group, [6.05, 0.32, 5.4], stone, [25, 0.08, 4.35], [0, 0, 0.08])
  ramp.receiveShadow = true

  for (let i = 0; i < 5; i += 1) {
    const height = 0.48 + i * 0.14
    addBox(group, [1.03, height + 0.22, 5.4], stone, [28.5 + i, (height - 0.22) / 2, 4.35])
  }
  addBox(group, [39, 0.34, 5.4], stone, [52.5, 1.01, 4.35])

  for (let x = 1; x < 70; x += 1.8) {
    const y = terrainHeightAt(x) + 0.02
    const tile = addBox(group, [1.35, 0.035, 2.7], edge, [x, y, 4.32], [0, (x % 3) * 0.008, (x % 4 - 2) * 0.002], { cast: false })
    tile.material = tile.material.clone()
    tile.material.color.offsetHSL(0, 0, ((Math.floor(x) % 5) - 2) * 0.012)
  }
}

function createConsequenceBuilding(baseY = 1.18) {
  const group = new THREE.Group()
  group.position.set(40.5, baseY, 0)

  const concrete = standard(0x777e79, 0.73, 0.04)
  const concreteDark = standard(0x515955, 0.78, 0.08)
  const stone = standard(0x989083, 0.86, 0.02)
  const metal = standard(0x2f3834, 0.34, 0.52)
  const glass = physical(0xa9c2b8, { transparent: true, opacity: 0.48, transmission: 0.22, thickness: 0.09, clearcoat: 0.35 })
  const glassBright = physical(0xc8ddd5, { transparent: true, opacity: 0.42, transmission: 0.32, thickness: 0.08, clearcoat: 0.5 })

  addBox(group, [14.2, 0.7, 8.2], stone, [-0.6, 0.05, -0.2])
  addBox(group, [11.2, 6.8, 6.4], concrete, [0, 3.7, 0])
  addBox(group, [4.8, 4.9, 5.6], concreteDark, [-7.2, 2.75, -0.45])
  addBox(group, [11.8, 0.24, 6.9], metal, [0, 7.2, 0])
  addBox(group, [5.2, 0.2, 6.0], metal, [-7.2, 5.3, -0.45])

  for (let i = 0; i < 5; i += 1) addWindow(group, -3.8 + i * 1.9, 5.05, 3.235, 1.52, 2.16, glass, metal)

  addBox(group, [5.1, 2.5, 0.18], concreteDark, [-2.5, 1.8, 3.19])
  addWindow(group, -4.2, 1.9, 3.31, 1.4, 1.65, glassBright, metal)
  addWindow(group, -2.5, 1.9, 3.31, 1.4, 1.65, glassBright, metal)

  for (let x = -5.2; x <= 5.2; x += 1.85) addBox(group, [0.12, 6.5, 0.18], metal, [x, 3.85, 3.27])

  const canopy = addBox(group, [4.1, 0.18, 2.15], metal, [3.2, 3.18, 4.18])
  canopy.castShadow = true
  for (const x of [1.55, 4.85]) addMesh(group, new THREE.CylinderGeometry(0.075, 0.095, 3.0, 12), metal, [x, 1.55, 4.65])

  addBox(group, [3.8, 0.16, 1.0], stone, [3.2, 0.08, 4.02])
  addBox(group, [3.8, 0.28, 0.85], stone, [3.2, 0.14, 4.66])
  addBox(group, [3.8, 0.4, 0.72], stone, [3.2, 0.2, 5.22])

  const doorPivot = new THREE.Group()
  doorPivot.position.set(2.15, 1.58, 3.34)
  const doorFrame = new THREE.Group()
  addBox(doorFrame, [2.55, 0.13, 0.16], metal, [1.25, 1.42, 0])
  addBox(doorFrame, [0.13, 2.82, 0.16], metal, [0, 0, 0])
  addBox(doorFrame, [0.13, 2.82, 0.16], metal, [2.5, 0, 0])
  group.add(doorFrame)

  const doorPanel = addBox(doorPivot, [2.36, 2.68, 0.09], glassBright, [1.18, 0, 0], [0, 0, 0], { cast: true })
  addMesh(doorPivot, new THREE.CylinderGeometry(0.035, 0.035, 0.72, 10), metal, [2.05, 0, 0.09])
  group.add(doorPivot)

  const security = addBox(group, [0.34, 0.72, 0.24], metal, [5.12, 1.65, 3.48])
  const securityLightMat = new THREE.MeshStandardMaterial({ color: 0x93c8a9, emissive: 0x4ca66f, emissiveIntensity: 1.2, roughness: 0.35 })
  const securityLight = addMesh(group, new THREE.SphereGeometry(0.07, 12, 8), securityLightMat, [5.12, 1.86, 3.62])
  security.userData.light = securityLight

  addBox(group, [5.4, 0.62, 0.2], metal, [-2.6, 3.25, 3.35])

  const planterMat = standard(0x56524a, 0.88)
  const plantMat = standard(0x49694f, 0.92)
  for (const x of [-5.3, 5.8]) {
    addBox(group, [1.15, 0.62, 1.05], planterMat, [x, 0.31, 4.3])
    for (let i = 0; i < 6; i += 1) addMesh(group, new THREE.ConeGeometry(0.14 + (i % 2) * 0.04, 0.75 + (i % 3) * 0.12, 7), plantMat, [x - 0.35 + i * 0.14, 0.95, 4.3 + (i % 2) * 0.12])
  }

  group.userData.doorPivot = doorPivot
  group.userData.doorPanel = doorPanel
  group.userData.doorWorldX = group.position.x + doorPivot.position.x + 1.18
  group.userData.doorWorldZ = group.position.z + 3.38
  group.userData.securityLight = securityLight
  return group
}

export function createOutdoorWorld() {
  const group = new THREE.Group()
  group.name = 'outdoor-world'

  const hemi = new THREE.HemisphereLight(0xeaf3ed, 0x566157, 2.5)
  group.add(hemi)
  const sun = new THREE.DirectionalLight(0xfff1d2, 4.2)
  sun.position.set(18, 26, 16)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  sun.shadow.camera.left = -42
  sun.shadow.camera.right = 42
  sun.shadow.camera.top = 28
  sun.shadow.camera.bottom = -18
  sun.shadow.camera.near = 1
  sun.shadow.camera.far = 90
  group.add(sun, sun.target)
  sun.target.position.set(38, 0, 0)

  const grass = standard(0x71806d, 0.98)
  addBox(group, [86, 0.45, 34], grass, [35, -0.33, -1.2])
  createPath(group)

  const bank = standard(0x7f7768, 0.96)
  addBox(group, [42, 1.15, 4], bank, [52, 0.44, 8.3])
  addBox(group, [42, 1.15, 4], bank, [52, 0.44, 0.1])

  const trees = [
    [4, -5.6, 1.05, 0x57715b], [9, 9.4, 0.82, 0x607c64], [14, -7.8, 1.28, 0x526c56],
    [20, 9.2, 1.08, 0x67826b], [27, -6.5, 0.92, 0x5d765f], [34, 9.2, 1.18, 0x526d58],
    [50, -7.6, 1.12, 0x637d66], [61, 8.7, 0.94, 0x59735d], [67, -7.2, 1.24, 0x526d58],
  ]
  trees.forEach(([x, z, s, c]) => group.add(createTree(x, z, s, c)))
  ;[[17, 7.2], [31.4, 7.0], [48, 7.2], [62, 7.0]].forEach(([x, z]) => group.add(createLamp(x, z)))

  const annex = createBackgroundBuilding({ x: 14, z: -8.5, width: 8.5, height: 5.5, depth: 5.4, color: 0x6f7772 })
  annex.rotation.y = 0.05
  group.add(annex)
  const proofTower = createBackgroundBuilding({ x: 61, z: -9.8, width: 7.2, height: 10.5, depth: 5.8, color: 0x66726c, glassColor: 0x92aaa0 })
  proofTower.rotation.y = -0.06
  group.add(proofTower)

  const building = createConsequenceBuilding(1.18)
  group.add(building)

  const npcA = createHumanModel({ name: 'walker-a', jacket: 0x6c6257, trousers: 0x3e4140, skin: 0xb98463, scale: 0.92, phase: 1.4 })
  npcA.position.set(10.5, terrainHeightAt(10.5), 5.0)
  npcA.userData.npc = { minX: 5, maxX: 20, speed: 1.05, direction: 1 }
  group.add(npcA)

  const npcB = createHumanModel({ name: 'walker-b', jacket: 0x4e6175, trousers: 0x2b3137, skin: 0xd1a17e, hair: 0x3c2f29, scale: 0.88, phase: 3.2 })
  npcB.position.set(54, terrainHeightAt(54), 5.15)
  npcB.userData.npc = { minX: 47, maxX: 66, speed: 0.82, direction: -1 }
  group.add(npcB)

  const npcC = createHumanModel({ name: 'walker-c', jacket: 0x785d4e, trousers: 0x45413f, skin: 0x8f624c, hair: 0x171716, scale: 0.96, phase: 4.4 })
  npcC.position.set(24, terrainHeightAt(24), 4.95)
  npcC.userData.npc = { minX: 20, maxX: 31, speed: 0.68, direction: 1 }
  group.add(npcC)

  return {
    group,
    building,
    npcs: [npcA, npcB, npcC],
    pathZ: 4.85,
    doorX: building.userData.doorWorldX,
    doorZ: building.userData.doorWorldZ,
  }
}

function createDesk(parent, x, z, width = 2.5) {
  const topMat = standard(0x6a6155, 0.72)
  const metal = standard(0x2d3431, 0.45, 0.48)
  addBox(parent, [width, 0.12, 1.0], topMat, [x, 1.05, z])
  for (const dx of [-width / 2 + 0.16, width / 2 - 0.16]) {
    addBox(parent, [0.11, 1.0, 0.11], metal, [x + dx, 0.51, z - 0.36])
    addBox(parent, [0.11, 1.0, 0.11], metal, [x + dx, 0.51, z + 0.36])
  }
}

export function createInteriorWorld() {
  const group = new THREE.Group()
  group.name = 'compiler-interior'
  group.visible = false

  const ambient = new THREE.HemisphereLight(0xb9c8c0, 0x1a201d, 1.5)
  group.add(ambient)
  const key = new THREE.DirectionalLight(0xe9fff1, 2.1)
  key.position.set(8, 8, 7)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  group.add(key)

  const floorMat = standard(0x2a302d, 0.86)
  const wallMat = standard(0x424d47, 0.82)
  const wallDark = standard(0x242c28, 0.88)
  const metal = standard(0x303936, 0.42, 0.48)
  const glass = physical(0x8fab9e, { transparent: true, opacity: 0.28, transmission: 0.26, thickness: 0.08 })

  addBox(group, [24, 0.32, 12], floorMat, [11, -0.18, 0])
  addBox(group, [24, 6.8, 0.34], wallMat, [11, 3.4, -5.9])
  addBox(group, [0.34, 6.8, 12], wallDark, [-1, 3.4, 0])
  addBox(group, [0.34, 6.8, 12], wallDark, [23, 3.4, 0])
  addBox(group, [24, 0.28, 12], wallDark, [11, 6.7, 0])

  for (let x = 1; x < 22; x += 3.4) addBox(group, [0.12, 0.18, 11.5], metal, [x, 6.35, 0])
  for (let x = 1.1; x < 22; x += 3.4) {
    const lampMat = new THREE.MeshStandardMaterial({ color: 0xeafff2, emissive: 0xcfffe2, emissiveIntensity: 1.2 })
    addBox(group, [2.0, 0.06, 0.45], lampMat, [x, 6.2, 0.5], [0, 0, 0], { cast: false })
    const light = new THREE.PointLight(0xe8fff1, 1.4, 7, 2)
    light.position.set(x, 5.8, 0.5)
    group.add(light)
  }

  for (let x = 5.2; x <= 17.4; x += 4.05) {
    addBox(group, [3.2, 3.1, 0.08], glass, [x, 2.9, -5.68], [0, 0, 0], { cast: false })
    addBox(group, [0.1, 3.25, 0.11], metal, [x - 1.63, 2.9, -5.61])
    addBox(group, [0.1, 3.25, 0.11], metal, [x + 1.63, 2.9, -5.61])
  }

  createDesk(group, 7.0, -1.6, 2.8)
  createDesk(group, 11.2, -1.6, 2.8)
  createDesk(group, 15.4, -1.6, 2.8)

  const screenMat = new THREE.MeshStandardMaterial({ color: 0x8fc1aa, emissive: 0x4ca27a, emissiveIntensity: 0.72, roughness: 0.35 })
  for (const x of [7.0, 11.2, 15.4]) addBox(group, [1.25, 0.78, 0.08], screenMat.clone(), [x, 1.78, -1.63], [-0.08, 0, 0], { cast: false })

  const terminal = new THREE.Group()
  terminal.position.set(18.6, 0, 0)
  addBox(terminal, [2.8, 1.15, 1.4], wallDark, [0, 0.58, -0.1])
  addBox(terminal, [2.25, 1.28, 0.11], screenMat, [0, 1.72, 0.27], [-0.18, 0, 0], { cast: false })
  addBox(terminal, [1.7, 0.1, 0.8], metal, [0, 1.13, 0.52], [-0.14, 0, 0])
  const indicatorMat = new THREE.MeshStandardMaterial({ color: 0xc99c61, emissive: 0xe58e32, emissiveIntensity: 1.3 })
  const indicator = addMesh(terminal, new THREE.SphereGeometry(0.07, 12, 8), indicatorMat, [1.02, 1.73, 0.35])
  terminal.userData.indicator = indicator
  group.add(terminal)

  const exitPivot = new THREE.Group()
  exitPivot.position.set(1.5, 1.35, 4.6)
  addBox(exitPivot, [2.1, 2.7, 0.11], glass, [1.05, 0, 0], [0, 0, 0], { cast: true })
  group.add(exitPivot)

  const operator = createHumanModel({ name: 'compiler-operator', jacket: 0x56626d, trousers: 0x252b30, skin: 0xb57f60, hair: 0x2b2522, scale: 0.9, phase: 2.1 })
  operator.position.set(12.1, 0, -0.8)
  operator.rotation.y = -0.12
  group.add(operator)

  return {
    group,
    terminal,
    operator,
    terminalX: 18.1,
    exitX: 2.5,
    pathZ: 3.7,
    exitPivot,
  }
}
