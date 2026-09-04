import * as THREE from 'three/webgpu'

const damp = (from, to, lambda, dt) => THREE.MathUtils.lerp(from, to, 1 - Math.exp(-lambda * dt))

const STAGE_PROFILE = {
  AWAKENING: {
    scale: 0.82,
    intensity: 1.7,
    orbitRadius: 0.76,
    orbitSpeed: 0.34,
    activeTools: 1,
    signalRate: 0.42,
    mode: 'seed',
  },
  LEARNING: {
    scale: 0.96,
    intensity: 2.35,
    orbitRadius: 1.2,
    orbitSpeed: 0.72,
    activeTools: 4,
    signalRate: 0.7,
    mode: 'orbit',
  },
  BOUNDARY: {
    scale: 1.05,
    intensity: 3.15,
    orbitRadius: 0.92,
    orbitSpeed: 1.12,
    activeTools: 4,
    signalRate: 1.0,
    mode: 'constraint',
  },
  CONSEQUENCE: {
    scale: 1.12,
    intensity: 3.85,
    orbitRadius: 1.0,
    orbitSpeed: 0.32,
    activeTools: 4,
    signalRate: 1.18,
    mode: 'lattice',
  },
  PROVING: {
    scale: 1.2,
    intensity: 4.8,
    orbitRadius: 1.24,
    orbitSpeed: 0.18,
    activeTools: 4,
    signalRate: 1.55,
    mode: 'proof',
  },
}

const TOOL_COLORS = [0xbfffe8, 0xd5fff0, 0xa9e9d1, 0xf3e3bc]

function createParticleCloud(count = 220) {
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)

  for (let index = 0; index < count; index += 1) {
    const radius = 0.52 + Math.random() * 0.62
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const spread = 0.72 + Math.random() * 0.46

    positions[index * 3] = Math.sin(phi) * Math.cos(theta) * radius * spread
    positions[index * 3 + 1] = Math.cos(phi) * radius * (0.78 + Math.random() * 0.48)
    positions[index * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius * spread
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const material = new THREE.PointsMaterial({
    color: 0xd6fff0,
    size: 0.032,
    transparent: true,
    opacity: 0.62,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })

  return new THREE.Points(geometry, material)
}

function createRing(radius, opacity, rotation) {
  const geometry = new THREE.TorusGeometry(radius, 0.007, 8, 96)
  const material = new THREE.MeshBasicMaterial({
    color: 0xbfffe8,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const ring = new THREE.Mesh(geometry, material)
  ring.rotation.set(...rotation)
  return ring
}

function createToolGlyph(index) {
  const group = new THREE.Group()
  const color = TOOL_COLORS[index % TOOL_COLORS.length]
  const material = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 1.25,
    roughness: 0.26,
    metalness: 0.08,
    transparent: true,
    opacity: 0.9,
  })
  const wireMaterial = new THREE.MeshBasicMaterial({
    color,
    wireframe: true,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })

  let primaryGeometry
  if (index === 0) primaryGeometry = new THREE.OctahedronGeometry(0.105, 0)
  else if (index === 1) primaryGeometry = new THREE.BoxGeometry(0.17, 0.17, 0.17)
  else if (index === 2) primaryGeometry = new THREE.TetrahedronGeometry(0.13, 0)
  else primaryGeometry = new THREE.IcosahedronGeometry(0.115, 1)

  const primary = new THREE.Mesh(primaryGeometry, material)
  const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18, 1), wireMaterial)
  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(0.205, 0.006, 6, 56),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )
  halo.rotation.x = Math.PI * 0.5

  group.add(primary, shell, halo)
  group.userData.materials = [material, wireMaterial, halo.material]
  group.userData.primary = primary
  group.userData.shell = shell
  group.userData.halo = halo
  return group
}

function createConnector(color) {
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(6)
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const line = new THREE.Line(geometry, material)
  line.userData.positions = positions
  return line
}

function createSignal(color) {
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.78,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  return new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), material)
}

