import * as THREE from 'three/webgpu'

const matte = (color, roughness = 0.72, metalness = 0.02) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness })

function mesh(geometry, material, { x = 0, y = 0, z = 0, cast = true, receive = true } = {}) {
  const value = new THREE.Mesh(geometry, material)
  value.position.set(x, y, z)
  value.castShadow = cast
  value.receiveShadow = receive
  return value
}

function limbSegment(radiusTop, radiusBottom, length, material) {
  const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, length, 12)
  geometry.translate(0, -length / 2, 0)
  return mesh(geometry, material)
}

function createArm(side, palette) {
  const shoulder = new THREE.Group()
  const upper = limbSegment(0.115, 0.1, 0.64, palette.jacket)
  const elbow = new THREE.Group()
  elbow.position.y = -0.61
  const lower = limbSegment(0.095, 0.072, 0.48, palette.jacketDark)
  const cuff = limbSegment(0.078, 0.074, 0.08, palette.shirt)
  cuff.position.y = -0.46
  const hand = mesh(new THREE.CapsuleGeometry(0.075, 0.12, 4, 10), palette.skin, { y: -0.58 })
  hand.scale.set(0.78, 1, 0.72)
  elbow.add(lower, cuff, hand)
  shoulder.add(upper, elbow)
  shoulder.position.set(0, 0.9, side * 0.43)
  shoulder.rotation.z = side * 0.08
  shoulder.userData.elbow = elbow
  return shoulder
}

function createLeg(side, palette) {
  const hip = new THREE.Group()
  const thigh = limbSegment(0.15, 0.13, 0.78, palette.trousers)
  const knee = new THREE.Group()
  knee.position.y = -0.74
  const shin = limbSegment(0.12, 0.095, 0.76, palette.trousersDark)
  const ankle = new THREE.Group()
  ankle.position.y = -0.72
  const foot = mesh(new THREE.CapsuleGeometry(0.1, 0.3, 4, 12), palette.shoes, { x: 0.1, y: -0.08 })
  foot.rotation.z = Math.PI / 2
  foot.scale.set(0.92, 1, 0.82)
  ankle.add(foot)
  knee.add(shin, ankle)
  hip.add(thigh, knee)
  hip.position.set(0, 1.31, side * 0.18)
  hip.userData.knee = knee
  hip.userData.ankle = ankle
  return hip
}

