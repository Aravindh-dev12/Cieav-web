import { Application, Container, Graphics, Text } from 'pixi.js'
import { gsap } from 'gsap'

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
const lerp = (from, to, amount) => from + (to - from) * amount

function makeText(text, size = 16, color = 0x1d211f, weight = '400') {
  return new Text({
    text,
    style: {
      fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
      fontSize: size,
      fontWeight: weight,
      fill: color,
      letterSpacing: size < 14 ? 1.5 : 0,
    },
  })
}

const DEFAULT_PALETTE = {
  skin: 0xcaa07d,
  skinShadow: 0xb98565,
  hair: 0x242522,
  jacket: 0x536f64,
  jacketDark: 0x3d554c,
  shirt: 0xe9e5dc,
  trousers: 0x343a37,
  trousersLight: 0x464c48,
  shoe: 0x1d211f,
}

function makeArm(side, palette, front = false) {
  const upper = new Container()
  upper.position.set(side * 15, 43)
  upper.pivot.set(0, 3)

  upper.addChild(
    new Graphics().roundRect(-5, 0, 10, 31, 5).fill(front ? palette.jacket : palette.jacketDark),
  )

  const elbow = new Graphics().circle(0, 29, 5.2).fill(front ? palette.jacket : palette.jacketDark)
  upper.addChild(elbow)

  const forearm = new Container()
  forearm.position.set(0, 29)
  forearm.pivot.set(0, 2)
  forearm.addChild(
    new Graphics().roundRect(-4.3, 0, 8.6, 27, 4.3).fill(palette.skin),
    new Graphics().circle(0, 29, 4.5).fill(palette.skin),
  )
  upper.addChild(forearm)

  return { upper, forearm }
}

function makeLeg(side, palette, front = false) {
  const upper = new Container()
  upper.position.set(side * 8, 80)
  upper.pivot.set(0, 3)
  upper.addChild(
    new Graphics().roundRect(-6, 0, 12, 37, 6).fill(front ? palette.trousersLight : palette.trousers),
  )

  const lower = new Container()
  lower.position.set(0, 35)
  lower.pivot.set(0, 3)
  lower.addChild(
    new Graphics().roundRect(-5, 0, 10, 36, 5).fill(front ? palette.trousersLight : palette.trousers),
  )

  const shoe = new Graphics()
    .moveTo(-5, 30)
    .lineTo(7, 30)
    .quadraticCurveTo(18, 31, 21, 37)
    .quadraticCurveTo(18, 42, 8, 42)
    .lineTo(-7, 42)
    .quadraticCurveTo(-10, 38, -5, 30)
    .fill(palette.shoe)
  lower.addChild(shoe)
  upper.addChild(lower)

  return { upper, lower }
}

function makeCharacter(options = {}) {
  const palette = { ...DEFAULT_PALETTE, ...(options.palette || {}) }
  const root = new Container()
  root.label = options.label || 'traveler'

  const shadow = new Graphics().ellipse(0, 2, 36, 8).fill({ color: 0x172019, alpha: options.npc ? 0.11 : 0.18 })
  root.addChild(shadow)

  const body = new Container()
  body.y = -136
  root.addChild(body)

  const backArm = makeArm(-1, palette, false)
  const backLeg = makeLeg(-1, palette, false)
  body.addChild(backArm.upper, backLeg.upper)

  const torso = new Container()
  body.addChild(torso)

  torso.addChild(
    new Graphics()
      .moveTo(-19, 38)
      .quadraticCurveTo(-22, 58, -15, 82)
      .lineTo(15, 82)
      .quadraticCurveTo(22, 58, 19, 38)
      .quadraticCurveTo(0, 25, -19, 38)
      .fill(palette.jacket),
  )
  torso.addChild(new Graphics().roundRect(-7, 33, 14, 47, 4).fill(palette.shirt))
  torso.addChild(
    new Graphics().moveTo(-16, 39).lineTo(-4, 57).lineTo(-2, 40).fill(palette.jacketDark),
    new Graphics().moveTo(16, 39).lineTo(4, 57).lineTo(2, 40).fill(palette.jacketDark),
  )
  torso.addChild(new Graphics().roundRect(-5, 24, 10, 14, 4).fill(palette.skin))
  torso.addChild(new Graphics().roundRect(-14, 77, 28, 10, 4).fill(palette.trousers))

  const head = new Container()
  head.position.set(0, 15)
  torso.addChild(head)

  head.addChild(new Graphics().ellipse(0, 0, 13, 16).fill(palette.skin))
  head.addChild(new Graphics().ellipse(-13, 1, 2.7, 4.5).fill(palette.skinShadow))
  head.addChild(new Graphics().ellipse(13, 1, 2.7, 4.5).fill(palette.skinShadow))

  const hair = new Graphics()
    .moveTo(-13, -1)
    .quadraticCurveTo(-13, -16, 0, -17)
    .quadraticCurveTo(15, -15, 13, 1)
    .quadraticCurveTo(8, -5, 2, -9)
    .quadraticCurveTo(-4, -2, -13, -1)
    .fill(palette.hair)
  head.addChild(hair)

  head.addChild(
    new Graphics().moveTo(7, 0).lineTo(10, 2).lineTo(7.5, 3.3).stroke({ color: palette.skinShadow, width: 1 }),
    new Graphics().moveTo(4, 7).quadraticCurveTo(7, 8.6, 10, 7).stroke({ color: 0x865e4b, width: 1, alpha: 0.75 }),
    new Graphics().moveTo(2, -3).lineTo(8, -3.5).stroke({ color: palette.hair, width: 1.2, alpha: 0.85 }),
  )
  const eye = new Graphics().circle(6.5, -0.8, 1.2).fill(0x1d211f)
  head.addChild(eye)

  const frontLeg = makeLeg(1, palette, true)
  const frontArm = makeArm(1, palette, true)
  body.addChild(frontLeg.upper, frontArm.upper)

  if (!options.npc) {
    const bag = new Graphics()
      .roundRect(-19, 45, 7, 27, 3)
      .fill({ color: 0x263630, alpha: 0.75 })
    body.addChildAt(bag, 0)
  }

  root.parts = {
    body,
    torso,
    head,
    shadow,
    eye,
    frontUpperArm: frontArm.upper,
    frontForearm: frontArm.forearm,
    backUpperArm: backArm.upper,
    backForearm: backArm.forearm,
    frontUpperLeg: frontLeg.upper,
    frontLowerLeg: frontLeg.lower,
    backUpperLeg: backLeg.upper,
    backLowerLeg: backLeg.lower,
  }
  root.walkPhase = Math.random() * Math.PI * 2
  root.breathPhase = Math.random() * Math.PI * 2
  root.npc = Boolean(options.npc)
  return root
}

