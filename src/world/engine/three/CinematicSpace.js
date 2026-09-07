import * as THREE from 'three/webgpu'

const TAU = Math.PI * 2

function fract(value) {
  return value - Math.floor(value)
}

function hash2(x, y) {
  return fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453123)
}

function smooth(t) {
  return t * t * (3 - 2 * t)
}

function valueNoise(x, y) {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = smooth(x - ix)
  const fy = smooth(y - iy)
  const a = hash2(ix, iy)
  const b = hash2(ix + 1, iy)
  const c = hash2(ix, iy + 1)
  const d = hash2(ix + 1, iy + 1)
  const ab = THREE.MathUtils.lerp(a, b, fx)
  const cd = THREE.MathUtils.lerp(c, d, fx)
  return THREE.MathUtils.lerp(ab, cd, fy)
}

function fbm(x, y, octaves = 5) {
  let value = 0
  let amplitude = 0.55
  let frequency = 1
  let total = 0
  for (let i = 0; i < octaves; i += 1) {
    value += valueNoise(x * frequency, y * frequency) * amplitude
    total += amplitude
    frequency *= 2.03
    amplitude *= 0.49
  }
  return value / total
}

function makeGlowTexture(inner = '#ffffff', middle = '#9fd6ff', outer = 'rgba(20,40,80,0)') {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createRadialGradient(128, 128, 2, 128, 128, 126)
  gradient.addColorStop(0, inner)
  gradient.addColorStop(0.17, middle)
  gradient.addColorStop(1, outer)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 256, 256)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function createPlanetMaps() {
  const width = 512
  const height = 256
  const colorCanvas = document.createElement('canvas')
  const bumpCanvas = document.createElement('canvas')
  const glowCanvas = document.createElement('canvas')
  colorCanvas.width = bumpCanvas.width = glowCanvas.width = width
  colorCanvas.height = bumpCanvas.height = glowCanvas.height = height

  const colorCtx = colorCanvas.getContext('2d')
  const bumpCtx = bumpCanvas.getContext('2d')
  const glowCtx = glowCanvas.getContext('2d')
  const colorData = colorCtx.createImageData(width, height)
  const bumpData = bumpCtx.createImageData(width, height)
  const glowData = glowCtx.createImageData(width, height)

  const craters = [
    [0.17, 0.31, 0.055, 0.72],
    [0.33, 0.63, 0.085, 0.9],
    [0.54, 0.42, 0.048, 0.65],
    [0.70, 0.27, 0.11, 1.0],
    [0.82, 0.68, 0.065, 0.74],
    [0.92, 0.46, 0.045, 0.62],
  ]

  for (let py = 0; py < height; py += 1) {
    const v = py / (height - 1)
    const latitude = Math.abs(v - 0.5) * 2
    for (let px = 0; px < width; px += 1) {
      const u = px / (width - 1)
      const n = fbm(u * 6.8, v * 5.4, 5)
      const ridges = Math.abs(fbm(u * 14.2 + 4.1, v * 11.3 - 2.7, 4) - 0.5) * 2
      let heightValue = THREE.MathUtils.clamp(n * 0.76 + ridges * 0.34 - 0.08, 0, 1)

      for (const [cx, cy, radius, depth] of craters) {
        let dx = Math.abs(u - cx)
        dx = Math.min(dx, 1 - dx)
        const dy = v - cy
        const distance = Math.hypot(dx * 1.65, dy)
        if (distance < radius) {
          const normalized = distance / radius
          const bowl = (1 - normalized) * depth
          const rim = Math.exp(-Math.pow((normalized - 0.82) * 8, 2)) * 0.24
          heightValue = THREE.MathUtils.clamp(heightValue - bowl * 0.34 + rim, 0, 1)
        }
      }

      const frost = THREE.MathUtils.smoothstep(latitude, 0.64, 1)
      const dry = THREE.MathUtils.clamp(heightValue * 1.15 + ridges * 0.22, 0, 1)
      const rock = new THREE.Color().setRGB(
        THREE.MathUtils.lerp(0.095, 0.43, dry),
        THREE.MathUtils.lerp(0.085, 0.30, dry),
        THREE.MathUtils.lerp(0.07, 0.18, dry),
      )
      const mineral = new THREE.Color(0x596240)
      rock.lerp(mineral, Math.max(0, n - 0.59) * 0.48)
      rock.lerp(new THREE.Color(0xb7b6aa), frost * 0.52)

      const index = (py * width + px) * 4
      colorData.data[index] = rock.r * 255
      colorData.data[index + 1] = rock.g * 255
      colorData.data[index + 2] = rock.b * 255
      colorData.data[index + 3] = 255

      const gray = Math.floor(heightValue * 255)
      bumpData.data[index] = gray
      bumpData.data[index + 1] = gray
      bumpData.data[index + 2] = gray
      bumpData.data[index + 3] = 255

      const veinSignal = Math.abs(Math.sin((u * 21 + fbm(u * 9, v * 9, 3) * 7.5) * Math.PI))
      const veinBand = veinSignal > 0.972 && n > 0.46 && latitude < 0.74
      const hot = veinBand ? Math.floor(THREE.MathUtils.clamp((veinSignal - 0.972) * 3600, 0, 1) * 255) : 0
      glowData.data[index] = hot
      glowData.data[index + 1] = Math.floor(hot * 0.68)
      glowData.data[index + 2] = Math.floor(hot * 0.19)
      glowData.data[index + 3] = 255
    }
  }

  colorCtx.putImageData(colorData, 0, 0)
  bumpCtx.putImageData(bumpData, 0, 0)
  glowCtx.putImageData(glowData, 0, 0)

  const map = new THREE.CanvasTexture(colorCanvas)
  map.colorSpace = THREE.SRGBColorSpace
  map.wrapS = THREE.RepeatWrapping
  const bumpMap = new THREE.CanvasTexture(bumpCanvas)
  bumpMap.wrapS = THREE.RepeatWrapping
  const emissiveMap = new THREE.CanvasTexture(glowCanvas)
  emissiveMap.colorSpace = THREE.SRGBColorSpace
  emissiveMap.wrapS = THREE.RepeatWrapping
  return { map, bumpMap, emissiveMap }
}