export function createHumanModel(options = {}) {
  const palette = {
    skin: matte(options.skin ?? 0xc99a78, 0.62),
    skinDark: matte(options.skinDark ?? 0xa96f51, 0.68),
    hair: matte(options.hair ?? 0x242321, 0.8),
    jacket: matte(options.jacket ?? 0x49685a, 0.7),
    jacketDark: matte(options.jacketDark ?? 0x344b41, 0.78),
    shirt: matte(options.shirt ?? 0xe7e1d6, 0.74),
    trousers: matte(options.trousers ?? 0x343a37, 0.78),
    trousersDark: matte(options.trousersDark ?? 0x282d2b, 0.82),
    shoes: matte(options.shoes ?? 0x171a18, 0.86),
    eye: matte(0x161816, 0.75),
  }

  const root = new THREE.Group()
  root.name = options.name ?? 'human'
  const baseScale = Math.abs(options.scale ?? 1)
  root.scale.setScalar(baseScale)
  const bodyWidth = options.bodyWidth ?? 1
  const shoulderWidth = options.shoulderWidth ?? 1
  const legSpread = options.legSpread ?? 1
  const armLength = options.armLength ?? 1
  const coatLength = options.coatLength ?? 0
  const headScale = options.headScale ?? 1
  const hairVolume = options.hairVolume ?? 1

  const shadow = mesh(
    new THREE.CircleGeometry(0.48, 28),
    new THREE.MeshBasicMaterial({ color: 0x101410, transparent: true, opacity: 0.18, depthWrite: false }),
    { y: 0.012, cast: false, receive: false },
  )
  shadow.rotation.x = -Math.PI / 2
  shadow.scale.y = 0.38
  root.add(shadow)

  const rig = new THREE.Group()
  root.add(rig)

  const hips = new THREE.Group()
  rig.add(hips)

  const pelvis = mesh(new THREE.CapsuleGeometry(0.31, 0.3, 4, 10), palette.trousers, { y: 1.24 })
  pelvis.rotation.z = Math.PI / 2
  pelvis.scale.set(0.76 * bodyWidth, 0.82, 0.82 * legSpread)
  hips.add(pelvis)

  const torso = new THREE.Group()
  torso.position.y = 1.24
  hips.add(torso)

  const torsoMesh = mesh(new THREE.CylinderGeometry(0.39, 0.34, 0.92, 16), palette.jacket, { y: 0.52 })
  torsoMesh.scale.set(bodyWidth, 1 + coatLength * 0.08, 0.76 * shoulderWidth)
  torso.add(torsoMesh)

  const shoulderLine = mesh(new THREE.CapsuleGeometry(0.16, 0.48, 4, 12), palette.jacket, { y: 0.84 })
  shoulderLine.rotation.x = Math.PI / 2
  shoulderLine.scale.set(0.9, shoulderWidth, bodyWidth)
  torso.add(shoulderLine)

  if (coatLength > 0.04) {
    const coat = mesh(new THREE.BoxGeometry(0.54 * bodyWidth, 0.42 + coatLength, 0.34 * shoulderWidth), palette.jacketDark, { x: 0.02, y: 0.18 - coatLength * 0.12, z: 0 })
    coat.rotation.z = 0.03
    torso.add(coat)
  }

  const shirt = mesh(new THREE.BoxGeometry(0.16, 0.72, 0.035), palette.shirt, { x: 0.345, y: 0.53, z: 0.04 })
  shirt.rotation.y = Math.PI / 2
  torso.add(shirt)

  const lapelTop = mesh(new THREE.BoxGeometry(0.03, 0.48, 0.18), palette.jacketDark, { x: 0.35, y: 0.66, z: 0.12 })
  lapelTop.rotation.z = -0.18
  torso.add(lapelTop)

  const button = mesh(new THREE.SphereGeometry(0.018, 8, 6), palette.jacketDark, { x: 0.365, y: 0.42, z: 0.02 })
  button.scale.x = 0.45
  torso.add(button)

  const neck = mesh(new THREE.CylinderGeometry(0.13, 0.14, 0.24, 14), palette.skin, { y: 1.08 })
  torso.add(neck)

  const headPivot = new THREE.Group()
  headPivot.position.y = 1.25
  torso.add(headPivot)

  const head = mesh(new THREE.SphereGeometry(0.29, 24, 18), palette.skin, { y: 0.18 })
  head.scale.set(0.9 * headScale, 1.08 * headScale, 0.86 * headScale)
  headPivot.add(head)

  const jaw = mesh(new THREE.SphereGeometry(0.215, 20, 14), palette.skin, { x: 0.035, y: 0.03 })
  jaw.scale.set(0.94 * headScale, 0.74 * headScale, 0.9 * headScale)
  headPivot.add(jaw)

  const hairCap = mesh(
    new THREE.SphereGeometry(0.302, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.58),
    palette.hair,
    { y: 0.27 },
  )
  hairCap.scale.set(0.92 * headScale, 0.78 * hairVolume, 0.88 * headScale)
  headPivot.add(hairCap)

  if (options.hairStyle === 'bun') {
    const bun = mesh(new THREE.SphereGeometry(0.11, 12, 10), palette.hair, { x: -0.05, y: 0.42, z: -0.03 })
    bun.scale.set(0.9, 0.8, 0.9)
    headPivot.add(bun)
  } else if (options.hairStyle === 'crop') {
    hairCap.scale.y *= 0.72
  }

  const nose = mesh(new THREE.ConeGeometry(0.045, 0.12, 10), palette.skinDark, { x: 0.28, y: 0.18 })
  nose.rotation.z = -Math.PI / 2
  headPivot.add(nose)

  ;[-1, 1].forEach((side) => {
    const eyeWhite = mesh(new THREE.SphereGeometry(0.038, 12, 8), palette.shirt, { x: 0.267, y: 0.235, z: side * 0.115 })
    eyeWhite.scale.set(0.52, 0.72, 1)
    const iris = mesh(new THREE.SphereGeometry(0.022, 10, 8), palette.eye, { x: 0.292, y: 0.235, z: side * 0.115 })
    iris.scale.set(0.5, 0.72, 0.72)
    const brow = mesh(new THREE.BoxGeometry(0.075, 0.016, 0.025), palette.hair, { x: 0.27, y: 0.298, z: side * 0.12 })
    brow.rotation.set(0, side * 0.06, -0.08)
    const ear = mesh(new THREE.SphereGeometry(0.055, 10, 8), palette.skinDark, { x: -0.005, y: 0.19, z: side * 0.25 })
    ear.scale.set(0.7, 1, 0.45)
    headPivot.add(eyeWhite, iris, brow, ear)
  })

  const mouth = mesh(new THREE.BoxGeometry(0.016, 0.018, 0.105), palette.skinDark, { x: 0.278, y: 0.055 })
  mouth.rotation.z = -0.05
  headPivot.add(mouth)

  const leftArm = createArm(-1, palette)
  const rightArm = createArm(1, palette)
  leftArm.position.z *= shoulderWidth
  rightArm.position.z *= shoulderWidth
  leftArm.scale.y = armLength
  rightArm.scale.y = armLength
  torso.add(leftArm, rightArm)

  const leftLeg = createLeg(-1, palette)
  const rightLeg = createLeg(1, palette)
  leftLeg.position.z *= legSpread
  rightLeg.position.z *= legSpread
  hips.add(leftLeg, rightLeg)

  if (options.accessory === 'backpack') {
    const bag = mesh(new THREE.BoxGeometry(0.24, 0.56, 0.48), palette.jacketDark, { x: -0.31, y: 0.62 })
    bag.rotation.z = -0.04
    torso.add(bag)
  } else if (options.accessory === 'satchel') {
    const strap = mesh(new THREE.BoxGeometry(0.04, 0.96, 0.05), palette.jacketDark, { x: 0.31, y: 0.56 })
    strap.rotation.x = 0.68
    const pouch = mesh(new THREE.BoxGeometry(0.18, 0.3, 0.28), palette.jacketDark, { x: -0.23, y: 0.1, z: 0.3 })
    pouch.rotation.z = -0.08
    torso.add(strap, pouch)
  }

  root.userData.rig = {
    root,
    rig,
    hips,
    torso,
    headPivot,
    shadow,
    leftArm,
    rightArm,
    leftElbow: leftArm.userData.elbow,
    rightElbow: rightArm.userData.elbow,
    leftLeg,
    rightLeg,
    leftKnee: leftLeg.userData.knee,
    rightKnee: rightLeg.userData.knee,
    leftAnkle: leftLeg.userData.ankle,
    rightAnkle: rightLeg.userData.ankle,
  }
  root.userData.phase = options.phase ?? 0
  root.userData.gait = {
    stride: options.stride ?? 0.92 + ((options.phase ?? 0) % 1) * 0.12,
    bounce: options.bounce ?? 0.9 + ((options.phase ?? 0) % 0.7) * 0.16,
    armSwing: options.armSwing ?? 0.88 + ((options.phase ?? 0) % 0.8) * 0.18,
  }
  root.userData.direction = options.direction ?? 1
  root.userData.facingDirection = null
  root.userData.turnYaw = options.direction && options.direction < 0 ? Math.PI : 0
  root.userData.baseScale = baseScale
  root.userData.palette = palette
  return root
}