function applyCharacterPose(character, phase, moving, running = false, reducedMotion = false) {
  const parts = character.parts
  const {
    body,
    torso,
    head,
    shadow,
    frontUpperArm,
    frontForearm,
    backUpperArm,
    backForearm,
    frontUpperLeg,
    frontLowerLeg,
    backUpperLeg,
    backLowerLeg,
  } = parts

  if (!moving || reducedMotion) {
    const breath = Math.sin(character.breathPhase || 0) * 0.8
    body.y = lerp(body.y, -136 - breath, 0.08)
    body.rotation = lerp(body.rotation, 0, 0.1)
    torso.rotation = lerp(torso.rotation, 0, 0.08)
    head.rotation = lerp(head.rotation, 0, 0.08)
    frontUpperArm.rotation = lerp(frontUpperArm.rotation, 0.035, 0.1)
    backUpperArm.rotation = lerp(backUpperArm.rotation, -0.035, 0.1)
    frontForearm.rotation = lerp(frontForearm.rotation, -0.06, 0.1)
    backForearm.rotation = lerp(backForearm.rotation, 0.06, 0.1)
    frontUpperLeg.rotation = lerp(frontUpperLeg.rotation, 0, 0.1)
    backUpperLeg.rotation = lerp(backUpperLeg.rotation, 0, 0.1)
    frontLowerLeg.rotation = lerp(frontLowerLeg.rotation, 0, 0.1)
    backLowerLeg.rotation = lerp(backLowerLeg.rotation, 0, 0.1)
    shadow.scale.x = lerp(shadow.scale.x, 1, 0.08)
    return
  }

  const swing = Math.sin(phase)
  const opposite = Math.sin(phase + Math.PI)
  const stride = running ? 0.52 : 0.38
  const armStride = running ? 0.62 : 0.46
  const bob = Math.abs(Math.cos(phase * 2)) * (running ? 4.2 : 2.2)
  const frontKnee = Math.max(0, -swing) * (running ? 0.78 : 0.52)
  const backKnee = Math.max(0, swing) * (running ? 0.78 : 0.52)

  body.y = -136 - bob
  body.rotation = swing * (running ? 0.02 : 0.012)
  torso.rotation = -swing * 0.015
  head.rotation = swing * 0.008

  frontUpperArm.rotation = swing * armStride
  backUpperArm.rotation = opposite * armStride
  frontForearm.rotation = -0.12 - swing * 0.16
  backForearm.rotation = 0.12 + swing * 0.16

  frontUpperLeg.rotation = -swing * stride
  backUpperLeg.rotation = swing * stride
  frontLowerLeg.rotation = frontKnee
  backLowerLeg.rotation = backKnee

  shadow.scale.x = 1 - bob * 0.035
  shadow.alpha = 0.74 - bob * 0.045
}

