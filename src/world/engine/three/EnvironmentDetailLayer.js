import * as THREE from 'three/webgpu'

const mat = (color, roughness = 0.68, metalness = 0.03, extras = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extras })

function box(parent, size, material, position, rotation = [0, 0, 0], cast = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material)
  mesh.position.set(...position)
  mesh.rotation.set(...rotation)
  mesh.castShadow = cast
  mesh.receiveShadow = true
  parent.add(mesh)
  return mesh
}

function cyl(parent, radius, height, material, position, rotation = [0, 0, 0], sides = 14) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, sides), material)
  mesh.position.set(...position)
  mesh.rotation.set(...rotation)
  mesh.castShadow = true
  mesh.receiveShadow = true
  parent.add(mesh)
  return mesh
}

function makeGrimeTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, 256, 256)
  for (let i = 0; i < 130; i += 1) {
    const x = Math.random() * 256
    const y = Math.random() * 256
    const r = 4 + Math.random() * 28
    const alpha = 0.012 + Math.random() * 0.04
    ctx.fillStyle = `rgba(34,30,25,${alpha})`
    ctx.beginPath()
    ctx.ellipse(x, y, r, r * (0.25 + Math.random() * 0.7), Math.random() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  return texture
}

function createBollard(parent, x, y, z) {
  const steel = mat(0x333936, 0.38, 0.58)
  cyl(parent, 0.095, 0.84, steel, [x, y + 0.42, z])
  cyl(parent, 0.12, 0.055, steel, [x, y + 0.83, z])
}

function createBench(parent, x, y, z) {
  const wood = mat(0x6e533d, 0.82, 0.01)
  const steel = mat(0x2e3432, 0.42, 0.52)
  box(parent, [2.1, 0.12, 0.58], wood, [x, y + 0.55, z])
  box(parent, [2.1, 0.12, 0.48], wood, [x, y + 1.0, z - 0.24], [-0.12, 0, 0])
  for (const dx of [-0.78, 0.78]) {
    box(parent, [0.09, 0.62, 0.09], steel, [x + dx, y + 0.28, z])
    box(parent, [0.09, 0.62, 0.09], steel, [x + dx, y + 0.76, z - 0.25], [-0.12, 0, 0])
  }
}

function createBikeRack(parent, x, y, z) {
  const steel = mat(0x3a403d, 0.35, 0.6)
  for (let i = 0; i < 4; i += 1) {
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.035, 8, 22, Math.PI), steel)
    hoop.position.set(x + i * 0.58, y + 0.44, z)
    hoop.rotation.z = Math.PI / 2
    hoop.castShadow = true
    parent.add(hoop)
  }
}

function createDrain(parent, x, y, z) {
  const metal = mat(0x252a28, 0.48, 0.5)
  const frame = box(parent, [0.92, 0.035, 0.46], metal, [x, y + 0.012, z], [0, 0, 0], false)
  for (let i = -3; i <= 3; i += 1) {
    box(parent, [0.045, 0.018, 0.38], mat(0x171b19, 0.58, 0.4), [x + i * 0.11, y + 0.035, z], [0, 0, 0], false)
  }
  return frame
}

function addFacadeDetails(runtime, root) {
  const building = runtime.outdoor?.building
  if (!building) return

  const metal = mat(0x303633, 0.4, 0.56)
  const darkMetal = mat(0x202522, 0.34, 0.68)
  const concrete = mat(0x6f746f, 0.78, 0.02)
  const warm = mat(0xc8bba1, 0.7, 0.02)

  // Window reveals / sill depth on the primary facade.
  for (let i = 0; i < 5; i += 1) {
    const x = 36.7 + i * 1.9
    box(root, [1.72, 0.09, 0.36], concrete, [x, 6.25, 3.0])
    box(root, [1.72, 0.08, 0.34], metal, [x, 3.72, 3.05])
  }

  // Ground-level architectural seams and shadow gaps.
  for (let x = 34.0; x <= 45.7; x += 1.15) {
    box(root, [0.025, 2.15, 0.05], darkMetal, [x, 2.46, 3.34], [0, 0, 0], false)
  }

  // Entrance handrails.
  for (const z of [4.15, 5.4]) {
    cyl(root, 0.035, 3.4, metal, [44.65, 1.15, z], [0, 0, Math.PI / 2], 12)
    for (const x of [43.15, 44.2, 45.25]) cyl(root, 0.032, 0.95, metal, [x, 0.69, z], [0, 0, 0], 12)
  }

  // Bollards and threshold protection.
  ;[42.9, 43.65, 44.4, 45.15].forEach((x) => createBollard(root, x, 1.18, 5.95))
  box(root, [2.7, 0.045, 1.08], warm, [43.84, 1.205, 5.42], [0, 0, 0], false)

  // Downpipes and cable conduits.
  for (const x of [34.1, 47.0]) {
    cyl(root, 0.055, 5.8, darkMetal, [x, 4.1, 3.2], [0, 0, 0], 12)
    cyl(root, 0.055, 0.82, darkMetal, [x, 1.38, 3.55], [Math.PI / 2, 0, 0], 12)
  }

  // Wall-mounted services / vents.
  for (let i = 0; i < 4; i += 1) {
    const x = 33.2 + i * 0.8
    box(root, [0.52, 0.42, 0.16], metal, [x, 2.25 + (i % 2) * 0.46, 3.38])
    for (let s = -1; s <= 1; s += 1) box(root, [0.38, 0.022, 0.03], darkMetal, [x, 2.25 + (i % 2) * 0.46 + s * 0.1, 3.48], [0, 0, 0], false)
  }

  // Rooftop HVAC and service rails.
  for (const x of [37.0, 40.2, 43.4]) {
    box(root, [1.55, 0.74, 1.18], metal, [x, 8.13, -0.4])
    box(root, [1.18, 0.05, 0.86], darkMetal, [x, 8.51, -0.4])
  }
  for (let x = 34.8; x < 46.0; x += 0.5) cyl(root, 0.018, 0.6, darkMetal, [x, 8.22, 2.6], [0, 0, 0], 8)
  cyl(root, 0.025, 11.3, darkMetal, [40.4, 8.52, 2.6], [0, 0, Math.PI / 2], 8)
}

