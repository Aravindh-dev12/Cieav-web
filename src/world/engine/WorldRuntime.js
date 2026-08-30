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
      letterSpacing: size < 14 ? 1.6 : 0,
    },
  })
}

function makeCharacter() {
  const root = new Container()
  root.label = 'traveler'

  const shadow = new Graphics().ellipse(0, 2, 33, 8).fill({ color: 0x172019, alpha: 0.17 })
  root.addChild(shadow)

  const body = new Container()
  body.y = -112
  root.addChild(body)

  const backArm = new Container()
  backArm.position.set(-9, 43)
  backArm.addChild(
    new Graphics().roundRect(-4, 0, 8, 29, 4).fill(0x334a42),
    new Graphics().roundRect(-3.5, 24, 7, 27, 3.5).fill(0xc49b78),
  )
  backArm.pivot.set(0, 2)
  body.addChild(backArm)

  const backLeg = new Container()
  backLeg.position.set(-7, 76)
  backLeg.addChild(
    new Graphics().roundRect(-5, 0, 10, 34, 5).fill(0x303433),
    new Graphics().roundRect(-4.5, 28, 9, 35, 4).fill(0x414643),
    new Graphics().roundRect(-5, 58, 22, 7, 3).fill(0x1c201e),
  )
  backLeg.pivot.set(0, 2)
  body.addChild(backLeg)

  const torso = new Graphics()
    .moveTo(-17, 35)
    .quadraticCurveTo(-19, 55, -14, 77)
    .lineTo(14, 77)
    .quadraticCurveTo(19, 55, 17, 35)
    .quadraticCurveTo(0, 25, -17, 35)
    .fill(0x5d786d)
  body.addChild(torso)
  body.addChild(new Graphics().roundRect(-2, 36, 4, 37, 2).fill({ color: 0xece7dc, alpha: 0.48 }))
  body.addChild(new Graphics().roundRect(-5, 22, 10, 15, 4).fill(0xc49b78))
  body.addChild(new Graphics().ellipse(0, 12, 13, 16).fill(0xcda582))

  const hair = new Graphics()
    .moveTo(-13, 11)
    .quadraticCurveTo(-13, -5, 1, -5)
    .quadraticCurveTo(16, -3, 13, 13)
    .quadraticCurveTo(6, 7, 1, 3)
    .quadraticCurveTo(-4, 9, -13, 11)
    .fill(0x292a27)
  body.addChild(hair)
  body.addChild(new Graphics().ellipse(13, 13, 2.5, 4).fill(0xbc8e6c))
  const eye = new Graphics().circle(6.5, 10, 1.25).fill(0x222522)
  body.addChild(eye)
  body.addChild(new Graphics().moveTo(11, 12).lineTo(14, 14).lineTo(10.5, 15).stroke({ color: 0x9f7458, width: 1 }))

  const frontLeg = new Container()
  frontLeg.position.set(7, 76)
  frontLeg.addChild(
    new Graphics().roundRect(-5, 0, 10, 35, 5).fill(0x3a403d),
    new Graphics().roundRect(-4.5, 29, 9, 35, 4).fill(0x4a4e4b),
    new Graphics().roundRect(-5, 59, 23, 7, 3).fill(0x1d211f),
  )
  frontLeg.pivot.set(0, 2)
  body.addChild(frontLeg)

  const frontArm = new Container()
  frontArm.position.set(10, 43)
  frontArm.addChild(
    new Graphics().roundRect(-4, 0, 8, 29, 4).fill(0x4d675e),
    new Graphics().roundRect(-3.5, 24, 7, 27, 3.5).fill(0xc9a07d),
    new Graphics().circle(0, 52, 4.2).fill(0xc9a07d),
  )
  frontArm.pivot.set(0, 2)
  body.addChild(frontArm)

  root.parts = { body, shadow, frontArm, backArm, frontLeg, backLeg, eye }
  return root
}