function drawOutdoorScene(width, height) {
  const root = new Container()
  const groundY = height - 112

  root.addChild(new Graphics().rect(0, 0, width, height).fill(0xdce4de))
  root.addChild(new Graphics().rect(0, 0, width, height * 0.44).fill({ color: 0xf4f5ef, alpha: 0.48 }))
  root.addChild(new Graphics().circle(width * 0.75, 112, 94).fill({ color: 0xfff2cf, alpha: 0.72 }))

  const far = new Graphics().moveTo(0, groundY - 176)
  for (let x = 0; x <= width; x += 150) {
    far.lineTo(x, groundY - 170 - Math.sin(x * 0.0055) * 44 - Math.cos(x * 0.0022) * 34)
  }
  far.lineTo(width, groundY).lineTo(0, groundY).fill({ color: 0x99a59b, alpha: 0.52 })
  root.addChild(far)

  const mid = new Graphics().moveTo(0, groundY - 78)
  for (let x = 0; x <= width; x += 100) mid.lineTo(x, groundY - 74 - Math.sin(x * 0.0105) * 25)
  mid.lineTo(width, groundY + 20).lineTo(0, groundY + 20).fill({ color: 0x7f8f83, alpha: 0.46 })
  root.addChild(mid)

  for (let i = 0; i < 31; i += 1) {
    const x = 90 + i * 108
    const trunkH = 86 + (i % 4) * 17
    root.addChild(
      new Graphics().roundRect(x, groundY - trunkH, 7, trunkH, 3).fill({ color: 0x555e57, alpha: 0.5 }),
      new Graphics().ellipse(x + 3, groundY - trunkH - 18, 30 + (i % 3) * 5, 27 + (i % 2) * 6).fill({ color: i % 2 ? 0x718276 : 0x7c8b7e, alpha: 0.62 }),
    )
  }

  const path = new Graphics()
    .moveTo(0, groundY - 8)
    .quadraticCurveTo(580, groundY - 27, 1120, groundY - 8)
    .quadraticCurveTo(1570, groundY + 20, 2130, groundY - 10)
    .quadraticCurveTo(2680, groundY - 35, width, groundY - 12)
    .lineTo(width, height)
    .lineTo(0, height)
    .fill(0xb4a68e)
  root.addChild(path)

  root.addChild(
    new Graphics()
      .moveTo(0, groundY - 8)
      .quadraticCurveTo(580, groundY - 27, 1120, groundY - 8)
      .quadraticCurveTo(1570, groundY + 20, 2130, groundY - 10)
      .quadraticCurveTo(2680, groundY - 35, width, groundY - 12)
      .stroke({ color: 0x615c51, width: 2, alpha: 0.28 }),
  )

  for (let i = 0; i < 68; i += 1) {
    const x = 45 + i * 49
    const y = groundY + 18 + (i % 5) * 13
    root.addChild(
      new Graphics().ellipse(x, y, 5 + (i % 3), 2.2 + (i % 2)).fill({ color: i % 2 ? 0x7f7565 : 0x998d78, alpha: 0.28 }),
    )
  }

  for (let i = 0; i < 26; i += 1) {
    const x = 110 + i * 126
    const grass = new Graphics()
      .moveTo(x, groundY - 2)
      .lineTo(x - 6, groundY - 22 - (i % 4) * 3)
      .moveTo(x, groundY - 2)
      .lineTo(x + 4, groundY - 26 - (i % 3) * 4)
      .moveTo(x + 1, groundY - 3)
      .lineTo(x + 10, groundY - 17)
      .stroke({ color: 0x667669, width: 1.4, alpha: 0.45 })
    root.addChild(grass)
  }

  return { root, groundY }
}

function drawWindowBay(building, x, y, w, h) {
  building.addChild(
    new Graphics().roundRect(x, y, w, h, 5).fill({ color: 0x78918a, alpha: 0.42 }).stroke({ color: 0xf5fbf8, width: 1, alpha: 0.34 }),
    new Graphics().rect(x + w * 0.48, y + 4, 1.5, h - 8).fill({ color: 0x405049, alpha: 0.34 }),
    new Graphics().rect(x + 4, y + h * 0.52, w - 8, 1.5).fill({ color: 0x405049, alpha: 0.28 }),
  )

  building.addChild(
    new Graphics()
      .moveTo(x + 8, y + h - 12)
      .lineTo(x + w * 0.7, y + 9)
      .stroke({ color: 0xffffff, width: 2, alpha: 0.16 }),
    new Graphics()
      .moveTo(x + w * 0.34, y + h - 7)
      .lineTo(x + w - 7, y + h * 0.24)
      .stroke({ color: 0xffffff, width: 1.2, alpha: 0.1 }),
  )
}