function createCloudMap() {
  const width = 512
  const height = 256
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  const image = ctx.createImageData(width, height)

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const u = x / width
      const v = y / height
      const n = fbm(u * 8.1 + 13, v * 5.4 + 7, 5)
      const streak = fbm(u * 19.0 - 4, v * 3.2 + 21, 3)
      const density = THREE.MathUtils.smoothstep(n * 0.72 + streak * 0.28, 0.57, 0.77)
      const index = (y * width + x) * 4
      image.data[index] = 190
      image.data[index + 1] = 182
      image.data[index + 2] = 166
      image.data[index + 3] = Math.floor(density * 150)
    }
  }

  ctx.putImageData(image, 0, 0)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  return texture
}

function physical(color, options = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: options.roughness ?? 0.52,
    metalness: options.metalness ?? 0.58,
    clearcoat: options.clearcoat ?? 0,
    clearcoatRoughness: options.clearcoatRoughness ?? 0.35,
    emissive: options.emissive ?? 0x000000,
    emissiveIntensity: options.emissiveIntensity ?? 0,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1,
    side: options.side ?? THREE.FrontSide,
    depthWrite: options.depthWrite ?? true,
  })
}

function mesh(group, geometry, material, position = [0, 0, 0], rotation = [0, 0, 0]) {
  const object = new THREE.Mesh(geometry, material)
  object.position.set(...position)
  object.rotation.set(...rotation)
  object.castShadow = true
  object.receiveShadow = true
  group.add(object)
  return object
}

function beam(group, start, end, radius, material) {
  const a = new THREE.Vector3(...start)
  const b = new THREE.Vector3(...end)
  const midpoint = a.clone().add(b).multiplyScalar(0.5)
  const direction = b.clone().sub(a)
  const length = direction.length()
  const object = mesh(group, new THREE.CylinderGeometry(radius, radius, length, 8), material)
  object.position.copy(midpoint)
  object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize())
  return object
}