function drawOutdoorScene(width, height) {
  const root = new Container()
  const groundY = height - 112
  root.addChild(new Graphics().rect(0, 0, width, height).fill(0xdfe6df))
  root.addChild(new Graphics().circle(width * 0.74, 118, 98).fill({ color: 0xfff4d8, alpha: 0.78 }))

  const far = new Graphics().moveTo(0, groundY - 145)
  for (let x = 0; x <= width; x += 170) {
    far.lineTo(x, groundY - 150 - Math.sin(x * 0.006) * 42 - Math.cos(x * 0.0027) * 28)
  }
  far.lineTo(width, groundY).lineTo(0, groundY).fill({ color: 0xa7b0a6, alpha: 0.58 })
  root.addChild(far)

  const mid = new Graphics().moveTo(0, groundY - 60)
  for (let x = 0; x <= width; x += 120) mid.lineTo(x, groundY - 64 - Math.sin(x * 0.011) * 24)
  mid.lineTo(width, groundY + 15).lineTo(0, groundY + 15).fill({ color: 0x879487, alpha: 0.52 })
  root.addChild(mid)

  const path = new Graphics()
    .moveTo(0, groundY - 7)
    .quadraticCurveTo(600, groundY - 28, 1140, groundY - 7)
    .quadraticCurveTo(1580, groundY + 18, 2130, groundY - 12)
    .quadraticCurveTo(2640, groundY - 32, width, groundY - 10)
    .lineTo(width, height)
    .lineTo(0, height)
    .fill(0xb9aa90)
  root.addChild(path)

  root.addChild(
    new Graphics()
      .moveTo(0, groundY - 7)
      .quadraticCurveTo(600, groundY - 28, 1140, groundY - 7)
      .quadraticCurveTo(1580, groundY + 18, 2130, groundY - 12)
      .quadraticCurveTo(2640, groundY - 32, width, groundY - 10)
      .stroke({ color: 0x6b6559, width: 2, alpha: 0.35 }),
  )

  for (let i = 0; i < 24; i += 1) {
    const x = 130 + i * 128
    root.addChild(
      new Graphics().roundRect(x, groundY - 112 - (i % 3) * 15, 7, 112 + (i % 3) * 15, 4).fill({ color: 0x5e655d, alpha: 0.52 }),
      new Graphics().ellipse(x + 4, groundY - 132 - (i % 3) * 14, 34 + (i % 4) * 4, 30 + (i % 2) * 6).fill({ color: i % 2 ? 0x718273 : 0x809080, alpha: 0.67 }),
    )
  }

  return { root, groundY }
}

function drawBuilding(groundY) {
  const building = new Container()
  building.position.set(1850, groundY - 350)
  building.addChild(new Graphics().roundRect(-28, 340, 600, 38, 18).fill({ color: 0x1f2621, alpha: 0.12 }))
  building.addChild(
    new Graphics().roundRect(0, 0, 540, 352, 18).fill({ color: 0x7a817a, alpha: 0.88 }).stroke({ color: 0x3f4540, width: 1.5, alpha: 0.72 }),
  )
  building.addChild(
    new Graphics().roundRect(24, 24, 492, 176, 12).fill({ color: 0xdce6e2, alpha: 0.42 }).stroke({ color: 0xf7fbf8, width: 1.2, alpha: 0.64 }),
  )
  for (let x = 55; x < 500; x += 82) building.addChild(new Graphics().rect(x, 24, 1.5, 176).fill({ color: 0x53605a, alpha: 0.25 }))

  const sign = makeText('CONSEQUENCE BUILDING', 13, 0xe9efeb, '600')
  sign.position.set(28, 216)
  building.addChild(sign)
  const sub = makeText('TRUSTED SEMANTIC COMPILER / AUTHORITY = 0', 9, 0xd2d9d4, '500')
  sub.position.set(28, 239)
  building.addChild(sub)

  const doorLight = new Graphics().roundRect(378, 246, 112, 106, 8).fill({ color: 0xe8f4e8, alpha: 0.08 })
  building.addChild(doorLight)
  building.addChild(new Graphics().roundRect(386, 250, 96, 102, 6).fill(0x424844).stroke({ color: 0xe4e9e5, width: 1, alpha: 0.3 }))

  const doorPanel = new Graphics().roundRect(392, 256, 82, 96, 4).fill({ color: 0xcddbd5, alpha: 0.78 }).stroke({ color: 0xf8fbfa, width: 1.5, alpha: 0.62 })
  doorPanel.pivot.set(392, 0)
  doorPanel.position.x = 392
  building.addChild(doorPanel)
  building.addChild(new Graphics().circle(462, 306, 3.2).fill(0x2b302d))
  building.addChild(new Graphics().rect(378, 350, 113, 4).fill({ color: 0xefe8d7, alpha: 0.7 }))

  building.doorPanel = doorPanel
  building.doorLight = doorLight
  building.doorWorldX = 1850 + 434
  return building
}