function drawBuilding(groundY) {
  const building = new Container()
  building.position.set(1760, groundY - 392)

  building.addChild(new Graphics().ellipse(342, 390, 360, 30).fill({ color: 0x1c221e, alpha: 0.13 }))

  const sideWall = new Graphics()
    .moveTo(574, 40)
    .lineTo(704, 88)
    .lineTo(704, 392)
    .lineTo(574, 392)
    .closePath()
    .fill(0x5e6761)
    .stroke({ color: 0x39413c, width: 1.4, alpha: 0.7 })
  building.addChild(sideWall)

  const roof = new Graphics()
    .moveTo(-18, 14)
    .lineTo(566, 14)
    .lineTo(704, 63)
    .lineTo(108, 63)
    .closePath()
    .fill(0x6b746e)
  building.addChild(roof)

  building.addChild(
    new Graphics().roundRect(0, 40, 574, 352, 4).fill(0x7c837d).stroke({ color: 0x3e4641, width: 1.5, alpha: 0.8 }),
    new Graphics().rect(0, 342, 574, 50).fill(0x626963),
  )

  for (let y = 82; y < 336; y += 34) {
    building.addChild(new Graphics().rect(0, y, 574, 1).fill({ color: 0x4f5752, alpha: 0.14 }))
  }
  for (let x = 72; x < 560; x += 92) {
    building.addChild(new Graphics().rect(x, 40, 1, 302).fill({ color: 0x4f5752, alpha: 0.1 }))
  }

  drawWindowBay(building, 28, 72, 112, 126)
  drawWindowBay(building, 158, 72, 112, 126)
  drawWindowBay(building, 288, 72, 112, 126)
  drawWindowBay(building, 418, 72, 128, 126)

  for (const x of [18, 148, 278, 408, 556]) {
    building.addChild(new Graphics().rect(x, 54, 9, 292).fill({ color: 0x525a55, alpha: 0.62 }))
  }

  const sign = makeText('CONSEQUENCE BUILDING', 13, 0xf0f3f0, '600')
  sign.position.set(31, 221)
  building.addChild(sign)
  const sub = makeText('TRUSTED SEMANTIC COMPILER  /  AUTHORITY = 0', 9, 0xdbe2dd, '500')
  sub.position.set(31, 243)
  building.addChild(sub)

  building.addChild(
    new Graphics().rect(424, 231, 134, 9).fill(0x545d57),
    new Graphics().moveTo(416, 240).lineTo(570, 240).lineTo(556, 264).lineTo(430, 264).closePath().fill(0x69736d),
    new Graphics().rect(432, 258, 4, 84).fill({ color: 0x404842, alpha: 0.7 }),
    new Graphics().rect(552, 258, 4, 84).fill({ color: 0x404842, alpha: 0.7 }),
  )

  const doorLight = new Graphics().roundRect(437, 264, 116, 128, 5).fill({ color: 0xd9f1e4, alpha: 0.08 })
  building.addChild(doorLight)
  building.addChild(new Graphics().roundRect(441, 268, 108, 124, 4).fill(0x343b37).stroke({ color: 0xe8eee9, width: 1.3, alpha: 0.25 }))

  const doorPanel = new Container()
  doorPanel.position.set(447, 273)
  doorPanel.addChild(
    new Graphics().roundRect(0, 0, 96, 119, 3).fill({ color: 0xb8c9c2, alpha: 0.82 }).stroke({ color: 0xf7fbf9, width: 1.2, alpha: 0.5 }),
    new Graphics().rect(4, 5, 1.4, 108).fill({ color: 0xffffff, alpha: 0.25 }),
    new Graphics().moveTo(8, 104).lineTo(79, 16).stroke({ color: 0xffffff, width: 2, alpha: 0.14 }),
    new Graphics().circle(79, 62, 3.2).fill(0x2d332f),
  )
  building.addChild(doorPanel)

  building.addChild(
    new Graphics().roundRect(420, 389, 158, 8, 3).fill(0x8e877a),
    new Graphics().roundRect(410, 397, 178, 8, 3).fill(0x9b9281),
    new Graphics().roundRect(399, 405, 200, 8, 3).fill(0xa79c88),
  )

  building.addChild(
    new Graphics().roundRect(368, 316, 32, 68, 5).fill(0x5a625c),
    new Graphics().ellipse(384, 308, 25, 15).fill(0x607864),
    new Graphics().roundRect(610, 318, 30, 66, 5).fill(0x515a54),
    new Graphics().ellipse(625, 310, 24, 14).fill(0x6b7c6d),
  )

  building.addChild(
    new Graphics().roundRect(529, 280, 13, 26, 3).fill(0x242a26),
    new Graphics().circle(535.5, 287, 3.2).fill(0xb9d59f),
  )

  building.doorPanel = doorPanel
  building.doorLight = doorLight
  building.doorWorldX = 1760 + 495
  return building
}