function createCinematicPlanet(root, resources) {
  const radius = 6.95
  const maps = createPlanetMaps()
  resources.push(maps.map, maps.bumpMap, maps.emissiveMap)

  const surface = mesh(
    root,
    new THREE.SphereGeometry(radius, 128, 72),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      map: maps.map,
      bumpMap: maps.bumpMap,
      bumpScale: 0.72,
      roughness: 0.93,
      metalness: 0.02,
      emissive: 0xffa24a,
      emissiveMap: maps.emissiveMap,
      emissiveIntensity: 1.35,
      clearcoat: 0.04,
      clearcoatRoughness: 0.95,
    }),
  )
  surface.rotation.set(0.06, -0.72, -0.17)

  const cloudMap = createCloudMap()
  resources.push(cloudMap)
  const clouds = mesh(
    root,
    new THREE.SphereGeometry(radius * 1.012, 96, 54),
    new THREE.MeshPhysicalMaterial({
      color: 0xcac2b6,
      map: cloudMap,
      alphaMap: cloudMap,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      roughness: 1,
      metalness: 0,
      side: THREE.DoubleSide,
    }),
  )
  clouds.rotation.set(-0.03, 0.18, -0.17)

  const atmosphere = mesh(
    root,
    new THREE.SphereGeometry(radius * 1.055, 72, 42),
    new THREE.MeshBasicMaterial({
      color: 0x8bc3d6,
      transparent: true,
      opacity: 0.045,
      side: THREE.BackSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )

  const upperAtmosphere = mesh(
    root,
    new THREE.SphereGeometry(radius * 1.085, 64, 36),
    new THREE.MeshBasicMaterial({
      color: 0x8ae0c4,
      transparent: true,
      opacity: 0.018,
      side: THREE.BackSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )

  return { surface, clouds, atmosphere, upperAtmosphere }
}

function createEarthShip(root, resources) {
  const ship = new THREE.Group()
  ship.position.set(-18.8, 5.4, -12.2)
  ship.rotation.set(0.1, -0.5, -0.11)
  ship.scale.setScalar(1.1)
  root.add(ship)

  const ceramic = physical(0xc6c3b8, { roughness: 0.68, metalness: 0.28, clearcoat: 0.08 })
  const graphite = physical(0x1a1e22, { roughness: 0.42, metalness: 0.8, clearcoat: 0.18 })
  const titanium = physical(0x777b7b, { roughness: 0.35, metalness: 0.92, clearcoat: 0.2 })
  const foil = physical(0x7d6645, { roughness: 0.78, metalness: 0.45 })
  const panel = physical(0x101b32, { roughness: 0.28, metalness: 0.56, clearcoat: 0.34 })
  const engineMaterial = physical(0xffc07d, { roughness: 0.25, metalness: 0.1, emissive: 0xff6b20, emissiveIntensity: 5.4 })

  mesh(ship, new THREE.CylinderGeometry(1.05, 1.05, 5.2, 32), ceramic, [0, 0, 0], [0, 0, Math.PI / 2])
  mesh(ship, new THREE.CylinderGeometry(1.22, 1.04, 2.5, 32), foil, [3.72, 0, 0], [0, 0, Math.PI / 2])
  mesh(ship, new THREE.CylinderGeometry(0.9, 0.9, 2.1, 28), graphite, [-3.62, 0, 0], [0, 0, Math.PI / 2])
  mesh(ship, new THREE.ConeGeometry(0.86, 2.1, 28), ceramic, [5.9, 0, 0], [0, 0, -Math.PI / 2])

  for (const x of [-2.55, -0.8, 1.0, 2.75]) {
    mesh(ship, new THREE.TorusGeometry(1.08, 0.055, 8, 64), titanium, [x, 0, 0], [0, Math.PI / 2, 0])
  }

  const spineStart = [-4.4, 0, 0]
  const spineEnd = [4.9, 0, 0]
  for (const y of [-0.78, 0.78]) {
    for (const z of [-0.78, 0.78]) beam(ship, [spineStart[0], y, z], [spineEnd[0], y, z], 0.035, titanium)
  }

  for (const y of [-2.25, 2.25]) {
    mesh(ship, new THREE.BoxGeometry(5.6, 0.1, 1.62), panel, [0.3, y, 0])
    beam(ship, [-1.85, Math.sign(y) * 0.9, 0], [-1.85, y, 0], 0.055, titanium)
    beam(ship, [2.25, Math.sign(y) * 0.9, 0], [2.25, y, 0], 0.055, titanium)
  }

  for (const y of [-0.52, 0.52]) {
    for (const z of [-0.52, 0.52]) {
      mesh(ship, new THREE.CylinderGeometry(0.22, 0.34, 0.72, 18), graphite, [-4.9, y, z], [0, 0, Math.PI / 2])
      mesh(ship, new THREE.CircleGeometry(0.18, 20), engineMaterial, [-5.28, y, z], [0, -Math.PI / 2, 0])
    }
  }

  const dish = new THREE.Group()
  dish.position.set(1.15, 1.5, 0.15)
  dish.rotation.set(0.2, -0.5, -0.25)
  mesh(dish, new THREE.CircleGeometry(0.72, 40), ceramic, [0, 0, 0], [0, 0, 0])
  beam(dish, [0, 0, 0.03], [0, 0, 0.78], 0.025, titanium)
  mesh(dish, new THREE.SphereGeometry(0.09, 12, 10), graphite, [0, 0, 0.82])
  ship.add(dish)

  for (let i = 0; i < 14; i += 1) {
    const x = -2.9 + i * 0.45
    const z = i % 2 ? 0.94 : -0.94
    mesh(ship, new THREE.BoxGeometry(0.18, 0.12, 0.035), engineMaterial, [x, 0.35 * Math.sin(i), z])
  }

  const plumeTexture = makeGlowTexture('#fff8df', '#ff7b32', 'rgba(255,85,20,0)')
  resources.push(plumeTexture)
  const plumes = []
  for (const y of [-0.52, 0.52]) {
    for (const z of [-0.52, 0.52]) {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: plumeTexture,
        color: 0xff8b45,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.74,
      }))
      sprite.position.set(-5.85, y, z)
      sprite.scale.set(2.25, 0.72, 1)
      ship.add(sprite)
      plumes.push(sprite)
    }
  }

  const engineLight = new THREE.PointLight(0xff7a31, 16, 18, 2)
  engineLight.position.set(-5.15, 0, 0)
  ship.add(engineLight)
  return { group: ship, plumes }
}

