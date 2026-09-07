import * as THREE from 'three/webgpu'
import { internetLayers } from '../cieav/cosmicModel.js'

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
const damp = (from, to, lambda, dt) => THREE.MathUtils.lerp(from, to, 1 - Math.exp(-lambda * dt))
const wrapAngle = (angle) => {
  const twoPi = Math.PI * 2
  return ((angle % twoPi) + twoPi) % twoPi
}

function makeMaterial(color, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: options.roughness ?? 0.58,
    metalness: options.metalness ?? 0.36,
    emissive: options.emissive ?? 0x000000,
    emissiveIntensity: options.emissiveIntensity ?? 0,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1,
  })
}

function addBox(group, size, position, material, rotation = [0, 0, 0]) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material)
  mesh.position.set(...position)
  mesh.rotation.set(...rotation)
  mesh.castShadow = true
  mesh.receiveShadow = true
  group.add(mesh)
  return mesh
}

function addCylinder(group, radiusTop, radiusBottom, height, position, material, rotation = [0, 0, 0], segments = 20) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments, 1, false),
    material,
  )
  mesh.position.set(...position)
  mesh.rotation.set(...rotation)
  mesh.castShadow = true
  mesh.receiveShadow = true
  group.add(mesh)
  return mesh
}

export class CosmicRuntime {
  constructor(host, callbacks = {}) {
    this.host = host
    this.callbacks = callbacks
    this.scene = null
    this.renderer = null
    this.camera = null
    this.probe = null
    this.planet = null
    this.layerObjects = []
    this.interactionTargets = []
    this.keys = new Set()
    this.pointer = new THREE.Vector2()
    this.raycaster = new THREE.Raycaster()
    this.clock = new THREE.Clock()
    this.rendererName = 'THREE / INITIALIZING'
    this.inspectionOpen = false
    this.activeLayerId = null
    this.lastStateSignature = ''
    this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

    this.orbitAngle = 0.22
    this.orbitRadius = 12.8
    this.radialVelocity = 0
    this.angularVelocity = 0
    this.cameraYaw = 1.03
    this.cameraPitch = 0.34
    this.cameraDistance = 14.6
    this.cameraTargetYaw = this.cameraYaw
    this.cameraTargetPitch = this.cameraPitch
    this.cameraTargetDistance = this.cameraDistance
    this.cameraDrag = {
      active: false,
      pointerId: null,
      x: 0,
      y: 0,
      moved: false,
    }
  }