function drawInterior(width, height) {
  const root = new Container()
  const groundY = height - 112

  root.addChild(new Graphics().rect(0, 0, width, height).fill(0x171c1a))
  root.addChild(new Graphics().rect(0, 0, width, 116).fill(0x202825))
  root.addChild(new Graphics().rect(0, groundY, width, height - groundY).fill(0x292d2a))

  for (let x = 0; x < width; x += 210) {
    root.addChild(new Graphics().rect(x, 0, 12, groundY).fill({ color: 0x313936, alpha: 0.72 }))
  }
  for (let x = 190; x < width; x += 240) {
    root.addChild(new Graphics().rect(x, 38, 168, 8).fill({ color: 0xa3b9ae, alpha: 0.13 }))
    root.addChild(new Graphics().ellipse(x + 84, 48, 70, 34).fill({ color: 0xdfe9e4, alpha: 0.035 }))
  }

  root.addChild(new Graphics().roundRect(145, 108, 1310, groundY - 108, 10).fill({ color: 0x303835, alpha: 0.88 }).stroke({ color: 0xdce7e0, width: 1, alpha: 0.12 }))

  for (let x = 190; x < 1390; x += 180) {
    root.addChild(
      new Graphics().roundRect(x, 146, 146, 164, 7).fill({ color: 0x91a69c, alpha: 0.08 }).stroke({ color: 0xd9e5de, width: 1, alpha: 0.12 }),
      new Graphics().moveTo(x + 8, 294).lineTo(x + 118, 158).stroke({ color: 0xffffff, width: 1.2, alpha: 0.07 }),
    )
  }

  const roomTitle = makeText('TRUSTED SEMANTIC COMPILER', 16, 0xe6ede9, '600')
  roomTitle.position.set(196, 364)
  root.addChild(roomTitle)
  const roomSub = makeText('Proposal in. Trusted consequence semantics out.', 11, 0xaebdb5, '400')
  roomSub.position.set(196, 395)
  root.addChild(roomSub)

  root.addChild(
    new Graphics().roundRect(640, groundY - 94, 230, 16, 5).fill(0x3b4540),
    new Graphics().roundRect(662, groundY - 172, 82, 80, 8).fill(0x222a26).stroke({ color: 0xdbe6df, width: 1, alpha: 0.14 }),
    new Graphics().roundRect(760, groundY - 172, 82, 80, 8).fill(0x222a26).stroke({ color: 0xdbe6df, width: 1, alpha: 0.14 }),
    new Graphics().rect(674, groundY - 158, 58, 3).fill({ color: 0x8fa89a, alpha: 0.34 }),
    new Graphics().rect(772, groundY - 145, 58, 3).fill({ color: 0x8fa89a, alpha: 0.25 }),
  )

  root.addChild(new Graphics().roundRect(1000, groundY - 156, 216, 156, 13).fill({ color: 0x0f1512, alpha: 0.94 }).stroke({ color: 0xe0ebe4, width: 1.2, alpha: 0.24 }))
  root.addChild(new Graphics().roundRect(1016, groundY - 140, 184, 96, 8).fill({ color: 0xaed1bf, alpha: 0.11 }).stroke({ color: 0xbce0cd, width: 1, alpha: 0.34 }))
  const consoleScreen = new Graphics().roundRect(1028, groundY - 128, 160, 73, 6).fill({ color: 0xb6d7c7, alpha: 0.13 })
  root.addChild(consoleScreen)

  const line1 = makeText('PROPOSAL', 8, 0x9eb8aa, '600')
  line1.position.set(1040, groundY - 118)
  root.addChild(line1)
  const line2 = makeText('Pay supplier', 15, 0xe8f0eb, '500')
  line2.position.set(1040, groundY - 94)
  root.addChild(line2)
  const line3 = makeText('AUTHORITY = 0', 9, 0xd7a977, '600')
  line3.position.set(1040, groundY - 65)
  root.addChild(line3)

  root.addChild(
    new Graphics().roundRect(186, groundY - 120, 106, 120, 5).fill(0x1e2521).stroke({ color: 0xdfe8e2, width: 1, alpha: 0.18 }),
    new Graphics().roundRect(193, groundY - 113, 92, 113, 3).fill({ color: 0x81968d, alpha: 0.28 }),
    new Graphics().moveTo(201, groundY - 10).lineTo(272, groundY - 102).stroke({ color: 0xffffff, width: 1.5, alpha: 0.09 }),
  )
  const exitLabel = makeText('EXIT', 8, 0xcbd7d0, '600')
  exitLabel.position.set(225, groundY - 138)
  root.addChild(exitLabel)

  for (let x = 360; x < 1380; x += 180) {
    root.addChild(new Graphics().moveTo(x, groundY).lineTo(x + 64, height).stroke({ color: 0x0f1311, width: 1, alpha: 0.17 }))
  }
  for (let y = groundY + 18; y < height; y += 22) {
    root.addChild(new Graphics().rect(0, y, width, 1).fill({ color: 0xffffff, alpha: 0.035 }))
  }

  const operator = makeCharacter({
    npc: true,
    label: 'operator',
    palette: { jacket: 0x6d746f, jacketDark: 0x4f5652, trousers: 0x2f3532, trousersLight: 0x3b423e },
  })
  operator.scale.set(0.78)
  operator.position.set(780, groundY)
  root.addChild(operator)

  root.groundY = groundY
  root.consoleX = 1106
  root.exitX = 240
  root.consoleScreen = consoleScreen
  root.npcs = [{ node: operator, origin: 780, range: 48, speed: 0.00022, phase: 1.4, dir: 1 }]
  return root
}