function drawInterior(width, height) {
  const root = new Container()
  const groundY = height - 112
  root.addChild(new Graphics().rect(0, 0, width, height).fill(0x17201d))
  root.addChild(new Graphics().rect(0, 0, width, 190).fill({ color: 0x9eb8aa, alpha: 0.08 }))
  root.addChild(new Graphics().rect(0, groundY, width, height - groundY).fill(0x2a2e2a))
  root.addChild(new Graphics().roundRect(160, 120, 1280, groundY - 120, 20).fill({ color: 0x303a35, alpha: 0.92 }).stroke({ color: 0xe5eee8, width: 1, alpha: 0.13 }))

  for (let x = 205; x < 1360; x += 190) {
    root.addChild(new Graphics().roundRect(x, 168, 150, 168, 12).fill({ color: 0xa5b8ae, alpha: 0.07 }).stroke({ color: 0xdfebe4, width: 1, alpha: 0.12 }))
  }

  const roomTitle = makeText('TRUSTED SEMANTIC COMPILER', 16, 0xe3ebe6, '600')
  roomTitle.position.set(208, 385)
  root.addChild(roomTitle)
  const roomSub = makeText('Proposal in. Trusted consequence semantics out.', 11, 0xaebdb5, '400')
  roomSub.position.set(208, 416)
  root.addChild(roomSub)

  root.addChild(new Graphics().roundRect(1010, groundY - 142, 196, 142, 16).fill({ color: 0x101512, alpha: 0.9 }).stroke({ color: 0xdce8e0, width: 1.2, alpha: 0.24 }))
  const consoleScreen = new Graphics().roundRect(1030, groundY - 125, 156, 82, 10).fill({ color: 0xaed1bf, alpha: 0.15 }).stroke({ color: 0xbce0cd, width: 1, alpha: 0.35 })
  root.addChild(consoleScreen)
  const line1 = makeText('PROPOSAL', 8, 0x9eb8aa, '600')
  line1.position.set(1043, groundY - 112)
  root.addChild(line1)
  const line2 = makeText('Pay supplier', 15, 0xe8f0eb, '500')
  line2.position.set(1043, groundY - 88)
  root.addChild(line2)
  const line3 = makeText('AUTHORITY = 0', 9, 0xd7a977, '600')
  line3.position.set(1043, groundY - 57)
  root.addChild(line3)

  root.addChild(new Graphics().roundRect(196, groundY - 112, 92, 112, 6).fill(0x1e2521).stroke({ color: 0xdfe8e2, width: 1, alpha: 0.2 }))
  root.addChild(new Graphics().roundRect(202, groundY - 106, 80, 106, 4).fill({ color: 0x8aa096, alpha: 0.3 }))
  const exitLabel = makeText('EXIT', 8, 0xcbd7d0, '600')
  exitLabel.position.set(226, groundY - 128)
  root.addChild(exitLabel)

  root.groundY = groundY
  root.consoleX = 1106
  root.exitX = 242
  root.consoleScreen = consoleScreen
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
    this.worldWidth = 3200
    this.inspectionOpen = false
    this.rendererName = 'WebGPU'
    this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
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

  bindBuildingInteraction() {
    const hit = new Graphics().rect(2220, this.outdoor.groundY - 120, 145, 130).fill({ color: 0xffffff, alpha: 0.001 })
    hit.eventMode = 'static'
    hit.cursor = 'pointer'
    hit.on('pointertap', () => {
      if (this.mode === 'outside' && Math.abs(this.character.x - this.building.doorWorldX) < 150) this.interact()
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
    if (!this.character || this.mode === 'transition' || this.inspectionOpen) {
      if (this.character) this.animateCharacter(ticker.deltaMS, false)
      return
    }

    const left = this.keys.has('arrowleft') || this.keys.has('a')
    const right = this.keys.has('arrowright') || this.keys.has('d')
    const running = this.keys.has('shift')
    const input = left === right ? 0 : left ? -1 : 1
    if (input) this.direction = input

    const target = input * (running ? 7.1 : 4.2)
    const acceleration = input ? 0.16 : 0.1
    this.velocity = lerp(this.velocity, target, 1 - Math.pow(1 - acceleration, ticker.deltaMS / 16.67))
    if (!input && Math.abs(this.velocity) < 0.025) this.velocity = 0

    if (this.mode === 'outside') this.moveOutside(ticker.deltaMS)
    if (this.mode === 'inside') this.moveInside(ticker.deltaMS)
    this.animateCharacter(ticker.deltaMS, Math.abs(this.velocity) > 0.12, running)
    this.updatePrompt()
  }

  moveOutside(deltaMS) {
    const step = this.velocity * deltaMS / 16.67
    const doorStop = this.building.doorWorldX - 72
    let nextX = clamp(this.character.x + step, 170, this.worldWidth - 160)
    if (this.building.doorPanel.scale.x > 0.2 && this.character.x < doorStop && nextX > doorStop) nextX = doorStop
    this.character.x = nextX

    const viewport = this.host.clientWidth
    const desired = clamp(this.character.x - viewport * 0.36, 0, Math.max(0, this.worldWidth - viewport))
    this.cameraX = lerp(this.cameraX, desired, 0.075)
    this.outdoor.x = -this.cameraX
  }

  moveInside(deltaMS) {
    this.character.x = clamp(this.character.x + this.velocity * deltaMS / 16.67, 205, 1370)
    const viewport = this.host.clientWidth
    const desired = clamp(this.character.x - viewport * 0.42, 0, Math.max(0, 1600 - viewport))
    this.cameraX = lerp(this.cameraX, desired, 0.085)
    this.interior.x = -this.cameraX
  }

  animateCharacter(deltaMS, moving, running = false) {
    const { body, shadow, frontArm, backArm, frontLeg, backLeg } = this.character.parts
    this.character.scale.x = this.direction < 0 ? -1 : 1

    if (!moving || this.reducedMotion) {
      body.y = lerp(body.y, -112, 0.16)
      body.rotation = lerp(body.rotation, 0, 0.12)
      frontArm.rotation = lerp(frontArm.rotation, 0.05, 0.12)
      backArm.rotation = lerp(backArm.rotation, -0.05, 0.12)
      frontLeg.rotation = lerp(frontLeg.rotation, 0, 0.12)
      backLeg.rotation = lerp(backLeg.rotation, 0, 0.12)
      shadow.scale.x = lerp(shadow.scale.x, 1, 0.1)
      return
    }

    this.walkPhase = (this.walkPhase || 0) + deltaMS * (running ? 0.014 : 0.0095)
    const swing = Math.sin(this.walkPhase)
    const lift = Math.abs(Math.cos(this.walkPhase * 2))
    body.y = -112 - lift * (running ? 4.5 : 2.4)
    body.rotation = swing * 0.018
    frontArm.rotation = swing * 0.52
    backArm.rotation = -swing * 0.48
    frontLeg.rotation = -swing * 0.36
    backLeg.rotation = swing * 0.35
    shadow.scale.x = 1 - lift * 0.16
    shadow.alpha = 0.72 - lift * 0.18
  }

  updatePrompt() {
    let prompt = null
    let location = this.mode

    if (this.mode === 'outside') {
      const distance = Math.abs(this.character.x - this.building.doorWorldX)
      if (distance < 160) prompt = { key: 'E', label: 'OPEN CONSEQUENCE BUILDING', type: 'door' }
      location = distance < 390 ? 'boundary' : 'outside'
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
    if (this.mode === 'outside' && Math.abs(this.character.x - this.building.doorWorldX) < 170) {
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

    const targetX = this.building.doorWorldX - 30
    gsap.timeline({ defaults: { ease: 'power2.inOut' } })
      .to(this.character, { x: targetX, duration: 0.65 })
      .to(this.building.doorLight, { alpha: 0.72, duration: 0.35 }, '-=0.25')
      .to(this.building.doorPanel.scale, { x: 0.08, duration: 0.8, ease: 'power3.inOut' })
      .to(this.character, { alpha: 0, x: targetX + 62, duration: 0.48 }, '-=0.35')
      .call(() => {
        this.outdoor.removeChild(this.character)
        this.outdoor.visible = false
        this.interior.visible = true
        this.interior.alpha = 0
        this.interior.addChild(this.character)
        this.character.position.set(430, this.interior.groundY)
        this.character.alpha = 1
        this.cameraX = 0
        this.interior.x = 0
      })
      .to(this.interior, { alpha: 1, duration: 0.75 })
      .fromTo(this.character, { alpha: 0, x: 365 }, { alpha: 1, x: 430, duration: 0.65 }, '-=0.48')
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
      .to(this.character, { x: this.interior.exitX, duration: 0.55 })
      .to(this.character, { alpha: 0, duration: 0.38 })
      .to(this.interior, { alpha: 0, duration: 0.58 }, '-=0.2')
      .call(() => {
        this.interior.removeChild(this.character)
        this.interior.visible = false
        this.outdoor.visible = true
        this.outdoor.addChild(this.character)
        this.character.position.set(this.building.doorWorldX - 92, this.outdoor.groundY)
        this.character.alpha = 0
        this.cameraX = clamp(this.character.x - this.host.clientWidth * 0.36, 0, Math.max(0, this.worldWidth - this.host.clientWidth))
        this.outdoor.x = -this.cameraX
      })
      .to(this.building.doorPanel.scale, { x: 1, duration: 0.7, ease: 'power3.inOut' })
      .to(this.building.doorLight, { alpha: 0.08, duration: 0.3 }, '<')
      .to(this.character, { alpha: 1, x: this.building.doorWorldX - 135, duration: 0.6 }, '-=0.35')
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
    gsap.to(this.character.parts.body, { rotation: -0.035, duration: 0.35 })
    this.emitState({ location: 'compiler', prompt: null, inspection: true })
  }

  closeInspection() {
    if (!this.inspectionOpen) return
    this.inspectionOpen = false
    gsap.to(this.interior.consoleScreen, { alpha: 0.65, duration: 0.25 })
    gsap.to(this.character.parts.body, { rotation: 0, duration: 0.3 })
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