function toolTarget(mode, index, time, radius, target) {
  const phase = index * (Math.PI * 2 / 4)

  if (mode === 'seed') {
    const angle = time * 0.00034 + phase
    target.set(
      Math.cos(angle) * radius * (index === 0 ? 1 : 0.36),
      0.08 + Math.sin(angle * 1.4) * 0.13,
      Math.sin(angle) * radius * (index === 0 ? 1 : 0.36),
    )
    return target
  }

  if (mode === 'orbit') {
    const angle = time * 0.00072 + phase
    target.set(
      Math.cos(angle) * radius,
      Math.sin(angle * 0.85 + index) * 0.34,
      Math.sin(angle) * radius,
    )
    return target
  }

  if (mode === 'constraint') {
    const angle = time * 0.00112 + phase
    target.set(
      Math.cos(angle) * radius,
      Math.sin(phase) * 0.2,
      Math.sin(angle) * radius * 0.72,
    )
    return target
  }

  if (mode === 'lattice') {
    const lattice = [
      [radius, 0.28, 0],
      [-radius, 0.28, 0],
      [0, -0.28, radius],
      [0, -0.28, -radius],
    ]
    target.set(...lattice[index])
    return target
  }

  const proof = [
    [radius * 0.82, radius * 0.55, radius * 0.42],
    [-radius * 0.82, radius * 0.55, -radius * 0.42],
    [radius * 0.82, -radius * 0.55, -radius * 0.42],
    [-radius * 0.82, -radius * 0.55, radius * 0.42],
  ]
  target.set(...proof[index])
  return target
}