export class WorldRuntime {
  constructor(host, callbacks = {}) {
    this.host = host
    this.callbacks = callbacks
    this.app = null
    this.outdoor = null
    this.interior = null
    this.character = null
    this.building = null
    this.mode = 'outside'
    this.keys = new Set()
    this.velocity = 0
    this.direction = 1
    this.cameraX = 0
    this.worldWidth = 3400
    this.inspectionOpen = false
    this.rendererName = 'WebGPU'
    this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    this.elapsed = 0
    this.outdoorNpcs = []
  }

  async init() {
    this.app = await this.createApp('webgpu').catch(async () => {
      this.rendererName = 'WebGL fallback'
      return this.createApp('webgl')
    })

    this.app.canvas.className = 'cieav-world-canvas'
    this.host.appendChild(this.app.canvas)

    const height = Math.max(560, this.host.clientHeight)
    const { root: outdoor, groundY } = drawOutdoorScene(this.worldWidth, height)
    this.outdoor = outdoor
    this.outdoor.groundY = groundY
    this.building = drawBuilding(groundY)
    this.outdoor.addChild(this.building)

    this.addOutdoorPeople(groundY)

    this.interior = drawInterior(1600, height)
    this.interior.alpha = 0
    this.interior.visible = false

    this.app.stage.addChild(this.outdoor, this.interior)

    this.character = makeCharacter()
    this.character.position.set(310, groundY)
    this.outdoor.addChild(this.character)

    this.bindBuildingInteraction()
    this.bindInput()
    this.app.ticker.add(this.tick)
    this.emitState()
  }

  async createApp(preference) {
    const app = new Application()
    await app.init({
      resizeTo: this.host,
      preference,
      powerPreference: 'high-performance',
      antialias: true,
      backgroundAlpha: 0,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
    })
    return app
  }

  addOutdoorPeople(groundY) {
    const people = [
      {
        x: 1120,
        scale: 0.72,
        range: 82,
        speed: 0.00027,
        palette: { jacket: 0x7f675c, jacketDark: 0x624d45, trousers: 0x3a3d3b, trousersLight: 0x474b48, hair: 0x342d28 },
      },
      {
        x: 2860,
        scale: 0.68,
        range: 58,
        speed: 0.0002,
        palette: { jacket: 0x667184, jacketDark: 0x4f5867, trousers: 0x33383b, trousersLight: 0x42484c, hair: 0x221f1d },
      },
    ]

    this.outdoorNpcs = people.map((config, index) => {
      const node = makeCharacter({ npc: true, label: `walker-${index + 1}`, palette: config.palette })
      node.scale.set(config.scale)
      node.position.set(config.x, groundY)
      node.alpha = 0.82
      this.outdoor.addChild(node)
      return { node, origin: config.x, range: config.range, speed: config.speed, phase: index * 2.1, dir: index % 2 ? -1 : 1 }
    })
  }

  bindBuildingInteraction() {
    const hit = new Graphics().rect(this.building.doorWorldX - 78, this.outdoor.groundY - 132, 156, 140).fill({ color: 0xffffff, alpha: 0.001 })
    hit.eventMode = 'static'
    hit.cursor = 'pointer'
    hit.on('pointertap', () => {
      if (this.mode === 'outside' && Math.abs(this.character.x - this.building.doorWorldX) < 160) this.interact()
    })
    this.outdoor.addChild(hit)
  }

  bindInput() {
    this.onKeyDown = (event) => {
      const key = event.key.toLowerCase()
      if (['arrowleft', 'arrowright', 'a', 'd', 'e', 'escape'].includes(key)) event.preventDefault()
      if (key === 'e') {
        this.interact()
        return
      }
      if (key === 'escape' && this.inspectionOpen) {
        this.closeInspection()
        return
      }
      if (['arrowleft', 'arrowright', 'a', 'd', 'shift'].includes(key)) this.keys.add(key)
    }
    this.onKeyUp = (event) => this.keys.delete(event.key.toLowerCase())
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
  }

  startVirtualMove(direction, running = false) {
    this.keys.add(direction < 0 ? 'arrowleft' : 'arrowright')
    if (running) this.keys.add('shift')
  }