function addStreetDetails(runtime, root) {
  const curb = mat(0x77756e, 0.91, 0.01)
  const asphalt = mat(0x373936, 0.96, 0.01)
  const painted = mat(0xc9c3ae, 0.84, 0.01)

  // A darker side service lane gives the campus a believable edge.
  box(root, [68, 0.08, 2.55], asphalt, [35, -0.03, 8.0], [0, 0, 0], false)
  box(root, [68, 0.24, 0.28], curb, [35, 0.08, 6.73], [0, 0, 0], false)
  for (let x = 4; x < 67; x += 7.5) box(root, [2.8, 0.018, 0.09], painted, [x, 0.025, 8.0], [0, 0, 0], false)

  // Drains at realistic low points.
  ;[[12.5, 0, 6.66], [25.0, 0.24, 6.66], [35.2, 1.18, 6.66], [51.0, 1.18, 6.66]].forEach(([x, y, z]) => createDrain(root, x, y, z))

  createBench(root, 18.0, 0.0, 6.28)
  createBench(root, 57.0, 1.18, 6.28)
  createBikeRack(root, 47.6, 1.18, 6.25)

  // Utility / fire-safety cabinets and small clutter.
  const red = mat(0x8d352f, 0.72, 0.1)
  box(root, [0.42, 0.86, 0.28], red, [46.8, 1.61, 3.52])
  const bin = mat(0x343c38, 0.66, 0.18)
  for (const [x, y, z] of [[16.3, 0, 6.2], [56.1, 1.18, 6.15]]) {
    box(root, [0.52, 0.78, 0.52], bin, [x, y + 0.39, z])
    box(root, [0.56, 0.06, 0.56], bin, [x, y + 0.81, z])
  }
}

function addInteriorDetails(runtime, root) {
  const interior = runtime.interior?.group
  if (!interior) return

  const metal = mat(0x2b312e, 0.38, 0.56)
  const wall = mat(0x575d58, 0.8, 0.02)
  const cable = mat(0x171c19, 0.52, 0.45)
  const acoustic = mat(0x6a716b, 0.92, 0.01)

  // Baseboards and ceiling service tracks.
  for (const z of [-3.1, 3.1]) box(root, [22.0, 0.14, 0.12], metal, [11.4, 0.07, z], [0, 0, 0], false)
  for (const z of [-2.5, 0, 2.5]) box(root, [20.0, 0.08, 0.08], metal, [11.4, 5.82, z], [0, 0, 0], false)

  // Cable trays and conduits.
  for (let x = 4; x <= 19; x += 2.6) {
    box(root, [1.5, 0.07, 0.44], cable, [x, 5.55, -2.55])
    cyl(root, 0.028, 1.9, cable, [x, 4.65, -2.55], [0, 0, 0], 8)
  }

  // Acoustic wall panels around the compiler space.
  for (let i = 0; i < 7; i += 1) {
    box(root, [0.74, 1.42, 0.08], acoustic, [11.0 + i * 0.86, 3.55, -3.15], [0, 0, 0], false)
  }

  // Floor service plates and power boxes.
  for (let i = 0; i < 5; i += 1) {
    box(root, [0.45, 0.022, 0.28], metal, [6.5 + i * 2.65, 0.016, 0.58], [0, 0, 0], false)
  }
  box(root, [0.7, 1.1, 0.3], wall, [19.8, 0.55, -2.95])

  // Safety line / realistic threshold at exit.
  box(root, [2.5, 0.018, 0.1], mat(0xd2b44f, 0.82), [2.45, 0.025, 1.72], [0, 0, 0], false)
}

export function addEnvironmentDetailLayer(runtime) {
  const root = new THREE.Group()
  root.name = 'photoreal-detail-layer'
  runtime.scene.add(root)

  addFacadeDetails(runtime, root)
  addStreetDetails(runtime, root)
  addInteriorDetails(runtime, root)

  const grime = makeGrimeTexture()
  const grimeMat = new THREE.MeshBasicMaterial({ map: grime, transparent: true, opacity: 0.45, depthWrite: false, toneMapped: false })
  const facadeGrime = new THREE.Mesh(new THREE.PlaneGeometry(11.1, 5.9), grimeMat)
  facadeGrime.position.set(40.5, 4.35, 3.355)
  facadeGrime.renderOrder = 4
  root.add(facadeGrime)

  runtime.photorealResources = runtime.photorealResources || []
  runtime.photorealResources.push(grime, grimeMat, facadeGrime.geometry)
  runtime.environmentDetailLayer = root
  return root
}