function createAlienShip(root, resources) {
  const ship = new THREE.Group()
  ship.position.set(18.6, -3.5, 16.3)
  ship.rotation.set(-0.34, 0.47, 0.27)
  ship.scale.setScalar(1.14)
  root.add(ship)

  const bioMetal = physical(0x080d0d, { roughness: 0.26, metalness: 0.92, clearcoat: 0.76, clearcoatRoughness: 0.12, emissive: 0x08221b, emissiveIntensity: 0.42 })
  const edgeMetal = physical(0x263f3c, { roughness: 0.2, metalness: 0.84, clearcoat: 0.52 })
  const crystal = physical(0x6effd0, { roughness: 0.14, metalness: 0.12, clearcoat: 0.68, emissive: 0x34ffb4, emissiveIntensity: 4.8 })

  mesh(ship, new THREE.TorusGeometry(2.18, 0.27, 14, 112), bioMetal, [0, 0, 0], [Math.PI / 2, 0.14, -0.12])
  mesh(ship, new THREE.TorusGeometry(1.36, 0.12, 10, 96), crystal, [0.12, 0.02, 0.1], [Math.PI / 2, -0.22, 0.28])
  const core = mesh(ship, new THREE.IcosahedronGeometry(0.72, 3), edgeMetal, [0.1, -0.05, 0])
  core.scale.set(1.5, 0.62, 1.1)

  const spireAngles = [-1.25, -0.48, 0.32, 1.08, 2.45]
  spireAngles.forEach((angle, index) => {
    const length = 4.2 + (index % 2) * 1.5
    const pivot = new THREE.Group()
    pivot.rotation.y = angle
    pivot.rotation.z = index % 2 ? -0.2 : 0.15
    ship.add(pivot)
    const blade = mesh(pivot, new THREE.ConeGeometry(0.34, length, 6), bioMetal, [0, 0, -2.1], [Math.PI / 2, 0, 0])
    blade.scale.x = 0.55
    mesh(pivot, new THREE.ConeGeometry(0.11, length * 0.82, 5), edgeMetal, [0.08, 0.05, -1.75], [Math.PI / 2, 0, 0])
    const node = mesh(pivot, new THREE.OctahedronGeometry(0.18, 1), crystal, [0, 0, -3.75])
    node.scale.set(0.6, 1.8, 0.6)
  })

  for (let i = 0; i < 11; i += 1) {
    const angle = (i / 11) * TAU
    const radius = 2.68 + Math.sin(i * 2.17) * 0.42
    const node = mesh(ship, new THREE.OctahedronGeometry(0.15 + (i % 3) * 0.025, 1), crystal)
    node.position.set(Math.cos(angle) * radius, Math.sin(angle * 3.1) * 0.34, Math.sin(angle) * radius)
    node.rotation.set(angle, angle * 0.7, -angle)
  }

  const alienGlowTexture = makeGlowTexture('#e8fff8', '#42ffc8', 'rgba(0,255,180,0)')
  resources.push(alienGlowTexture)
  const coreGlow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: alienGlowTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    opacity: 0.82,
  }))
  coreGlow.scale.set(3.2, 3.2, 1)
  ship.add(coreGlow)
  const light = new THREE.PointLight(0x40ffc1, 23, 32, 1.7)
  ship.add(light)
  return { group: ship, coreGlow }
}