function applyFacing(human, direction, dt = 0.016) {
  const facing = direction < 0 ? -1 : 1
  const baseScale = Math.abs(human.userData.baseScale ?? 1)

  // Never mirror skinned characters. Negative scale reverses normals, swaps
  // handedness, and makes a forward walk cycle read like moonwalking.
  human.scale.setScalar(baseScale)

  // Only update yaw when direction changes. This lets interaction animations
  // temporarily rotate the root without being overwritten every frame.
  human.userData.facingDirection = facing
  const targetYaw = facing < 0 ? Math.PI : 0
  const currentYaw = human.userData.turnYaw ?? human.rotation.y ?? 0
  let delta = targetYaw - currentYaw
  if (delta > Math.PI) delta -= Math.PI * 2
  if (delta < -Math.PI) delta += Math.PI * 2
  const nextYaw = currentYaw + delta * (1 - Math.exp(-10 * dt))
  human.userData.turnYaw = nextYaw
  human.rotation.y = nextYaw
}

export function poseHuman(human, dt, speed, running = false, direction = 1) {
  const rig = human.userData.rig
  if (!rig) return

  human.userData.direction = direction || human.userData.direction || 1
  applyFacing(human, human.userData.direction, dt)

  const absSpeed = Math.abs(speed)
  human.userData.phase += dt * (running ? 7.2 : 4.9) * Math.min(1.32, 0.4 + absSpeed / 3.8)
  const phase = human.userData.phase
  const gait = human.userData.gait || { stride: 1, bounce: 1, armSwing: 1 }
  const moving = absSpeed > 0.04

  if (!moving) {
    const breath = Math.sin(phase * 0.38) * 0.012
    rig.hips.position.y = breath
    rig.hips.position.z = Math.sin(phase * 0.17) * 0.004
    rig.torso.rotation.x = Math.sin(phase * 0.22) * 0.006
    rig.torso.rotation.z *= 0.86
    rig.headPivot.rotation.x = Math.sin(phase * 0.13) * 0.008
    rig.headPivot.rotation.z = Math.sin(phase * 0.22) * 0.014
    rig.leftArm.rotation.z += (-0.055 - rig.leftArm.rotation.z) * 0.12
    rig.rightArm.rotation.z += (0.055 - rig.rightArm.rotation.z) * 0.12
    rig.leftLeg.rotation.z *= 0.84
    rig.rightLeg.rotation.z *= 0.84
    rig.leftKnee.rotation.z *= 0.8
    rig.rightKnee.rotation.z *= 0.8
    rig.shadow.scale.x += (1 - rig.shadow.scale.x) * 0.08
    return
  }

  const strideAmp = (running ? 0.68 : 0.46) * gait.stride
  const armAmp = (running ? 0.58 : 0.42) * gait.armSwing
  const leftStride = Math.sin(phase)
  const rightStride = Math.sin(phase + Math.PI)
  const bounce = Math.abs(Math.sin(phase * 2))

  rig.hips.position.y = bounce * (running ? 0.06 : 0.03) * gait.bounce
  rig.hips.position.z = Math.sin(phase) * (running ? 0.026 : 0.016)
  rig.hips.rotation.z = Math.sin(phase) * (running ? 0.035 : 0.018)
  rig.hips.rotation.x = Math.sin(phase * 2) * (running ? 0.018 : 0.01)
  rig.torso.rotation.x = running ? -0.055 : -0.018
  rig.torso.rotation.z = -Math.sin(phase) * (running ? 0.042 : 0.022)
  rig.headPivot.rotation.x = bounce * (running ? -0.018 : -0.008)
  rig.headPivot.rotation.z = Math.sin(phase) * 0.012

  rig.leftLeg.rotation.z = leftStride * strideAmp
  rig.rightLeg.rotation.z = rightStride * strideAmp
  rig.leftKnee.rotation.z = Math.max(0, -leftStride) * (running ? 0.82 : 0.54)
  rig.rightKnee.rotation.z = Math.max(0, -rightStride) * (running ? 0.82 : 0.54)
  rig.leftAnkle.rotation.z = -rig.leftKnee.rotation.z * 0.3 - leftStride * 0.08
  rig.rightAnkle.rotation.z = -rig.rightKnee.rotation.z * 0.3 - rightStride * 0.08

  rig.leftArm.rotation.z = -leftStride * armAmp - 0.05
  rig.rightArm.rotation.z = -rightStride * armAmp + 0.05
  rig.leftElbow.rotation.z = -0.15 - Math.max(0, leftStride) * 0.3
  rig.rightElbow.rotation.z = 0.15 + Math.max(0, rightStride) * 0.3

  rig.shadow.scale.x = 1 - bounce * 0.12
  rig.shadow.material.opacity = 0.18 - bounce * 0.035
}

export function disposeHuman(human) {
  const materials = new Set()
  human.traverse((object) => {
    object.geometry?.dispose?.()
    if (object.material) {
      const list = Array.isArray(object.material) ? object.material : [object.material]
      list.forEach((material) => materials.add(material))
    }
  })
  materials.forEach((material) => material.dispose?.())
}