  async init() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x010306)

    this.camera = new THREE.PerspectiveCamera(44, 1, 0.1, 320)
    this.camera.position.set(19, 10, 24)

    this.renderer = new THREE.WebGPURenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    this.renderer.setSize(this.host.clientWidth, this.host.clientHeight)
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.08
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    await this.renderer.init()
    this.renderer.shadowMap.enabled = true

    const backendIsWebGPU = Boolean(this.renderer.backend?.isWebGPUBackend)
    this.rendererName = backendIsWebGPU ? 'WEBGPU / NEXUS WORLD' : 'WEBGL2 / NEXUS WORLD'
    this.renderer.domElement.className = 'cieav-world-canvas cosmic-world-canvas'
    this.host.appendChild(this.renderer.domElement)

    this.addLights()
    this.createStarfield()
    this.createPlanet()
    this.createInternetOrbits()
    this.createEarthShip()
    this.createAlienShip()
    this.createProbe()

    this.bindInput()
    this.bindPointer()
    this.onResize = () => this.resize()
    window.addEventListener('resize', this.onResize)
    this.resize()

    this.clock.start()
    this.renderer.setAnimationLoop(this.frame)
    this.updatePrompt(true)
    this.emitState({
      renderer: this.rendererName,
      location: 'NEXUS-7 ORBIT',
      prompt: null,
      layer: null,
    })
  }

  addLights() {
    const hemi = new THREE.HemisphereLight(0x7fd6ff, 0x190b08, 0.58)
    this.scene.add(hemi)

    const key = new THREE.DirectionalLight(0xffd8a0, 4.0)
    key.position.set(-22, 28, 18)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    this.scene.add(key)

    const alienGlow = new THREE.PointLight(0x73ffb0, 28, 65, 1.7)
    alienGlow.position.set(8, 4, -12)
    this.scene.add(alienGlow)

    const coldFill = new THREE.PointLight(0x6d82ff, 18, 80, 1.8)
    coldFill.position.set(-24, -6, 12)
    this.scene.add(coldFill)
  }

  createStarfield() {
    const count = 1800
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      const radius = 75 + Math.random() * 170
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i * 3] = Math.sin(phi) * Math.cos(theta) * radius
      positions[i * 3 + 1] = Math.cos(phi) * radius
      positions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const material = new THREE.PointsMaterial({
      color: 0xd8e7ff,
      size: 0.34,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.82,
      depthWrite: false,
    })
    const points = new THREE.Points(geometry, material)
    points.rotation.z = 0.16
    this.scene.add(points)
    this.starfield = points
  }

  createPlanet() {
    const radius = 6.35
    const geometry = new THREE.IcosahedronGeometry(radius, 5)
    const position = geometry.attributes.position
    const v = new THREE.Vector3()

    for (let i = 0; i < position.count; i += 1) {
      v.fromBufferAttribute(position, i)
      const normal = v.clone().normalize()
      const ridge =
        Math.sin(normal.x * 10.7 + normal.z * 3.1) * 0.21 +
        Math.sin(normal.y * 17.3 - normal.x * 5.4) * 0.14 +
        Math.sin((normal.x + normal.y + normal.z) * 28.0) * 0.065
      const basin = Math.sin(normal.y * 4.4 + normal.z * 2.1) * 0.16
      v.normalize().multiplyScalar(radius + ridge + basin)
      position.setXYZ(i, v.x, v.y, v.z)
    }
    geometry.computeVertexNormals()

    const surface = new THREE.MeshStandardMaterial({
      color: 0x45542a,
      roughness: 0.93,
      metalness: 0.02,
      emissive: 0x0d1f12,
      emissiveIntensity: 0.35,
    })
    const planet = new THREE.Mesh(geometry, surface)
    planet.rotation.z = -0.18
    planet.castShadow = true
    planet.receiveShadow = true
    this.scene.add(planet)
    this.planet = planet

    const veinGeometry = new THREE.IcosahedronGeometry(radius * 1.014, 3)
    const veins = new THREE.Mesh(
      veinGeometry,
      new THREE.MeshBasicMaterial({
        color: 0xa6ff71,
        wireframe: true,
        transparent: true,
        opacity: 0.075,
        depthWrite: false,
      }),
    )
    veins.rotation.copy(planet.rotation)
    this.scene.add(veins)
    this.planetVeins = veins

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 1.09, 56, 32),
      new THREE.MeshBasicMaterial({
        color: 0x76f1a2,
        transparent: true,
        opacity: 0.055,
        side: THREE.BackSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    )
    this.scene.add(atmosphere)
    this.atmosphere = atmosphere

    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(radius * 1.12, 0.06, 8, 192),
      new THREE.MeshBasicMaterial({
        color: 0x93ff9b,
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    )
    halo.rotation.x = Math.PI / 2
    halo.rotation.z = 0.24
    this.scene.add(halo)
    this.planetHalo = halo
  }

  createInternetOrbits() {
    internetLayers.forEach((layer, index) => {
      const orbitGroup = new THREE.Group()
      orbitGroup.rotation.x = layer.tilt * 0.6
      orbitGroup.rotation.z = layer.tilt
      this.scene.add(orbitGroup)

      const ringMaterial = new THREE.MeshBasicMaterial({
        color: layer.color,
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(layer.radius, 0.035, 6, 256),
        ringMaterial,
      )
      ring.rotation.x = Math.PI / 2
      orbitGroup.add(ring)

      const beacon = new THREE.Group()
      beacon.position.set(
        Math.cos(layer.angle) * layer.radius,
        0,
        Math.sin(layer.angle) * layer.radius,
      )
      beacon.userData.layerId = layer.id
      orbitGroup.add(beacon)

      const coreMaterial = new THREE.MeshStandardMaterial({
        color: layer.color,
        emissive: layer.color,
        emissiveIntensity: 2.4,
        roughness: 0.22,
        metalness: 0.62,
      })
      const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.24, 2), coreMaterial)
      core.userData.interactiveLayer = layer.id
      core.castShadow = true
      beacon.add(core)
      this.interactionTargets.push(core)

      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(0.58, 0.025, 6, 72),
        new THREE.MeshBasicMaterial({
          color: layer.color,
          transparent: true,
          opacity: 0.68,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      )
      halo.rotation.x = Math.PI / 2
      beacon.add(halo)

      const mast = new THREE.Mesh(
        new THREE.CylinderGeometry(0.026, 0.026, 1.45, 8),
        new THREE.MeshBasicMaterial({
          color: layer.color,
          transparent: true,
          opacity: 0.44,
        }),
      )
      mast.position.y = 0.72
      beacon.add(mast)

      for (let satelliteIndex = 0; satelliteIndex < 3; satelliteIndex += 1) {
        const theta = layer.angle + 0.34 + satelliteIndex * 0.19
        const satellite = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.07, 0),
          new THREE.MeshBasicMaterial({
            color: layer.color,
            transparent: true,
            opacity: 0.62,
          }),
        )
        satellite.position.set(
          Math.cos(theta) * layer.radius,
          Math.sin(theta * 2 + index) * 0.12,
          Math.sin(theta) * layer.radius,
        )
        orbitGroup.add(satellite)
      }

      this.layerObjects.push({ layer, orbitGroup, ring, ringMaterial, beacon, core, halo })
    })
  }

  createEarthShip() {
    const ship = new THREE.Group()
    ship.position.set(-18.5, 6.2, -13.8)
    ship.rotation.set(0.16, -0.62, -0.12)

    const hull = makeMaterial(0xb6b8b0, { roughness: 0.68, metalness: 0.52 })
    const dark = makeMaterial(0x24282b, { roughness: 0.46, metalness: 0.72 })
    const insulation = makeMaterial(0x9d7f58, { roughness: 0.88, metalness: 0.08 })
    const panel = makeMaterial(0x17244a, { roughness: 0.34, metalness: 0.48, emissive: 0x071226, emissiveIntensity: 0.5 })
    const warm = makeMaterial(0xffbb6a, { roughness: 0.3, metalness: 0.2, emissive: 0xff7b22, emissiveIntensity: 2.5 })

    addCylinder(ship, 0.88, 1.04, 4.8, [0, 0, 0], hull, [0, 0, Math.PI / 2], 24)
    addCylinder(ship, 1.15, 0.86, 2.3, [3.25, 0, 0], insulation, [0, 0, Math.PI / 2], 24)
    addCylinder(ship, 0.82, 0.82, 2.4, [-3.4, 0, 0], dark, [0, 0, Math.PI / 2], 20)
    addCylinder(ship, 0.62, 0.18, 1.8, [5.25, 0, 0], hull, [0, 0, Math.PI / 2], 18)

    for (const x of [-2.4, 0, 2.25]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.075, 8, 48), dark)
      ring.position.x = x
      ring.rotation.y = Math.PI / 2
      ship.add(ring)
    }

    addBox(ship, [5.4, 0.12, 1.35], [0.3, 2.05, 0], panel)
    addBox(ship, [5.4, 0.12, 1.35], [0.3, -2.05, 0], panel)
    addBox(ship, [0.15, 4.15, 0.16], [0.3, 0, 0], dark)

    for (const y of [-0.42, 0.42]) {
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), warm)
      lamp.position.set(4.85, y, 0.58)
      ship.add(lamp)
    }

    this.scene.add(ship)
    this.earthShip = ship
  }

  createAlienShip() {
    const ship = new THREE.Group()
    ship.position.set(18.5, -4.2, 17.5)
    ship.rotation.set(-0.42, 0.48, 0.33)

    const shell = makeMaterial(0x171a16, { roughness: 0.7, metalness: 0.66, emissive: 0x10271a, emissiveIntensity: 0.6 })
    const inner = makeMaterial(0x3e4637, { roughness: 0.82, metalness: 0.38 })
    const glow = makeMaterial(0x9cff73, { roughness: 0.18, metalness: 0.1, emissive: 0x6dff66, emissiveIntensity: 3.3 })

    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.18, 2), inner)
    core.scale.set(1.7, 0.84, 1.08)
    ship.add(core)

    for (let i = 0; i < 3; i += 1) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(2.25 + i * 0.42, 0.13 - i * 0.018, 8, 84),
        shell,
      )
      ring.rotation.set(Math.PI / 2 + i * 0.2, i * 0.47, i * 0.34)
      ship.add(ring)
    }

    for (let i = 0; i < 7; i += 1) {
      const theta = (i / 7) * Math.PI * 2
      const pod = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 1), i % 2 ? glow : inner)
      pod.position.set(Math.cos(theta) * 2.72, Math.sin(theta * 2) * 0.48, Math.sin(theta) * 2.72)
      pod.scale.set(0.55, 1.25, 0.55)
      pod.rotation.z = theta
      ship.add(pod)
    }

    for (let i = 0; i < 5; i += 1) {
      const theta = (i / 5) * Math.PI * 2 + 0.3
      const arm = addCylinder(
        ship,
        0.055,
        0.09,
        3.4,
        [Math.cos(theta) * 1.15, Math.sin(theta * 2) * 0.32, Math.sin(theta) * 1.15],
        shell,
        [Math.PI / 2, theta, theta * 0.4],
        8,
      )
      arm.scale.y = 1.2
    }

    this.scene.add(ship)
    this.alienShip = ship
  }

  createProbe() {
    const probe = new THREE.Group()
    const coreMaterial = makeMaterial(0xd9d7c7, { roughness: 0.42, metalness: 0.62 })
    const dark = makeMaterial(0x23282c, { roughness: 0.55, metalness: 0.74 })
    const light = makeMaterial(0x79f6ff, { roughness: 0.2, metalness: 0.1, emissive: 0x39d8ff, emissiveIntensity: 3.2 })

    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.34, 1), coreMaterial)
    probe.add(core)

    for (let i = 0; i < 3; i += 1) {
      const angle = (i / 3) * Math.PI * 2
      const arm = addCylinder(
        probe,
        0.035,
        0.06,
        0.9,
        [Math.cos(angle) * 0.38, 0, Math.sin(angle) * 0.38],
        dark,
        [Math.PI / 2, 0, -angle],
        8,
      )
      arm.rotation.z = angle + Math.PI / 2
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), light)
      tip.position.set(Math.cos(angle) * 0.82, 0, Math.sin(angle) * 0.82)
      probe.add(tip)
    }

    const probeLight = new THREE.PointLight(0x6fe9ff, 6, 7, 2)
    probe.add(probeLight)

    this.scene.add(probe)
    this.probe = probe
    this.updateProbeTransform(0)
  }

  bindInput() {
    this.onKeyDown = (event) => {
      const key = event.key.toLowerCase()
      const movementKeys = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', 'shift']
      if ([...movementKeys, 'e', 'escape'].includes(key)) event.preventDefault()
      if (key === 'e') {
        this.interact()
        return
      }
      if (key === 'escape' && this.inspectionOpen) {
        this.closeInspection()
        return
      }
      if (movementKeys.includes(key)) this.keys.add(key)
    }
    this.onKeyUp = (event) => this.keys.delete(event.key.toLowerCase())
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
  }

  bindPointer() {
    const canvas = this.renderer.domElement

    this.onPointerDown = (event) => {
      if (this.inspectionOpen || event.button !== 0) return
      this.cameraDrag.active = true
      this.cameraDrag.pointerId = event.pointerId
      this.cameraDrag.x = event.clientX
      this.cameraDrag.y = event.clientY
      this.cameraDrag.moved = false
      canvas.setPointerCapture?.(event.pointerId)
      canvas.classList.add('is-camera-dragging')
    }

    this.onPointerMove = (event) => {
      if (!this.cameraDrag.active || this.cameraDrag.pointerId !== event.pointerId) return
      const dx = event.clientX - this.cameraDrag.x
      const dy = event.clientY - this.cameraDrag.y
      if (Math.abs(dx) + Math.abs(dy) > 3) this.cameraDrag.moved = true
      this.cameraTargetYaw -= dx * 0.0028
      this.cameraTargetPitch = clamp(this.cameraTargetPitch + dy * 0.0021, 0.08, 0.72)
      this.cameraDrag.x = event.clientX
      this.cameraDrag.y = event.clientY
    }

    this.onPointerUp = (event) => {
      if (!this.cameraDrag.active || this.cameraDrag.pointerId !== event.pointerId) return
      const shouldPick = !this.cameraDrag.moved
      this.cameraDrag.active = false
      this.cameraDrag.pointerId = null
      canvas.releasePointerCapture?.(event.pointerId)
      canvas.classList.remove('is-camera-dragging')
      if (shouldPick) this.pickInteraction(event)
    }

    this.onPointerCancel = (event) => {
      if (this.cameraDrag.pointerId !== event.pointerId) return
      this.cameraDrag.active = false
      this.cameraDrag.pointerId = null
      canvas.classList.remove('is-camera-dragging')
    }

    this.onWheel = (event) => {
      if (this.inspectionOpen) return
      event.preventDefault()
      this.cameraTargetDistance = clamp(this.cameraTargetDistance + event.deltaY * 0.006, 8.5, 25)
    }

    canvas.addEventListener('pointerdown', this.onPointerDown)
    canvas.addEventListener('pointermove', this.onPointerMove)
    canvas.addEventListener('pointerup', this.onPointerUp)
    canvas.addEventListener('pointercancel', this.onPointerCancel)
    canvas.addEventListener('wheel', this.onWheel, { passive: false })
  }

  resize() {
    if (!this.renderer || !this.camera) return
    const width = Math.max(1, this.host.clientWidth)
    const height = Math.max(1, this.host.clientHeight)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height, false)
  }

  startVirtualMove(key, running = false) {
    const normalized = String(key).toLowerCase()
    this.keys.add(normalized)
    if (running) this.keys.add('shift')
  }

  stopVirtualMove(key) {
    const normalized = String(key).toLowerCase()
    this.keys.delete(normalized)
    this.keys.delete('shift')
  }

  frame = () => {
    if (!this.renderer || !this.scene || !this.camera || !this.probe) return
    const dt = Math.min(0.05, Math.max(0.001, this.clock.getDelta()))
    const elapsed = this.clock.elapsedTime

    if (!this.inspectionOpen) this.updateNavigation(dt)
    this.updateProbeTransform(elapsed)
    this.updateCamera(dt)
    this.updateWorldMotion(elapsed, dt)
    this.updatePrompt()
    this.renderer.render(this.scene, this.camera)
  }

  updateNavigation(dt) {
    const inward = this.keys.has('arrowup') || this.keys.has('w')
    const outward = this.keys.has('arrowdown') || this.keys.has('s')
    const left = this.keys.has('arrowleft') || this.keys.has('a')
    const right = this.keys.has('arrowright') || this.keys.has('d')
    const boost = this.keys.has('shift') ? 1.8 : 1

    const radialInput = (outward ? 1 : 0) - (inward ? 1 : 0)
    const angularInput = (right ? 1 : 0) - (left ? 1 : 0)

    this.radialVelocity = damp(this.radialVelocity, radialInput * 5.0 * boost, radialInput ? 4.4 : 6.2, dt)
    this.angularVelocity = damp(this.angularVelocity, angularInput * 0.52 * boost, angularInput ? 4.8 : 6.5, dt)

    if (!radialInput && Math.abs(this.radialVelocity) < 0.01) this.radialVelocity = 0
    if (!angularInput && Math.abs(this.angularVelocity) < 0.002) this.angularVelocity = 0

    this.orbitRadius = clamp(this.orbitRadius + this.radialVelocity * dt, 8.3, 24.2)
    this.orbitAngle = wrapAngle(this.orbitAngle + this.angularVelocity * dt)
  }

  updateProbeTransform(elapsed) {
    const y = Math.sin(this.orbitAngle * 1.7 + 0.4) * 0.7 + Math.sin(elapsed * 0.7) * 0.09
    this.probe.position.set(
      Math.cos(this.orbitAngle) * this.orbitRadius,
      y,
      Math.sin(this.orbitAngle) * this.orbitRadius,
    )

    const tangent = new THREE.Vector3(
      -Math.sin(this.orbitAngle),
      0.04,
      Math.cos(this.orbitAngle),
    ).normalize()
    const lookTarget = this.probe.position.clone().add(tangent)
    this.probe.lookAt(lookTarget)
    this.probe.rotateZ(Math.sin(elapsed * 1.1) * 0.025)
  }

  updateCamera(dt) {
    this.cameraYaw = damp(this.cameraYaw, this.cameraTargetYaw, 5.4, dt)
    this.cameraPitch = damp(this.cameraPitch, this.cameraTargetPitch, 5.0, dt)
    this.cameraDistance = damp(this.cameraDistance, this.cameraTargetDistance, 4.5, dt)

    const planetBias = 0.25
    const focus = this.probe.position.clone().multiplyScalar(1 - planetBias)
    const horizontal = Math.cos(this.cameraPitch) * this.cameraDistance
    const vertical = Math.sin(this.cameraPitch) * this.cameraDistance

    const target = new THREE.Vector3(
      this.probe.position.x + Math.cos(this.cameraYaw) * horizontal,
      this.probe.position.y + vertical + 1.1,
      this.probe.position.z + Math.sin(this.cameraYaw) * horizontal,
    )

    this.camera.position.x = damp(this.camera.position.x, target.x, 3.0, dt)
    this.camera.position.y = damp(this.camera.position.y, target.y, 2.8, dt)
    this.camera.position.z = damp(this.camera.position.z, target.z, 3.0, dt)
    this.camera.lookAt(focus)
  }

  updateWorldMotion(elapsed, dt) {
    if (this.planet) this.planet.rotation.y += dt * 0.012
    if (this.planetVeins) {
      this.planetVeins.rotation.y -= dt * 0.018
      this.planetVeins.material.opacity = 0.06 + Math.sin(elapsed * 0.65) * 0.016
    }
    if (this.atmosphere) this.atmosphere.scale.setScalar(1 + Math.sin(elapsed * 0.42) * 0.0025)
    if (this.planetHalo) this.planetHalo.rotation.z += dt * 0.018
    if (this.starfield) this.starfield.rotation.y += dt * 0.0012

    this.layerObjects.forEach((entry, index) => {
      entry.orbitGroup.rotation.y += dt * (0.0025 + index * 0.0005)
      entry.halo.rotation.z += dt * (0.42 + index * 0.06)
      const pulse = 1 + Math.sin(elapsed * 1.8 + index * 0.9) * 0.18
      entry.core.scale.setScalar(pulse)
      entry.ringMaterial.opacity = 0.13 + Math.sin(elapsed * 0.42 + index) * 0.025
    })

    if (this.earthShip) {
      this.earthShip.rotation.y += dt * 0.012
      this.earthShip.position.y = 6.2 + Math.sin(elapsed * 0.28) * 0.22
    }
    if (this.alienShip) {
      this.alienShip.rotation.z += dt * 0.022
      this.alienShip.rotation.y -= dt * 0.008
      this.alienShip.position.y = -4.2 + Math.sin(elapsed * 0.36 + 1.4) * 0.3
    }
  }

  getLayerWorldPosition(entry, target = new THREE.Vector3()) {
    entry.beacon.getWorldPosition(target)
    return target
  }

  nearestLayer() {
    if (!this.probe) return null
    let nearest = null
    const world = new THREE.Vector3()
    for (const entry of this.layerObjects) {
      this.getLayerWorldPosition(entry, world)
      const distance = world.distanceTo(this.probe.position)
      if (!nearest || distance < nearest.distance) nearest = { entry, distance }
    }
    return nearest
  }

  updatePrompt(force = false) {
    const nearest = this.nearestLayer()
    let prompt = null
    let location = 'NEXUS-7 ORBIT'
    let layer = null

    if (nearest && nearest.distance < 5.6) {
      layer = nearest.entry.layer.id
      location = nearest.entry.layer.name
      if (nearest.distance < 3.4 && !this.inspectionOpen) {
        prompt = {
          key: 'E',
          type: 'layer',
          label: `INSPECT ${nearest.entry.layer.name}`,
        }
      }
    }

    const signature = `${location}:${layer || 'none'}:${prompt?.label || 'none'}:${this.inspectionOpen}`
    if (force || signature !== this.lastStateSignature) {
      this.lastStateSignature = signature
      this.emitState({ location, layer, prompt })
    }
  }

  interact() {
    if (this.inspectionOpen) {
      this.closeInspection()
      return
    }
    const nearest = this.nearestLayer()
    if (!nearest || nearest.distance >= 3.6) return
    this.openInspection(nearest.entry.layer.id)
  }

  pickInteraction(event) {
    if (!this.renderer || this.inspectionOpen) return
    const rect = this.renderer.domElement.getBoundingClientRect()
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    this.raycaster.setFromCamera(this.pointer, this.camera)
    const hit = this.raycaster.intersectObjects(this.interactionTargets, false)[0]
    if (!hit) return
    const layerId = hit.object.userData.interactiveLayer
    const entry = this.layerObjects.find((item) => item.layer.id === layerId)
    if (!entry) return
    const world = this.getLayerWorldPosition(entry)
    if (world.distanceTo(this.probe.position) < 4.2) this.openInspection(layerId)
  }

  openInspection(layerId) {
    const entry = this.layerObjects.find((item) => item.layer.id === layerId)
    if (!entry) return
    this.inspectionOpen = true
    this.activeLayerId = layerId
    this.keys.clear()
    this.radialVelocity = 0
    this.angularVelocity = 0
    entry.core.material.emissiveIntensity = 5.2
    entry.ringMaterial.opacity = 0.34
    this.emitState({
      location: entry.layer.name,
      layer: layerId,
      prompt: null,
      inspection: true,
    })
  }

  closeInspection() {
    if (!this.inspectionOpen) return
    const entry = this.layerObjects.find((item) => item.layer.id === this.activeLayerId)
    if (entry) {
      entry.core.material.emissiveIntensity = 2.4
      entry.ringMaterial.opacity = 0.18
    }
    this.inspectionOpen = false
    this.activeLayerId = null
    this.emitState({ inspection: false })
    this.updatePrompt(true)
  }

  emitState(patch = {}) {
    this.callbacks.onState?.({
      mode: 'cosmic',
      renderer: this.rendererName,
      location: 'NEXUS-7 ORBIT',
      prompt: null,
      inspection: this.inspectionOpen,
      transition: null,
      layer: this.activeLayerId,
      ...patch,
    })
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    window.removeEventListener('resize', this.onResize)

    const canvas = this.renderer?.domElement
    canvas?.removeEventListener('pointerdown', this.onPointerDown)
    canvas?.removeEventListener('pointermove', this.onPointerMove)
    canvas?.removeEventListener('pointerup', this.onPointerUp)
    canvas?.removeEventListener('pointercancel', this.onPointerCancel)
    canvas?.removeEventListener('wheel', this.onWheel)

    this.renderer?.setAnimationLoop(null)
    const materials = new Set()
    const textures = new Set()
    this.scene?.traverse((object) => {
      object.geometry?.dispose?.()
      const materialList = object.material ? (Array.isArray(object.material) ? object.material : [object.material]) : []
      materialList.forEach((material) => {
        materials.add(material)
        if (material.map) textures.add(material.map)
      })
    })
    textures.forEach((texture) => texture.dispose?.())
    materials.forEach((material) => material.dispose?.())
    this.renderer?.dispose?.()
    this.renderer?.domElement?.remove()
    this.renderer = null
    this.scene = null
  }
}