function createStars(root, resources) {
  const starGroups = []
  const configs = [
    { count: 2400, size: 0.22, opacity: 0.72, color: 0xddeaff },
    { count: 850, size: 0.42, opacity: 0.8, color: 0xfff0d7 },
    { count: 280, size: 0.68, opacity: 0.9, color: 0xb9d9ff },
  ]

  configs.forEach((config, layer) => {
    const positions = new Float32Array(config.count * 3)
    for (let i = 0; i < config.count; i += 1) {
      const radius = 95 + Math.random() * 220
      const theta = Math.random() * TAU
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i * 3] = Math.sin(phi) * Math.cos(theta) * radius
      positions[i * 3 + 1] = Math.cos(phi) * radius
      positions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const material = new THREE.PointsMaterial({
      color: config.color,
      size: config.size,
      transparent: true,
      opacity: config.opacity,
      sizeAttenuation: true,
      depthWrite: false,
    })
    const points = new THREE.Points(geometry, material)
    points.rotation.set(layer * 0.17, 0.3 + layer * 0.21, layer * 0.11)
    root.add(points)
    starGroups.push(points)
  })

  return starGroups
}

function createGalaxy(root) {
  const count = 3600
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const center = new THREE.Vector3(-82, 24, -150)
  const warm = new THREE.Color(0xffc889)
  const cold = new THREE.Color(0x8cb7ff)
  const color = new THREE.Color()

  for (let i = 0; i < count; i += 1) {
    const arm = i % 4
    const r = Math.pow(Math.random(), 0.62) * 42
    const theta = arm * (TAU / 4) + r * 0.19 + (Math.random() - 0.5) * 0.55
    const thickness = (Math.random() - 0.5) * (3.4 + r * 0.07)
    positions[i * 3] = center.x + Math.cos(theta) * r
    positions[i * 3 + 1] = center.y + thickness
    positions[i * 3 + 2] = center.z + Math.sin(theta) * r * 0.52
    color.copy(cold).lerp(warm, THREE.MathUtils.clamp(1 - r / 42, 0, 1))
    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  const material = new THREE.PointsMaterial({
    size: 1.35,
    vertexColors: true,
    transparent: true,
    opacity: 0.62,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const galaxy = new THREE.Points(geometry, material)
  galaxy.rotation.z = -0.26
  root.add(galaxy)
  return galaxy
}

function createNebula(root, resources) {
  const texture = makeGlowTexture('rgba(230,245,255,0.55)', 'rgba(92,120,183,0.22)', 'rgba(18,20,55,0)')
  resources.push(texture)
  const positions = new Float32Array(420 * 3)
  for (let i = 0; i < 420; i += 1) {
    const t = i / 420
    const angle = t * TAU * 2.4 + Math.random() * 0.4
    const radius = 70 + Math.random() * 55
    positions[i * 3] = Math.cos(angle) * radius
    positions[i * 3 + 1] = (Math.random() - 0.5) * 35 + Math.sin(angle * 0.37) * 12
    positions[i * 3 + 2] = -120 + Math.sin(angle) * radius * 0.45
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const material = new THREE.PointsMaterial({
    map: texture,
    color: 0x768bd4,
    size: 15,
    transparent: true,
    opacity: 0.09,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  })
  const nebula = new THREE.Points(geometry, material)
  root.add(nebula)
  return nebula
}

function createAsteroids(root) {
  const geometry = new THREE.DodecahedronGeometry(0.42, 1)
  const material = physical(0x4b4640, { roughness: 1, metalness: 0.04 })
  const count = 54
  const field = new THREE.InstancedMesh(geometry, material, count)
  const dummy = new THREE.Object3D()
  for (let i = 0; i < count; i += 1) {
    const radius = 28 + Math.random() * 48
    const angle = Math.random() * TAU
    dummy.position.set(
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 24,
      Math.sin(angle) * radius,
    )
    const scale = 0.2 + Math.pow(Math.random(), 2) * 1.65
    dummy.scale.set(scale, scale * (0.7 + Math.random() * 0.6), scale * (0.6 + Math.random() * 0.8))
    dummy.rotation.set(Math.random() * TAU, Math.random() * TAU, Math.random() * TAU)
    dummy.updateMatrix()
    field.setMatrixAt(i, dummy.matrix)
  }
  root.add(field)
  return field
}

function createSun(root, resources) {
  const texture = makeGlowTexture('#ffffff', '#ffdca0', 'rgba(255,160,70,0)')
  resources.push(texture)
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }))
  sprite.position.set(-72, 42, -96)
  sprite.scale.set(22, 22, 1)
  root.add(sprite)
  return sprite
}

export function applyCinematicSpace(runtime) {
  if (!runtime?.scene) return null

  runtime.camera.far = 480
  runtime.camera.fov = 47
  runtime.camera.updateProjectionMatrix()
  runtime.renderer.toneMappingExposure = 1.18

  ;[
    runtime.planet,
    runtime.planetVeins,
    runtime.atmosphere,
    runtime.planetHalo,
    runtime.starfield,
    runtime.earthShip,
    runtime.alienShip,
  ].forEach((object) => {
    if (object) object.visible = false
  })

  runtime.layerObjects?.forEach((entry, index) => {
    entry.ringMaterial.opacity = 0.075 + index * 0.008
    entry.ring.material.opacity = entry.ringMaterial.opacity
    entry.halo.material.opacity = 0.34
    entry.core.material.emissiveIntensity = 1.6
    entry.core.scale.setScalar(0.82)
  })

  const root = new THREE.Group()
  root.name = 'cieav-cinematic-space'
  runtime.scene.add(root)
  const resources = []

  const stars = createStars(root, resources)
  const galaxy = createGalaxy(root)
  const nebula = createNebula(root, resources)
  const sun = createSun(root, resources)
  const asteroids = createAsteroids(root)
  const planet = createCinematicPlanet(root, resources)
  const earthShip = createEarthShip(root, resources)
  const alienShip = createAlienShip(root, resources)

  const rim = new THREE.DirectionalLight(0xbfe4ff, 3.2)
  rim.position.set(28, 12, 34)
  root.add(rim)
  const warm = new THREE.DirectionalLight(0xffd29d, 5.2)
  warm.position.set(-38, 30, -16)
  root.add(warm)

  const update = (elapsed, dt) => {
    planet.surface.rotation.y += dt * 0.007
    planet.clouds.rotation.y += dt * 0.011
    planet.clouds.rotation.x = Math.sin(elapsed * 0.06) * 0.008
    planet.atmosphere.scale.setScalar(1 + Math.sin(elapsed * 0.3) * 0.0015)
    planet.upperAtmosphere.scale.setScalar(1 + Math.sin(elapsed * 0.23 + 1) * 0.002)

    earthShip.group.position.y = 5.4 + Math.sin(elapsed * 0.17) * 0.16
    earthShip.group.rotation.y = -0.5 + Math.sin(elapsed * 0.08) * 0.035
    earthShip.plumes.forEach((plume, index) => {
      const pulse = 0.88 + Math.sin(elapsed * 7 + index * 1.8) * 0.12
      plume.scale.x = 2.25 * pulse
      plume.material.opacity = 0.64 + pulse * 0.13
    })

    alienShip.group.rotation.z = 0.27 + Math.sin(elapsed * 0.14) * 0.05
    alienShip.group.rotation.y = 0.47 + Math.sin(elapsed * 0.11 + 1) * 0.04
    alienShip.coreGlow.material.opacity = 0.68 + Math.sin(elapsed * 1.4) * 0.12
    alienShip.coreGlow.scale.setScalar(3.0 + Math.sin(elapsed * 1.2) * 0.18)

    galaxy.rotation.y += dt * 0.00045
    nebula.rotation.z += dt * 0.00022
    stars.forEach((group, index) => {
      group.rotation.y += dt * (0.00018 + index * 0.00007)
    })
    asteroids.rotation.y += dt * 0.0009
    sun.material.opacity = 0.92 + Math.sin(elapsed * 0.7) * 0.04
  }

  const dispose = () => {
    runtime.scene?.remove(root)
    root.traverse((object) => {
      object.geometry?.dispose?.()
      const list = object.material ? (Array.isArray(object.material) ? object.material : [object.material]) : []
      list.forEach((material) => material.dispose?.())
    })
    resources.forEach((resource) => resource?.dispose?.())
  }

  runtime.cinematicSpaceRoot = root
  return { root, update, dispose }
}