  stopVirtualMove(direction) {
    this.keys.delete(direction < 0 ? 'arrowleft' : 'arrowright')
    this.keys.delete('shift')
  }

  tick = (ticker) => {
    const deltaMS = ticker.deltaMS
    this.elapsed += deltaMS
    this.animateNpcs(deltaMS)

    if (!this.character || this.mode === 'transition' || this.inspectionOpen) {
      if (this.character) this.animateCharacter(deltaMS, false)
      return
    }

    const left = this.keys.has('arrowleft') || this.keys.has('a')
    const right = this.keys.has('arrowright') || this.keys.has('d')
    const running = this.keys.has('shift')
    const input = left === right ? 0 : left ? -1 : 1
    if (input) this.direction = input

    const target = input * (running ? 7.0 : 4.0)
    const acceleration = input ? 0.145 : 0.085
    this.velocity = lerp(this.velocity, target, 1 - Math.pow(1 - acceleration, deltaMS / 16.67))
    if (!input && Math.abs(this.velocity) < 0.025) this.velocity = 0

    if (this.mode === 'outside') this.moveOutside(deltaMS)
    if (this.mode === 'inside') this.moveInside(deltaMS)
    this.animateCharacter(deltaMS, Math.abs(this.velocity) > 0.12, running)
    this.updatePrompt()
  }

  animateNpcs(deltaMS) {
    const groups = this.mode === 'inside' ? (this.interior?.npcs || []) : this.outdoorNpcs
    if (!groups?.length) return

    groups.forEach((npc) => {
      npc.phase += deltaMS * npc.speed
      const walkPhase = npc.phase * 19
      const travel = Math.sin(npc.phase) * npc.range
      const nextX = npc.origin + travel
      const dir = Math.cos(npc.phase) >= 0 ? 1 : -1
      npc.node.x = nextX
      npc.node.scale.x = Math.abs(npc.node.scale.x) * dir
      npc.node.breathPhase += deltaMS * 0.0014
      applyCharacterPose(npc.node, walkPhase, true, false, this.reducedMotion)
    })
  }

  moveOutside(deltaMS) {
    const step = this.velocity * deltaMS / 16.67
    const doorStop = this.building.doorWorldX - 82
    let nextX = clamp(this.character.x + step, 170, this.worldWidth - 160)
    if (this.building.doorPanel.scale.x > 0.2 && this.character.x < doorStop && nextX > doorStop) nextX = doorStop
    this.character.x = nextX

    const viewport = this.host.clientWidth
    const desired = clamp(this.character.x - viewport * 0.36, 0, Math.max(0, this.worldWidth - viewport))
    this.cameraX = lerp(this.cameraX, desired, 0.072)
    this.outdoor.x = -this.cameraX
  }

  moveInside(deltaMS) {
    this.character.x = clamp(this.character.x + this.velocity * deltaMS / 16.67, 205, 1370)
    const viewport = this.host.clientWidth
    const desired = clamp(this.character.x - viewport * 0.42, 0, Math.max(0, 1600 - viewport))
    this.cameraX = lerp(this.cameraX, desired, 0.082)
    this.interior.x = -this.cameraX
  }

  animateCharacter(deltaMS, moving, running = false) {
    this.character.scale.x = this.direction < 0 ? -1 : 1
    this.character.breathPhase += deltaMS * 0.0015
    if (moving) this.character.walkPhase += deltaMS * (running ? 0.0135 : 0.0092)
    applyCharacterPose(this.character, this.character.walkPhase, moving, running, this.reducedMotion)
  }

  updatePrompt() {
    let prompt = null
    let location = this.mode

    if (this.mode === 'outside') {
      const distance = Math.abs(this.character.x - this.building.doorWorldX)
      if (distance < 170) prompt = { key: 'E', label: 'OPEN CONSEQUENCE BUILDING', type: 'door' }
      location = distance < 410 ? 'boundary' : 'outside'
    }

    if (this.mode === 'inside') {
      const terminalDistance = Math.abs(this.character.x - this.interior.consoleX)
      const exitDistance = Math.abs(this.character.x - this.interior.exitX)
      if (terminalDistance < 125) prompt = { key: 'E', label: 'INSPECT CONSEQUENCE', type: 'console' }
      else if (exitDistance < 105) prompt = { key: 'E', label: 'EXIT BUILDING', type: 'exit' }
      location = terminalDistance < 270 ? 'compiler' : 'inside'
    }

    const signature = `${location}:${prompt?.type || 'none'}:${Math.round(this.character.x / 30)}`
    if (signature !== this.lastStateSignature) {
      this.lastStateSignature = signature
      this.emitState({ location, prompt })
    }
  }