export function createSoulEntity() {
  const group = new THREE.Group()
  group.name = 'cieav-ai-soul'
  group.renderOrder = 8

  const coreGeometry = new THREE.IcosahedronGeometry(0.34, 4)
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: 0xe8fff6,
    emissive: 0x8fffcf,
    emissiveIntensity: 2.0,
    roughness: 0.15,
    metalness: 0.08,
    transparent: true,
    opacity: 0.94,
  })
  const core = new THREE.Mesh(coreGeometry, coreMaterial)

  const innerGeometry = new THREE.IcosahedronGeometry(0.52, 2)
  const innerMaterial = new THREE.MeshBasicMaterial({
    color: 0xbaffdf,
    wireframe: true,
    transparent: true,
    opacity: 0.24,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const innerShell = new THREE.Mesh(innerGeometry, innerMaterial)

  const outerGeometry = new THREE.IcosahedronGeometry(0.68, 1)
  const outerMaterial = new THREE.MeshBasicMaterial({
    color: 0xf0fff9,
    wireframe: true,
    transparent: true,
    opacity: 0.1,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const outerShell = new THREE.Mesh(outerGeometry, outerMaterial)

  const particles = createParticleCloud()
  const ringA = createRing(0.74, 0.24, [Math.PI * 0.52, 0.2, 0])
  const ringB = createRing(0.9, 0.15, [0.38, Math.PI * 0.5, 0.26])
  const ringC = createRing(1.04, 0.09, [0.12, 0.45, Math.PI * 0.5])
  const light = new THREE.PointLight(0x9dffdb, 3.8, 8, 1.7)

  const toolField = new THREE.Group()
  toolField.name = 'cieav-soul-tool-field'
  const tools = []
  const connectors = []
  const signals = []

  for (let index = 0; index < 4; index += 1) {
    const tool = createToolGlyph(index)
    const connector = createConnector(TOOL_COLORS[index])
    const signal = createSignal(TOOL_COLORS[index])
    if (index > 0) {
      tool.scale.setScalar(0.001)
      tool.visible = false
    }
    connector.visible = false
    signal.visible = false
    toolField.add(connector, signal, tool)
    tools.push(tool)
    connectors.push(connector)
    signals.push(signal)
  }

  group.add(core, innerShell, outerShell, particles, ringA, ringB, ringC, light, toolField)

  const target = new THREE.Vector3()
  const worldPosition = new THREE.Vector3()
  const nodeTarget = new THREE.Vector3()
  let initialized = false
  let currentScale = STAGE_PROFILE.AWAKENING.scale
  let currentIntensity = STAGE_PROFILE.AWAKENING.intensity
  let currentOrbitRadius = STAGE_PROFILE.AWAKENING.orbitRadius

  function update({ dt, time, character, stage = 'AWAKENING', inside = false }) {
    if (!character) return

    const profile = STAGE_PROFILE[stage] || STAGE_PROFILE.AWAKENING
    character.getWorldPosition(worldPosition)
    const bob = Math.sin(time * 0.0016) * (inside ? 0.035 : 0.06)
    target.set(worldPosition.x, worldPosition.y + (inside ? 1.45 : 1.65) + bob, worldPosition.z)

    if (!initialized) {
      group.position.copy(target)
      initialized = true
    } else {
      group.position.lerp(target, 1 - Math.exp(-4.4 * dt))
    }

    currentScale = damp(currentScale, profile.scale, 3.8, dt)
    currentIntensity = damp(currentIntensity, profile.intensity, 4.2, dt)
    currentOrbitRadius = damp(currentOrbitRadius, profile.orbitRadius, 4.0, dt)

    const pulse = 1 + Math.sin(time * 0.0025) * 0.04
    group.scale.setScalar(currentScale * pulse)

    core.rotation.x += dt * 0.25 * profile.orbitSpeed
    core.rotation.y -= dt * 0.31 * profile.orbitSpeed
    innerShell.rotation.x -= dt * 0.15 * profile.orbitSpeed
    innerShell.rotation.y += dt * 0.22 * profile.orbitSpeed
    outerShell.rotation.y -= dt * 0.1 * profile.orbitSpeed
    outerShell.rotation.z += dt * 0.07 * profile.orbitSpeed
    particles.rotation.y += dt * 0.085 * profile.orbitSpeed
    particles.rotation.z -= dt * 0.042 * profile.orbitSpeed
    ringA.rotation.z += dt * 0.1 * profile.orbitSpeed
    ringB.rotation.x -= dt * 0.075 * profile.orbitSpeed
    ringC.rotation.y += dt * 0.06 * profile.orbitSpeed

    coreMaterial.emissiveIntensity = currentIntensity
    light.intensity = currentIntensity
    particles.material.opacity = 0.45 + Math.min(0.3, currentIntensity * 0.048)
    innerMaterial.opacity = 0.18 + Math.min(0.24, currentIntensity * 0.038)

    tools.forEach((tool, index) => {
      const active = index < profile.activeTools
      toolTarget(profile.mode, index, time, currentOrbitRadius, nodeTarget)
      tool.position.lerp(nodeTarget, 1 - Math.exp(-6.5 * dt))

      const toolPulse = 1 + Math.sin(time * 0.004 + index * 1.7) * 0.09
      const targetScale = active ? toolPulse : 0.2
      const nextScale = damp(tool.scale.x, targetScale, active ? 6.5 : 8.0, dt)
      tool.scale.setScalar(nextScale)
      tool.visible = nextScale > 0.03

      tool.userData.primary.rotation.x += dt * (0.34 + index * 0.04)
      tool.userData.primary.rotation.y -= dt * (0.28 + index * 0.05)
      tool.userData.shell.rotation.y += dt * (0.22 + index * 0.035)
      tool.userData.halo.rotation.z += dt * (0.28 + index * 0.04)

      tool.userData.materials.forEach((material, materialIndex) => {
        if (!('opacity' in material)) return
        const baseOpacity = materialIndex === 0 ? 0.9 : materialIndex === 1 ? 0.22 : 0.28
        material.opacity = active ? baseOpacity : 0.03
      })

      const connector = connectors[index]
      const positions = connector.userData.positions
      positions[0] = 0
      positions[1] = 0
      positions[2] = 0
      positions[3] = tool.position.x
      positions[4] = tool.position.y
      positions[5] = tool.position.z
      connector.geometry.attributes.position.needsUpdate = true
      connector.material.opacity = active ? 0.13 + Math.min(0.22, currentIntensity * 0.03) : 0
      connector.visible = active

      const signal = signals[index]
      const cycle = (time * 0.00035 * profile.signalRate + index * 0.23) % 1
      const eased = cycle * cycle * (3 - 2 * cycle)
      signal.position.copy(tool.position).multiplyScalar(eased)
      signal.scale.setScalar(active ? 0.78 + Math.sin(cycle * Math.PI) * 0.65 : 0.01)
      signal.material.opacity = active ? Math.sin(cycle * Math.PI) * 0.82 : 0
      signal.visible = active
    })
  }

  function dispose() {
    group.traverse((object) => {
      object.geometry?.dispose?.()
      if (object.material) {
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        materials.forEach((material) => material.dispose?.())
      }
    })
    group.removeFromParent()
  }

  return { group, update, dispose }
}