  interact() {
    if (this.mode === 'transition') return
    if (this.inspectionOpen) {
      this.closeInspection()
      return
    }
    if (this.mode === 'outside' && Math.abs(this.character.x - this.building.doorWorldX) < 180) {
      this.enterBuilding()
      return
    }
    if (this.mode === 'inside') {
      if (Math.abs(this.character.x - this.interior.consoleX) < 135) {
        this.openInspection()
        return
      }
      if (Math.abs(this.character.x - this.interior.exitX) < 115) this.exitBuilding()
    }
  }

  enterBuilding() {
    this.mode = 'transition'
    this.velocity = 0
    this.keys.clear()
    this.emitState({ location: 'boundary', prompt: null, transition: 'entering' })

    const targetX = this.building.doorWorldX - 38
    gsap.timeline({ defaults: { ease: 'power2.inOut' } })
      .to(this.character, { x: targetX, duration: 0.72 })
      .to(this.building.doorLight, { alpha: 0.72, duration: 0.35 }, '-=0.25')
      .to(this.building.doorPanel.scale, { x: 0.07, duration: 0.88, ease: 'power3.inOut' })
      .to(this.character, { alpha: 0, x: targetX + 68, duration: 0.52 }, '-=0.38')
      .call(() => {
        this.outdoor.removeChild(this.character)
        this.outdoor.visible = false
        this.interior.visible = true
        this.interior.alpha = 0
        this.interior.addChild(this.character)
        this.character.position.set(430, this.interior.groundY)
        this.character.alpha = 1
        this.character.scale.x = 1
        this.cameraX = 0
        this.interior.x = 0
      })
      .to(this.interior, { alpha: 1, duration: 0.78 })
      .fromTo(this.character, { alpha: 0, x: 365 }, { alpha: 1, x: 430, duration: 0.68 }, '-=0.5')
      .call(() => {
        this.mode = 'inside'
        this.emitState({ location: 'inside', prompt: null, transition: null })
      })
  }

  exitBuilding() {
    this.mode = 'transition'
    this.velocity = 0
    this.keys.clear()
    this.emitState({ location: 'inside', prompt: null, transition: 'exiting' })

    gsap.timeline({ defaults: { ease: 'power2.inOut' } })
      .to(this.character, { x: this.interior.exitX, duration: 0.58 })
      .to(this.character, { alpha: 0, duration: 0.4 })
      .to(this.interior, { alpha: 0, duration: 0.58 }, '-=0.2')
      .call(() => {
        this.interior.removeChild(this.character)
        this.interior.visible = false
        this.outdoor.visible = true
        this.outdoor.addChild(this.character)
        this.character.position.set(this.building.doorWorldX - 98, this.outdoor.groundY)
        this.character.alpha = 0
        this.cameraX = clamp(this.character.x - this.host.clientWidth * 0.36, 0, Math.max(0, this.worldWidth - this.host.clientWidth))
        this.outdoor.x = -this.cameraX
      })
      .to(this.building.doorPanel.scale, { x: 1, duration: 0.72, ease: 'power3.inOut' })
      .to(this.building.doorLight, { alpha: 0.08, duration: 0.3 }, '<')
      .to(this.character, { alpha: 1, x: this.building.doorWorldX - 142, duration: 0.62 }, '-=0.36')
      .call(() => {
        this.mode = 'outside'
        this.emitState({ location: 'boundary', prompt: { key: 'E', label: 'OPEN CONSEQUENCE BUILDING', type: 'door' }, transition: null })
      })
  }

  openInspection() {
    this.inspectionOpen = true
    this.velocity = 0
    this.keys.clear()
    gsap.to(this.interior.consoleScreen, { alpha: 1, duration: 0.35 })
    gsap.to(this.character.parts.body, { rotation: -0.028, duration: 0.35 })
    gsap.to(this.character.parts.head, { rotation: 0.06, duration: 0.35 })
    this.emitState({ location: 'compiler', prompt: null, inspection: true })
  }

  closeInspection() {
    if (!this.inspectionOpen) return
    this.inspectionOpen = false
    gsap.to(this.interior.consoleScreen, { alpha: 0.65, duration: 0.25 })
    gsap.to(this.character.parts.body, { rotation: 0, duration: 0.3 })
    gsap.to(this.character.parts.head, { rotation: 0, duration: 0.3 })
    this.emitState({ location: 'compiler', prompt: { key: 'E', label: 'INSPECT CONSEQUENCE', type: 'console' }, inspection: false })
  }

  emitState(patch = {}) {
    this.callbacks.onState?.({
      mode: this.mode,
      renderer: this.rendererName,
      location: this.mode === 'inside' ? 'inside' : 'outside',
      prompt: null,
      inspection: this.inspectionOpen,
      transition: null,
      ...patch,
    })
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    this.app?.ticker?.remove(this.tick)
    this.app?.destroy(true)
    this.app = null
  }
}
