import * as THREE from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { gsap } from 'gsap'

const P = 0.45
const G1 = P + 3.3
const S1 = G1 + 0.25
const F1 = S1 + 3.1
const R1 = F1 + 0.3

function block(parent, mat, x0, x1, y0, y1, z0, z1) {
  const w = x1 - x0, h = y1 - y0, d = z1 - z0
  const geo = new THREE.BoxGeometry(w, h, d)
  geo.translate(0, h / 2, 0)
  const mesh = new THREE.Mesh(geo, mat)
  mesh.position.set((x0 + x1) / 2, y0, (z0 + z1) / 2)
  mesh.castShadow = true
  mesh.receiveShadow = true
  parent.add(mesh)
  return mesh
}

function makeMaterials() {
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...o })
  return {
    grass: std('#ffffff', { roughness: 1, map: speckleTexture('#5d7a3c', ['#4e6b31', '#6d8a47', '#56743a', '#7a9450'], 80) }),
    lawn: std('#ffffff', { roughness: 1, map: speckleTexture('#628240', ['#4f6e33', '#719049', '#5a7a3b'], 5), transparent: true, opacity: 0 }),
    soil: std('#ffffff', { roughness: 1, map: speckleTexture('#8a6a4b', ['#76593e', '#9b7a58', '#6c5038', '#a5876a'], 5) }),
    paving: std('#c9c1b2'),
    concrete: std('#a9a59d'),
    plinth: std('#7d786f'),
    wall: std('#f1eee8'),
    clad: std('#2c2c2e', { roughness: 0.6 }),
    teak: std('#ffffff', { roughness: 0.5, map: woodTexture('#8a5530', '#4a2a14') }),
    glass: new THREE.MeshPhysicalMaterial({
      color: '#a9c9d8', roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.32,
      depthWrite: false, emissive: '#ffb25c', emissiveIntensity: 0
    }),
    water: std('#2f9cc4', { roughness: 0.1, metalness: 0.2, emissive: '#0d4f6b', emissiveIntensity: 0.25 }),
    crane: std('#f5b301', { roughness: 0.5 }),
    cabin: std('#e8e4dc', { roughness: 0.6 }),
    rebar: std('#5a4636', { roughness: 0.7, metalness: 0.5 }),
    beacon: new THREE.MeshStandardMaterial({ color: '#ff3b30', emissive: '#ff3b30', emissiveIntensity: 1.5 }),
    steel: std('#3a3d42', { roughness: 0.4, metalness: 0.6 }),
    marble: std('#ffffff', { roughness: 0.12, map: marbleTexture() }),
    marbleTop: std('#ffffff', { roughness: 0.1, map: marbleTexture() }),
    oak: std('#ffffff', { roughness: 0.55, map: woodTexture('#b68a5e', '#6f4a2a') }),
    sofa: std('#c9bca9', { roughness: 0.95 }),
    cushion: std('#d8ccb9', { roughness: 1 }),
    pillow: std('#2f4a5a', { roughness: 1 }),
    ceiling: std('#f4f1ec', { roughness: 0.9 }),
    tile: std('#e7e3dc', { roughness: 0.25 }),
    steelBrushed: std('#c3c6ca', { roughness: 0.32, metalness: 0.85 }),
    blackGlass: std('#121314', { roughness: 0.08, metalness: 0.4 }),
    mirror: std('#dfe6ea', { roughness: 0.02, metalness: 1 }),
    planter: std('#d9d2c6', { roughness: 0.8 }),
    globe: new THREE.MeshStandardMaterial({ color: '#fff4e0', emissive: '#ffcf8a', emissiveIntensity: 0, transparent: true, opacity: 0.92 }),
    curtain: new THREE.MeshStandardMaterial({ color: '#f3efe6', roughness: 1, transparent: true, opacity: 0.88, side: THREE.DoubleSide }),
    art: std('#ffffff', { roughness: 0.8, map: artTexture() }),
    rug: std('#ffffff', { roughness: 1, map: rugTexture() }),
    fabric: std('#4b5059', { roughness: 0.95 }),
    cabinet: std('#2f3237', { roughness: 0.5 }),
    quartz: std('#f4f2ee', { roughness: 0.2 }),
    leaf: std('#ffffff', { roughness: 0.85, vertexColors: true }),
    palm: std('#ffffff', { roughness: 0.75, side: THREE.DoubleSide, vertexColors: true }),
    trunk: std('#ffffff', { roughness: 1, map: barkTexture() }),
    bark: std('#5b4a3a', { roughness: 1 }),
    coconut: std('#6d7b2c', { roughness: 0.6 }),
    bulb: new THREE.MeshStandardMaterial({ color: '#fff2d6', emissive: '#ffcf8a', emissiveIntensity: 0 }),
    hill: std('#7b8f86', { roughness: 1, flatShading: true })
  }
}

function buildEnvironment(scene, M) {
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), M.grass)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  const plot = new THREE.Mesh(new THREE.PlaneGeometry(27, 26), M.soil)
  plot.rotation.x = -Math.PI / 2
  plot.position.set(-1, 0.01, 2.5)
  plot.receiveShadow = true
  scene.add(plot)

  const lawn = new THREE.Mesh(new THREE.PlaneGeometry(27, 26), M.lawn)
  lawn.rotation.x = -Math.PI / 2
  lawn.position.set(-1, 0.015, 2.5)
  lawn.receiveShadow = true
  scene.add(lawn)


  const rng = mulberry(7)
  for (let i = 0; i < 9; i++) {
    const hill = new THREE.Mesh(new THREE.ConeGeometry(18 + rng() * 22, 14 + rng() * 18, 6, 1), M.hill)
    hill.position.set(-110 + i * 28 + rng() * 10, 0, -95 - rng() * 30)
    hill.rotation.y = rng() * Math.PI
    scene.add(hill)
  }

  const palms = [[-17, -11], [13, -12], [-18, 9], [-21, -17], [-16, 16], [9, -14], [-5, -13], [24, -4]]
  palms.forEach(([x, z], i) => scene.add(makePalm(M, x, z, 6.5 + (i % 3) * 0.9, i)))
  ;[[-27, -5], [16, -20], [-25, 25], [29, 22], [-8, -24]].forEach(([x, z], i) => {
    scene.add(makeTree(M, x, z, 7 + (i % 2) * 2, mulberry(40 + i)))
  })

  return { plot, lawn }
}

function speckleTexture(base, tones, repeat) {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const ctx = c.getContext('2d')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, 256, 256)
  const rng = mulberry(tones.length * 31)
  for (let i = 0; i < 2600; i++) {
    ctx.globalAlpha = 0.25 + rng() * 0.35
    ctx.fillStyle = tones[Math.floor(rng() * tones.length)]
    const r = 0.6 + rng() * 2.2
    ctx.beginPath()
    ctx.arc(rng() * 256, rng() * 256, r, 0, Math.PI * 2)
    ctx.fill()
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(repeat, repeat)
  tex.anisotropy = 8
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function barkTexture() {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 32
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#7d6b58'
  ctx.fillRect(0, 0, 256, 32)
  for (let x = 0; x < 256; x += 16) {
    ctx.fillStyle = '#4f4134'
    ctx.fillRect(x, 0, 3, 32)
    ctx.fillStyle = '#93816c'
    ctx.fillRect(x + 4, 0, 5, 32)
  }
  for (let i = 0; i < 500; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(40,30,20,0.18)' : 'rgba(170,155,135,0.18)'
    ctx.fillRect(Math.random() * 256, Math.random() * 32, 2, 2)
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function frondGeometry(len, lift, droop, rng, dry) {
  const base = new THREE.Color(dry ? '#7a6238' : '#2f5a22')
  const tip = new THREE.Color(dry ? '#a88d5c' : '#7aa544')
  const pos = [], col = []
  const N = 22
  const rach = []
  for (let i = 0; i <= N; i++) {
    const t = i / N
    rach.push(new THREE.Vector3(t * len, lift * len * t - droop * len * t * t, 0))
  }
  const push = (v, c) => { pos.push(v.x, v.y, v.z); col.push(c.r, c.g, c.b) }
  const tmp = new THREE.Color()
  for (let i = 1; i <= N; i++) {
    const t = i / N
    const a = rach[i], b = rach[i - 1].clone().lerp(a, 0.35)
    const c0 = base.clone().lerp(tip, t * 0.6)
    const w = 0.025 * (1 - t) + 0.008
    push(rach[i - 1].clone().setZ(-w), c0); push(a.clone().setZ(-w * 0.8), c0); push(a.clone().setZ(w * 0.8), c0)
    push(rach[i - 1].clone().setZ(-w), c0); push(a.clone().setZ(w * 0.8), c0); push(rach[i - 1].clone().setZ(w), c0)
    if (t < 0.1) continue
    const L = len * 0.3 * Math.sin(Math.PI * Math.min(t * 1.1, 0.98)) * (0.85 + rng() * 0.3)
    for (const side of [-1, 1]) {
      if (dry && rng() < 0.3) continue
      const dir = new THREE.Vector3(0.45, -0.5 - rng() * 0.35 - (dry ? 0.6 : 0), side).normalize()
      const end = a.clone().addScaledVector(dir, L)
      tmp.copy(tip).lerp(base, 0.15 * rng())
      push(b, c0); push(a, c0); push(end, tmp)
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  geo.computeVertexNormals()
  return geo
}

function makePalm(M, x, z, h, seed) {
  const rng = mulberry(seed * 97 + 13)
  const g = new THREE.Group()
  const ang = seed * 2.3, bend = 0.1 + (seed % 3) * 0.06
  const pts = []
  for (let i = 0; i <= 6; i++) {
    const t = i / 6
    const sway = Math.sin(t * Math.PI) * 0.25
    pts.push(new THREE.Vector3(Math.cos(ang) * (bend * h * t * t + sway * 0.4), h * t, Math.sin(ang) * (bend * h * t * t)))
  }
  const curve = new THREE.CatmullRomCurve3(pts)
  const segs = 40, rad = 10
  const geo = new THREE.TubeGeometry(curve, segs, 1, rad, false)
  const p = geo.attributes.position, v = new THREE.Vector3()
  for (let i = 0; i <= segs; i++) {
    const t = i / segs, c = curve.getPointAt(t)
    const r = 0.2 * (1 - t * 0.4) + Math.max(0, 0.08 - t) * 2.2
    for (let j = 0; j <= rad; j++) {
      const k = i * (rad + 1) + j
      v.fromBufferAttribute(p, k).sub(c).multiplyScalar(r).add(c)
      p.setXYZ(k, v.x, v.y, v.z)
    }
  }
  geo.computeVertexNormals()
  const trunk = new THREE.Mesh(geo, M.trunk)
  trunk.material.map.repeat.set(h * 2.2, 1)
  trunk.castShadow = true
  g.add(trunk)

  const top = curve.getPointAt(1)
  const crown = new THREE.Group()
  crown.position.copy(top)
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.7, 10), M.bark)
  shaft.position.y = -0.1
  crown.add(shaft)
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + rng()
    const nut = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), M.coconut)
    nut.scale.set(1, 1.15, 1)
    nut.position.set(Math.cos(a) * 0.24, -0.35 - rng() * 0.15, Math.sin(a) * 0.24)
    nut.castShadow = true
    crown.add(nut)
  }
  const count = 16
  for (let i = 0; i < count; i++) {
    const ring = i % 3
    const dry = i === 4 || i === 11
    const lift = dry ? -0.6 : [0.95, 0.55, 0.2][ring]
    const droop = dry ? 0.5 : [0.85, 1.0, 1.05][ring]
    const frond = new THREE.Mesh(frondGeometry(3.3 + rng() * 0.8, lift, droop, rng, dry), M.palm)
    frond.rotation.y = (i / count) * Math.PI * 2 + rng() * 0.3
    frond.rotation.x = (rng() - 0.5) * 0.3
    frond.position.y = 0.1 - ring * 0.08
    frond.castShadow = true
    crown.add(frond)
  }
  g.add(crown)
  g.position.set(x, 0, z)
  g.rotation.y = rng() * Math.PI * 2
  g.userData.crown = crown
  return g
}

function hash(x, y, z) {
  const n = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453
  return n - Math.floor(n)
}

function foliage(group, M, rng, n, spread, y0, y1, s0, s1, hue) {
  const v = new THREE.Vector3(), c = new THREE.Color()
  for (let i = 0; i < n; i++) {
    const size = s0 + rng() * (s1 - s0)
    let geo = new THREE.IcosahedronGeometry(size, 2)
    geo.deleteAttribute('normal')
    geo.deleteAttribute('uv')
    geo = mergeVertices(geo)
    const p = geo.attributes.position
    const col = []
    const shade = new THREE.Color().setHSL(hue + (rng() - 0.5) * 0.04, 0.5 + rng() * 0.15, 0.17 + rng() * 0.07)
    for (let k = 0; k < p.count; k++) {
      v.fromBufferAttribute(p, k)
      const j = 1 + (hash(Math.round(v.x * 100), Math.round(v.y * 100), Math.round(v.z * 100)) - 0.5) * 0.28
      v.multiplyScalar(j)
      v.y *= 0.82
      p.setXYZ(k, v.x, v.y, v.z)
      c.copy(shade).multiplyScalar(0.75 + 0.45 * ((v.y / size) * 0.5 + 0.5))
      col.push(c.r, c.g, c.b)
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
    geo.computeVertexNormals()
    const m = new THREE.Mesh(geo, M.leaf)
    const a = rng() * Math.PI * 2, d = Math.sqrt(rng()) * spread
    m.position.set(Math.cos(a) * d, y0 + rng() * (y1 - y0), Math.sin(a) * d)
    m.castShadow = true
    m.receiveShadow = true
    group.add(m)
  }
}

function makeBush(M, x, z, r, rng) {
  const g = new THREE.Group()
  foliage(g, M, rng, 6, r * 0.7, r * 0.45, r * 0.9, r * 0.45, r * 0.7, 0.27)
  g.position.set(x, 0, z)
  return g
}

function makeTree(M, x, z, h, rng) {
  const g = new THREE.Group()
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.32, h * 0.55, 9), M.bark)
  trunk.position.y = h * 0.275
  trunk.castShadow = true
  g.add(trunk)
  for (let i = 0; i < 4; i++) {
    const br = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.13, h * 0.35, 6), M.bark)
    br.geometry.translate(0, h * 0.175, 0)
    br.position.y = h * 0.48
    br.rotation.set(0.55 + rng() * 0.3, (i / 4) * Math.PI * 2 + rng(), 0, 'YXZ')
    br.castShadow = true
    g.add(br)
  }
  foliage(g, M, rng, 11, h * 0.32, h * 0.6, h * 0.85, h * 0.18, h * 0.26, 0.25)
  g.position.set(x, 0, z)
  return g
}

function mulberry(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildHouse(scene, M) {
  const S = {
    footings: [], plinth: null, columns: [], beams: [], slab: null, ffColumns: [],
    walls: [], glass: [], ffWalls: [], ffGlass: [], roof: [], door: null, landscape: [], pool: null
  }
  const house = new THREE.Group()
  scene.add(house)

  const gx = [-6, -2, 2, 6], gz = [-5, 0, 5]
  gx.forEach(x => gz.forEach(z => {
    S.footings.push(block(house, M.concrete, x - 0.6, x + 0.6, 0, 0.3, z - 0.6, z + 0.6))
  }))
  S.plinth = block(house, M.plinth, -6.3, 6.3, 0, P, -5.3, 5.3)

  gx.forEach(x => gz.forEach(z => {
    if (Math.abs(x) === 2 && z === 0) return
    S.columns.push(block(house, M.concrete, x - 0.18, x + 0.18, P, G1, z - 0.18, z + 0.18))
  }))
  gz.forEach(z => S.beams.push(block(house, M.concrete, -6.2, 6.2, G1 - 0.4, G1, z - 0.15, z + 0.15)))
  gx.forEach(x => S.beams.push(block(house, M.concrete, x - 0.15, x + 0.15, G1 - 0.4, G1, -5.2, 5.2)))
  S.slab = [
    block(house, M.concrete, -4.55, 6.4, G1, S1, -5.4, 5.4),
    block(house, M.concrete, -6.4, -4.55, G1, S1, -5.4, 0.7),
    block(house, M.concrete, -6.4, -4.55, G1, S1, 3.1, 5.4),
    block(house, M.concrete, -6.4, -5.75, G1, S1, 0.7, 3.1)
  ]

  const fx = [-7, -2.25, 2.5], fz = [-4, 1, 6]
  fx.forEach(x => fz.forEach(z => {
    S.ffColumns.push(block(house, M.concrete, x - 0.16, x + 0.16, S1, F1, z - 0.16, z + 0.16))
  }))

  const W = (...a) => S.walls.push(block(house, M.wall, ...a))
  const Gl = (...a) => S.glass.push(block(house, M.glass, ...a))

  W(-6, -5, P, G1, 4.75, 5)
  W(-5, -0.8, P, P + 0.3, 4.75, 5)
  W(-5, -0.8, G1 - 0.45, G1, 4.75, 5)
  Gl(-5, -0.8, P + 0.3, G1 - 0.45, 4.84, 4.9)
  W(-0.8, 0.5, P, G1, 4.75, 5)
  W(0.5, 2, P + 2.7, G1, 4.75, 5)
  W(2, 3, P, G1, 4.75, 5)
  W(3, 5.2, P, 1.4, 4.75, 5)
  W(3, 5.2, 3.0, G1, 4.75, 5)
  Gl(3, 5.2, 1.4, 3.0, 4.84, 4.9)
  W(5.2, 6, P, G1, 4.75, 5)

  W(-6, -4, P, G1, -5, -4.75)
  W(-4, 1, G1 - 0.45, G1, -5, -4.75)
  Gl(-4, 1, P, G1 - 0.45, -4.9, -4.84)
  W(1, 6, P, G1, -5, -4.75)

  W(-6, -5.75, P, G1, -4.75, -2)
  W(-6, -5.75, P, 1.2, -2, 1)
  W(-6, -5.75, 3.0, G1, -2, 1)
  Gl(-5.91, -5.85, 1.2, 3.0, -2, 1)
  W(-6, -5.75, P, G1, 1, 4.75)

  W(5.75, 6, P, G1, -4.75, -3)
  W(5.75, 6, P, 1.6, -3, -0.5)
  W(5.75, 6, 3.0, G1, -3, -0.5)
  Gl(5.85, 5.91, 1.6, 3.0, -3, -0.5)
  W(5.75, 6, P, G1, -0.5, 4.75)

  const FW = (...a) => S.ffWalls.push(block(house, M.clad, ...a))
  const FG = (...a) => S.ffGlass.push(block(house, M.glass, ...a))
  FW(-7, -6, S1, F1, 5.75, 6)
  FW(-6, 1.5, S1, S1 + 1, 5.75, 6)
  FW(-6, 1.5, F1 - 0.5, F1, 5.75, 6)
  FG(-6, 1.5, S1 + 1, F1 - 0.5, 5.84, 5.9)
  FW(1.5, 2.5, S1, F1, 5.75, 6)
  FW(-7, -6.75, S1, F1, -4, 5.75)
  FW(2.25, 2.5, S1, F1, -4, 5.75)
  FW(-7, -3, S1, F1, -4, -3.75)
  FW(-3, 1, S1, S1 + 0.9, -4, -3.75)
  FW(-3, 1, F1 - 0.4, F1, -4, -3.75)
  FG(-3, 1, S1 + 0.9, F1 - 0.4, -3.9, -3.84)
  FW(1, 2.5, S1, F1, -4, -3.75)

  S.roof.push(block(house, M.wall, -7.6, 3.2, F1, R1, -4.6, 6.8))
  S.roof.push(block(house, M.clad, -7.6, 3.2, R1, R1 + 0.35, 6.55, 6.8))
  S.roof.push(block(house, M.wall, 2.5, 6.4, S1, S1 + 0.9, 5.2, 5.4))
  S.roof.push(block(house, M.wall, 6.2, 6.4, S1, S1 + 0.9, -5.4, 5.4))

  const pivot = new THREE.Group()
  pivot.position.set(0.5, P, 4.875)
  block(pivot, M.teak, 0, 1.5, 0, 2.7, -0.05, 0.05)
  block(pivot, M.steel, 1.28, 1.34, 0.6, 1.9, 0.05, 0.1)
  house.add(pivot)
  S.door = pivot

  const L = (m, ...a) => S.landscape.push(block(scene, m, ...a))
  L(M.paving, 0.3, 2.2, 0, 0.06, 5.3, 16)
  L(M.paving, 3, 7.5, 0, 0.05, 5.3, 16)
  L(M.paving, -11.6, -6.4, 0, 0.12, -3.6, 6.6)
  S.pool = block(scene, M.water, -11, -7, 0.12, 0.13, -3, 6)
  L(M.wall, -14.5, -14.2, 0, 1.4, -10.5, 15.5)
  L(M.wall, 12.2, 12.5, 0, 1.4, -10.5, 15.5)
  L(M.wall, -14.5, 12.5, 0, 1.4, -10.5, -10.2)
  L(M.wall, -14.5, 0, 0, 1.4, 15.2, 15.5)
  L(M.wall, 8, 12.5, 0, 1.4, 15.2, 15.5)
  ;[[-12.8, -8], [-12.6, 9], [10.5, -8], [10.8, 10], [-4, -8.5], [9, 3]].forEach(([x, z], i) => {
    const bush = makeBush(M, x, z, 1.1 + (i % 3) * 0.4, mulberry(20 + i))
    scene.add(bush)
    S.landscape.push(bush)
  })
  return S
}

function canvasTex(w, h, draw, repeat = 1) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  draw(c.getContext('2d'), w, h)
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(repeat, repeat)
  tex.anisotropy = 8
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function marbleTexture() {
  return canvasTex(512, 512, (ctx, w, h) => {
    const rng = mulberry(5)
    ctx.fillStyle = '#efebe4'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 26; i++) {
      ctx.strokeStyle = `rgba(${120 + rng() * 40},${115 + rng() * 35},${110 + rng() * 30},${0.08 + rng() * 0.22})`
      ctx.lineWidth = 0.6 + rng() * 2.2
      ctx.beginPath()
      let x = rng() * w, y = 0
      ctx.moveTo(x, y)
      while (y < h) {
        x += (rng() - 0.45) * 60
        y += 20 + rng() * 40
        ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
    ctx.strokeStyle = 'rgba(160,150,140,0.35)'
    ctx.lineWidth = 1
    for (let i = 0; i <= w; i += w / 2) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke()
    }
  }, 3)
}

function woodTexture(base, dark, repeat = 1) {
  return canvasTex(256, 256, (ctx, w, h) => {
    const rng = mulberry(base.length * 7)
    ctx.fillStyle = base
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 70; i++) {
      ctx.strokeStyle = dark
      ctx.globalAlpha = 0.08 + rng() * 0.25
      ctx.lineWidth = 0.5 + rng() * 2
      const y = rng() * h
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.bezierCurveTo(w * 0.3, y + (rng() - 0.5) * 14, w * 0.7, y + (rng() - 0.5) * 14, w, y)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }, repeat)
}

function rugTexture() {
  return canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#cbbba3'
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = '#9c8a70'
    ctx.lineWidth = 6
    ctx.strokeRect(14, 14, w - 28, h - 28)
    ctx.lineWidth = 2
    ctx.strokeRect(30, 30, w - 60, h - 60)
    const rng = mulberry(3)
    for (let i = 0; i < 3000; i++) {
      ctx.fillStyle = `rgba(${rng() > 0.5 ? '255,255,255' : '90,70,50'},0.06)`
      ctx.fillRect(rng() * w, rng() * h, 1.5, 1.5)
    }
  })
}

function artTexture() {
  return canvasTex(256, 192, (ctx, w, h) => {
    ctx.fillStyle = '#efe7da'
    ctx.fillRect(0, 0, w, h)
    const blobs = [['#c8643b', 70, 110, 70], ['#24333f', 170, 80, 60], ['#e0b04f', 130, 140, 38], ['#7d8f6a', 40, 50, 30]]
    blobs.forEach(([c, x, y, r]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill() })
    ctx.strokeStyle = '#1d1d1d'
    ctx.lineWidth = 3
    ctx.beginPath(); ctx.moveTo(20, 160); ctx.bezierCurveTo(90, 60, 160, 190, 236, 40); ctx.stroke()
  })
}

function rbox(parent, mat, x0, x1, y0, y1, z0, z1, r = 0.04) {
  const w = x1 - x0, h = y1 - y0, d = z1 - z0
  const geo = new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2))
  geo.translate(0, h / 2, 0)
  const mesh = new THREE.Mesh(geo, mat)
  mesh.position.set((x0 + x1) / 2, y0, (z0 + z1) / 2)
  mesh.castShadow = true
  mesh.receiveShadow = true
  parent.add(mesh)
  return mesh
}

function cyl(parent, mat, rTop, rBot, h, x, y, z, seg = 16) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, seg), mat)
  m.position.set(x, y + h / 2, z)
  m.castShadow = true
  m.receiveShadow = true
  parent.add(m)
  return m
}

function chair(parent, M, x, y, z, rot) {
  const c = new THREE.Group()
  rbox(c, M.sofa, -0.23, 0.23, 0.44, 0.5, -0.23, 0.23, 0.03)
  rbox(c, M.sofa, -0.23, 0.23, 0.5, 0.95, 0.19, 0.24, 0.025)
  ;[[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]].forEach(([lx, lz]) => cyl(c, M.oak, 0.018, 0.015, 0.44, lx, 0, lz, 8))
  c.position.set(x, y, z)
  c.rotation.y = rot
  parent.add(c)
}

function curtain(parent, mat, x0, x1, y0, y1, z) {
  const w = x1 - x0, h = y1 - y0
  const geo = new THREE.PlaneGeometry(w, h, 24, 1)
  const p = geo.attributes.position
  for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 18) * 0.04)
  geo.computeVertexNormals()
  const m = new THREE.Mesh(geo, mat)
  m.position.set((x0 + x1) / 2, y0 + h / 2, z)
  parent.add(m)
}

function buildInterior(scene, M) {
  const g = new THREE.Group()
  scene.add(g)
  const b = (m, ...a) => block(g, m, ...a)
  const r = (m, ...a) => rbox(g, m, ...a)
  const top = P + 0.02

  b(M.marble, -5.75, 5.75, P, top, -4.75, 4.75)
  ;[[-5.75, 5.75, -4.75, -4.72], [-5.75, 5.75, 4.72, 4.75], [-5.75, -5.72, -4.75, 4.75], [5.72, 5.75, -4.75, 4.75]].forEach(([x0, x1, z0, z1]) => b(M.cabinet, x0, x1, top, top + 0.1, z0, z1))

  const cy = G1 - 0.32
  b(M.ceiling, -5.75, 5.75, cy, cy + 0.08, -4.75, -4.1)
  b(M.ceiling, -5.75, 5.75, cy, cy + 0.08, 4.1, 4.75)
  b(M.ceiling, -5.75, -5.1, cy, cy + 0.08, -4.1, 0.7)
  b(M.ceiling, -5.75, -5.1, cy, cy + 0.08, 3.1, 4.1)
  b(M.ceiling, 5.1, 5.75, cy, cy + 0.08, -4.1, 4.1)
  b(M.bulb, -5.1, 5.1, cy + 0.08, cy + 0.1, -4.1, -4.06)
  b(M.bulb, -5.1, 5.1, cy + 0.08, cy + 0.1, 4.06, 4.1)
  b(M.bulb, -5.1, -5.06, cy + 0.08, cy + 0.1, -4.1, 0.7)
  b(M.bulb, -5.1, -5.06, cy + 0.08, cy + 0.1, 3.1, 4.1)
  b(M.bulb, 5.06, 5.1, cy + 0.08, cy + 0.1, -4.1, 4.1)
  for (let x = -4.5; x <= 4.5; x += 1.5) {
    for (const z of [-4.42, 4.42]) {
      const d = cyl(g, M.bulb, 0.06, 0.06, 0.01, x, cy - 0.01, z, 14)
      d.castShadow = false
    }
  }

  for (let z = -4.7; z < -2.05; z += 0.13) b(M.oak, -5.75, -5.68, top + 0.1, cy, z, z + 0.07)
  r(M.cabinet, -5.68, -5.3, top + 0.35, top + 0.72, -4.3, -2.4, 0.03)
  b(M.art, -5.67, -5.62, 1.55, 2.7, -3.95, -2.75)
  b(M.cabinet, -5.66, -5.62, 1.5, 1.55, -4.0, -2.7)

  r(M.rug, -4.6, -0.5, top, top + 0.02, -3.9, -0.8, 0.01)
  r(M.sofa, -4.0, -1.0, top + 0.08, top + 0.42, -4.45, -3.4, 0.08)
  r(M.sofa, -4.0, -1.0, top + 0.08, top + 0.92, -4.65, -4.3, 0.08)
  r(M.sofa, -4.25, -3.95, top + 0.08, top + 0.68, -4.65, -3.35, 0.08)
  r(M.sofa, -1.05, -0.75, top + 0.08, top + 0.68, -4.65, -3.35, 0.08)
  for (let i = 0; i < 3; i++) {
    const x0 = -3.95 + i * 0.98
    r(M.cushion, x0 + 0.02, x0 + 0.94, top + 0.42, top + 0.56, -4.3, -3.42, 0.06)
    r(M.cushion, x0 + 0.04, x0 + 0.92, top + 0.52, top + 1.05, -4.32, -4.12, 0.08)
  }
  ;[-3.6, -1.5].forEach((x, i) => {
    const pil = r(M.pillow, x - 0.22, x + 0.22, top + 0.56, top + 0.98, -4.1, -3.98, 0.06)
    pil.rotation.z = i ? -0.15 : 0.15
  })
  cyl(g, M.marbleTop, 0.6, 0.6, 0.05, -2.5, top + 0.36, -2.25, 40)
  cyl(g, M.cabinet, 0.22, 0.32, 0.36, -2.5, top, -2.25, 24)
  cyl(g, M.oak, 0.28, 0.28, 0.04, -0.4, top + 0.5, -3.9, 24)
  cyl(g, M.cabinet, 0.03, 0.03, 0.5, -0.4, top, -3.9, 8)

  const arm = new THREE.Group()
  rbox(arm, M.cushion, -0.42, 0.42, 0.08, 0.42, -0.4, 0.4, 0.08)
  rbox(arm, M.cushion, -0.42, 0.42, 0.08, 0.86, 0.3, 0.45, 0.07)
  rbox(arm, M.cushion, -0.48, -0.36, 0.08, 0.62, -0.4, 0.45, 0.05)
  rbox(arm, M.cushion, 0.36, 0.48, 0.08, 0.62, -0.4, 0.45, 0.05)
  arm.position.set(0.15, top, -1.9)
  arm.rotation.y = -Math.PI / 2 - 0.5
  g.add(arm)

  const lampPole = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-4.65, top, -4.3), new THREE.Vector3(-4.6, top + 2.6, -4.2), new THREE.Vector3(-3.4, top + 1.95, -3.2)), 20, 0.018, 8), M.steel)
  g.add(lampPole)
  cyl(g, M.cabinet, 0.16, 0.18, 0.04, -4.65, top, -4.3, 20)
  const lampShade = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.steel)
  lampShade.position.set(-3.4, top + 1.9, -3.2)
  g.add(lampShade)
  const lampBulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), M.bulb)
  lampBulb.position.set(-3.4, top + 1.88, -3.2)
  g.add(lampBulb)

  curtain(g, M.curtain, -4.0, -3.2, top + 0.05, cy - 0.05, -4.55)
  curtain(g, M.curtain, 0.2, 1.0, top + 0.05, cy - 0.05, -4.55)
  b(M.steel, -4.1, 1.1, cy - 0.06, cy - 0.03, -4.57, -4.53)

  const planter = (x, z, s) => {
    cyl(g, M.planter, 0.24 * s, 0.18 * s, 0.5 * s, x, top, z, 20)
    const p = makeBush(M, x, z, 0.65 * s, mulberry(Math.round(x * 10 + z)))
    p.position.y = top + 0.35 * s
    g.add(p)
  }
  planter(-0.3, -4.35, 1.1)
  planter(-1.1, 4.35, 1.2)
  planter(5.3, 4.3, 0.9)

  b(M.cabinet, 1.2, 4.3, top, top + 0.88, -4.75, -4.15)
  b(M.quartz, 1.2, 4.3, top + 0.88, top + 0.92, -4.75, -4.1)
  b(M.cabinet, 5.1, 5.75, top, top + 0.88, -4.35, 0)
  b(M.quartz, 5.0, 5.75, top + 0.88, top + 0.92, -4.4, 0.05)
  b(M.tile, 1.2, 5.75, top + 0.92, top + 1.6, -4.75, -4.72)
  b(M.tile, 5.72, 5.75, top + 0.92, 1.6, -4.4, 0.05)
  b(M.oak, 1.2, 4.3, top + 1.6, cy, -4.75, -4.4)
  for (let x = 1.2; x < 4.3; x += 0.62) b(M.cabinet, x + 0.6, x + 0.62, top + 1.6, cy, -4.41, -4.39)
  b(M.steelBrushed, 4.35, 5.08, top, top + 2.05, -4.75, -4.05)
  b(M.cabinet, 4.71, 4.72, top + 0.1, top + 1.95, -4.05, -4.04)
  b(M.cabinet, 4.35, 5.08, top + 2.05, cy, -4.75, -4.05)
  b(M.blackGlass, 2.2, 2.95, top + 0.92, top + 0.93, -4.62, -4.22)
  b(M.steelBrushed, 2.3, 2.85, top + 1.75, cy, -4.75, -4.45)
  b(M.steelBrushed, 2.15, 3.0, top + 1.62, top + 1.75, -4.75, -4.2)
  b(M.blackGlass, 5.3, 5.65, top + 0.86, top + 0.89, -2.4, -1.8)
  cyl(g, M.steelBrushed, 0.015, 0.015, 0.35, 5.62, top + 0.92, -2.1, 8)
  const spout = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.012, 8, 16, Math.PI), M.steelBrushed)
  spout.position.set(5.52, top + 1.27, -2.1)
  g.add(spout)

  r(M.cabinet, 2.6, 4.4, top, top + 0.88, -2.6, -1.45, 0.02)
  b(M.quartz, 2.45, 4.55, top + 0.88, top + 0.94, -2.75, -1.25)
  b(M.quartz, 4.49, 4.55, top, top + 0.88, -2.75, -1.25)
  ;[3.0, 3.5, 4.0].forEach(x => {
    cyl(g, M.oak, 0.19, 0.17, 0.06, x, top + 0.7, -0.95, 20)
    cyl(g, M.steel, 0.02, 0.03, 0.7, x, top, -0.95, 8)
    cyl(g, M.steel, 0.15, 0.15, 0.015, x, top, -0.95, 16)
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.01, 6, 20), M.steel)
    ring.rotation.x = Math.PI / 2
    ring.position.set(x, top + 0.28, -0.95)
    g.add(ring)
  })
  ;[2.9, 3.5, 4.1].forEach(x => {
    b(M.steel, x - 0.005, x + 0.005, G1 - 0.95, cy, -2.005, -1.995)
    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 14), M.globe)
    globe.position.set(x, G1 - 1.05, -2)
    g.add(globe)
  })

  r(M.oak, 2.9, 4.7, top + 0.72, top + 0.77, 1.0, 2.0, 0.02)
  b(M.cabinet, 3.15, 3.2, top, top + 0.72, 1.15, 1.85)
  b(M.cabinet, 4.4, 4.45, top, top + 0.72, 1.15, 1.85)
  chair(g, M, 3.35, top, 0.72, 0)
  chair(g, M, 4.25, top, 0.72, 0)
  chair(g, M, 3.35, top, 2.28, Math.PI)
  chair(g, M, 4.25, top, 2.28, Math.PI)
  b(M.bulb, 3.2, 4.4, G1 - 1.15, G1 - 1.12, 1.47, 1.53)
  b(M.cabinet, 3.15, 4.45, G1 - 1.12, G1 - 1.06, 1.44, 1.56)
  b(M.steel, 3.3, 3.31, G1 - 1.06, cy, 1.495, 1.505)
  b(M.steel, 4.29, 4.3, G1 - 1.06, cy, 1.495, 1.505)
  b(M.art, 5.67, 5.72, 1.4, 2.6, 1.2, 3.0)
  b(M.cabinet, 5.66, 5.72, 1.35, 1.4, 1.15, 3.05)

  r(M.oak, 2.2, 3.6, top, top + 0.8, 4.35, 4.72, 0.02)
  const mirror = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.02, 40), M.mirror)
  mirror.rotation.x = Math.PI / 2
  mirror.position.set(2.9, 1.95, 4.73)
  g.add(mirror)

  const steps = 12, rise = (S1 - top) / steps, going = 0.3, z0 = 4.35
  for (let i = 0; i < steps; i++) {
    const z1 = z0 - i * going
    const y = top + rise * (i + 1)
    r(M.teak, -5.72, -4.6, y - 0.08, y, z1 - going - 0.03, z1, 0.015)
    b(M.bulb, -5.75, -5.73, y - 0.26, y - 0.22, z1 - 0.22, z1 - 0.08)
  }
  const zEnd = z0 - steps * going
  const A = new THREE.Vector3(-5.16, top, z0), B = new THREE.Vector3(-5.16, S1 - 0.08, zEnd)
  const sLen = A.distanceTo(B)
  const stringer = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.26, sLen), M.cabinet)
  stringer.position.copy(A).lerp(B, 0.5).add(new THREE.Vector3(0, -0.2, 0))
  stringer.rotation.x = Math.atan2(B.y - A.y, A.z - B.z)
  stringer.castShadow = true
  g.add(stringer)
  const rail = new THREE.Shape()
  rail.moveTo(z0, top + 0.3)
  rail.lineTo(zEnd, S1)
  rail.lineTo(zEnd, S1 + 0.95)
  rail.lineTo(z0, top + 1.25)
  rail.closePath()
  const railGeo = new THREE.ExtrudeGeometry(rail, { depth: 0.02, bevelEnabled: false })
  railGeo.rotateY(-Math.PI / 2)
  const railMesh = new THREE.Mesh(railGeo, M.glass)
  railMesh.position.x = -4.58
  g.add(railMesh)
  const hand = new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(
    new THREE.Vector3(-4.59, top + 1.27, z0), new THREE.Vector3(-4.59, S1 + 0.97, zEnd)), 1, 0.028, 10), M.teak)
  g.add(hand)
  b(M.cabinet, -5.75, -4.55, cy - 0.02, G1, 0.68, 0.72)
  b(M.cabinet, -4.59, -4.55, cy - 0.02, G1, 0.7, 3.12)

  b(M.teak, -0.8, 0.5, top + 1.1, top + 2.3, 4.6, 4.75)

  g.visible = false
  return g
}

function rod(parent, mat, a, b, r = 0.04, seg = 6) {
  const dir = new THREE.Vector3().subVectors(b, a)
  const len = dir.length()
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg), mat)
  m.position.copy(a).addScaledVector(dir, 0.5)
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize())
  m.castShadow = true
  parent.add(m)
  return m
}

function buildCrane(scene, M) {
  const V = (x, y, z) => new THREE.Vector3(x, y, z)
  const crane = new THREE.Group()
  crane.position.set(-10, 0, -7.5)
  const H = 11, S = 0.45
  block(crane, M.concrete, -1.4, 1.4, 0, 0.7, -1.4, 1.4)
  const legs = [[-S, -S], [S, -S], [S, S], [-S, S]]
  legs.forEach(([x, z]) => block(crane, M.crane, x - 0.06, x + 0.06, 0.7, H, z - 0.06, z + 0.06))
  for (let y = 0.7; y < H - 0.5; y += 1.1) {
    for (let k = 0; k < 4; k++) {
      const [x0, z0] = legs[k], [x1, z1] = legs[(k + 1) % 4]
      rod(crane, M.crane, V(x0, y, z0), V(x1, y + 1.1, z1), 0.03)
      rod(crane, M.crane, V(x0, y, z0), V(x1, y, z1), 0.03)
    }
  }

  const top = new THREE.Group()
  top.position.y = H
  block(top, M.crane, -0.7, 0.7, 0, 0.35, -0.7, 0.7)
  block(top, M.cabin, 0.55, 1.75, 0.35, 1.55, 0.2, 1.3)
  block(top, M.glass, 1.74, 1.78, 0.75, 1.45, 0.3, 1.2)
  block(top, M.steel, 0.5, 1.8, 1.55, 1.62, 0.15, 1.35)

  const jy = 0.5, L = 15
  const chordA = z => [V(0, jy, z), V(L, jy, z)]
  rod(top, M.crane, ...chordA(-0.4), 0.05)
  rod(top, M.crane, ...chordA(0.4), 0.05)
  rod(top, M.crane, V(0, jy + 0.9, 0), V(L - 0.6, jy + 0.35, 0), 0.05)
  for (let x = 0; x < L - 1; x += 1) {
    const yt = jy + 0.9 - (x / (L - 0.6)) * 0.55
    const yt2 = jy + 0.9 - ((x + 1) / (L - 0.6)) * 0.55
    rod(top, M.crane, V(x, jy, -0.4), V(x + 1, yt2, 0), 0.025)
    rod(top, M.crane, V(x, jy, 0.4), V(x + 1, yt2, 0), 0.025)
    rod(top, M.crane, V(x, jy, -0.4), V(x, jy, 0.4), 0.025)
    if (x === 0) rod(top, M.crane, V(0, jy, 0), V(0, yt, 0), 0.03)
  }
  block(top, M.crane, -6, 0, jy - 0.1, jy + 0.25, -0.45, 0.45)
  block(top, M.concrete, -6, -4.3, jy - 1.3, jy - 0.1, -0.55, 0.55)
  block(top, M.steel, -3.4, -2.2, jy + 0.25, jy + 0.95, -0.4, 0.4)
  const apex = V(0, jy + 4.2, 0)
  rod(top, M.crane, V(-0.4, jy, -0.4), apex, 0.05)
  rod(top, M.crane, V(-0.4, jy, 0.4), apex, 0.05)
  rod(top, M.crane, V(0.4, jy, -0.4), apex, 0.05)
  rod(top, M.crane, V(0.4, jy, 0.4), apex, 0.05)
  rod(top, M.steel, apex, V(L * 0.65, jy + 0.6, 0), 0.02)
  rod(top, M.steel, apex, V(-5.6, jy + 0.25, 0), 0.02)
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), M.beacon)
  beacon.position.copy(apex).add(V(0, 0.15, 0))
  top.add(beacon)

  const trolley = new THREE.Group()
  trolley.position.set(9, jy, 0)
  block(trolley, M.steel, -0.35, 0.35, -0.25, 0.05, -0.5, 0.5)
  const drop = H + jy - 3.2
  const cable = block(trolley, M.steel, -0.02, 0.02, -drop, -0.25, -0.02, 0.02)
  cable.castShadow = false
  block(trolley, M.crane, -0.22, 0.22, -drop - 0.45, -drop, -0.18, 0.18)
  const load = new THREE.Group()
  load.position.y = -drop - 0.45
  rod(load, M.steel, V(0, 0, 0), V(-0.9, -0.8, 0), 0.012)
  rod(load, M.steel, V(0, 0, 0), V(0.9, -0.8, 0), 0.012)
  for (let i = 0; i < 6; i++) {
    const z = -0.15 + (i % 3) * 0.15, y = -0.85 - Math.floor(i / 3) * 0.1
    rod(load, M.rebar, V(-1.6, y, z), V(1.6, y, z), 0.035, 6)
  }
  trolley.add(load)
  top.add(trolley)

  crane.add(top)
  scene.add(crane)
  return { crane, jib: top, trolley }
}

function buildBlueprint(scene) {
  const grid = new THREE.GridHelper(26, 52, '#ffffff', '#ffffff')
  grid.position.set(-1, 0.02, 2.5)
  grid.material.transparent = true
  grid.material.opacity = 0.1
  grid.material.depthWrite = false
  scene.add(grid)

  const flat = color => new THREE.MeshBasicMaterial({
    color, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2
  })
  const lime = flat('#f6f3ec'), setout = flat('#f5b301')
  const pegMat = new THREE.MeshStandardMaterial({ color: '#9a6b3f', roughness: 0.9, transparent: true })
  const g = new THREE.Group()
  scene.add(g)
  const line = (x0, z0, x1, z1, w, mat, y = 0.03) => {
    const len = Math.hypot(x1 - x0, z1 - z0)
    const m = new THREE.Mesh(new THREE.PlaneGeometry(len, w), mat)
    m.rotation.x = -Math.PI / 2
    m.rotation.z = Math.atan2(-(z1 - z0), x1 - x0)
    m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2)
    g.add(m)
  }
  const rect = (x0, z0, x1, z1, w, mat) => {
    line(x0 - w / 2, z0, x1 + w / 2, z0, w, mat)
    line(x0 - w / 2, z1, x1 + w / 2, z1, w, mat)
    line(x0, z0, x0, z1, w, mat)
    line(x1, z0, x1, z1, w, mat)
  }
  const peg = (x, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.1), pegMat)
    m.position.set(x, 0.25, z)
    m.castShadow = true
    g.add(m)
  }

  rect(-6.3, -5.3, 6.3, 5.3, 0.14, lime)
  const gx = [-6, -2, 2, 6], gz = [-5, 0, 5]
  gx.forEach(x => { line(x, -7.2, x, 7.2, 0.035, setout, 0.035); peg(x, -7.2); peg(x, 7.2) })
  gz.forEach(z => { line(-8.2, z, 8.2, z, 0.035, setout, 0.035); peg(-8.2, z); peg(8.2, z) })
  gx.forEach(x => gz.forEach(z => rect(x - 0.6, z - 0.6, x + 0.6, z + 0.6, 0.07, lime)))
  return [grid.material, lime, setout, pegMat]
}

export function initHouse(section) {
  const canvas = section.querySelector('.house__canvas')
  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
  } catch {
    section.classList.add('no-webgl')
    return null
  }
  const mobile = matchMedia('(max-width: 760px)').matches
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.25 : 1.5))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05

  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#cdd8de')
  scene.fog = new THREE.Fog(scene.background.clone(), 45, 150)

  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environmentIntensity = 0.3
  pmrem.dispose()

  const camera = new THREE.PerspectiveCamera(40, 1, 0.05, 400)
  const M = makeMaterials()

  const hemi = new THREE.HemisphereLight('#e4edf2', '#6b5a45', 1.4)
  scene.add(hemi)
  const sun = new THREE.DirectionalLight('#fff1dc', 2.6)
  sun.position.set(20, 30, 14)
  sun.castShadow = true
  sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048)
  Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 90 })
  sun.shadow.bias = -0.0005
  sun.shadow.normalBias = 0.02
  scene.add(sun)

  const warm = '#ffcf9a'
  const lamps = [
    new THREE.PointLight(warm, 0, 11, 1.6),
    new THREE.PointLight(warm, 0, 9, 1.6),
    new THREE.PointLight(warm, 0, 9, 1.6),
    new THREE.PointLight(warm, 0, 9, 1.6)
  ]
  lamps[0].position.set(-2.5, G1 - 0.4, -2.2)
  lamps[1].position.set(3.5, G1 - 1.2, -2)
  lamps[2].position.set(2.4, G1 - 0.7, 1.8)
  lamps[3].position.set(-3, F1 - 0.6, 1)
  lamps.forEach(l => scene.add(l))

  const env = buildEnvironment(scene, M)
  const S = buildHouse(scene, M)
  const interior = buildInterior(scene, M)
  const { crane, jib, trolley } = buildCrane(scene, M)
  const blueprint = buildBlueprint(scene)
  const palms = scene.children.filter(o => o.userData.crown)

  const cam = { x: 26, y: 24, z: 30, tx: 0, ty: 1, tz: 0, w: 1 }
  const target = new THREE.Vector3()
  let zoomOut = 1

  function resize() {
    const w = section.clientWidth, h = section.clientHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.fov = camera.aspect < 0.8 ? 58 : 40
    zoomOut = camera.aspect < 0.8 ? 1.45 : camera.aspect < 1.2 ? 1.2 : 1
    camera.updateProjectionMatrix()
  }
  resize()
  addEventListener('resize', resize)

  function render(t) {
    const k = 1 + (zoomOut - 1) * cam.w
    target.set(cam.tx, cam.ty, cam.tz)
    camera.position.set(
      cam.tx + (cam.x - cam.tx) * k,
      cam.ty + (cam.y - cam.ty) * k,
      cam.tz + (cam.z - cam.tz) * k
    )
    camera.lookAt(target)
    palms.forEach((p, i) => { p.userData.crown.rotation.z = Math.sin(t * 0.0012 + i) * 0.04 })
    renderer.render(scene, camera)
  }

  let visible = true
  new IntersectionObserver(([e]) => { visible = e.isIntersecting }).observe(section)
  gsap.ticker.add(() => {
    if (!visible || document.hidden) return
    const r = section.getBoundingClientRect()
    if (r.bottom <= 0 || r.top >= innerHeight) return
    render(performance.now())
  })

  function buildTimeline(tl) {
    const panels = [...section.querySelectorAll('.panel')]
    const panel = (i, a, b) => {
      tl.fromTo(panels[i], { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' }, a)
      if (b != null) tl.to(panels[i], { autoAlpha: 0, y: -50, duration: 0.35, ease: 'power2.in' }, b)
    }
    const scales = arr => arr.map(m => m.scale)
    const grow = (meshes, vars, at) => {
      meshes = [].concat(meshes)
      meshes.forEach(m => (m.visible = false))
      tl.set(meshes, { visible: true }, at)
      tl.from(meshes.map(m => m.scale), vars, at)
    }

    tl.to(panels[0], { autoAlpha: 0, y: -80, duration: 0.5, ease: 'power2.in' }, 0.25)

    tl.to(cam, { x: 18, y: 15, z: 22, duration: 1.2, ease: 'sine.inOut' }, 0)
    tl.to(cam, { x: -19, y: 13, z: 21, tx: 0, ty: 0.5, duration: 1.6, ease: 'sine.inOut' }, 1.2)
    tl.to(cam, { x: -23, y: 11.5, z: -5, ty: 2, duration: 1.4, ease: 'sine.inOut' }, 2.8)
    tl.to(cam, { x: 18, y: 9.5, z: 21, ty: 2.5, duration: 1.6, ease: 'sine.inOut' }, 4.2)
    tl.to(cam, { x: 19, y: 10, z: 22, ty: 3, duration: 1.2, ease: 'sine.inOut' }, 5.8)
    tl.to(cam, { x: 4, y: 3.2, z: 21, tx: 0.5, ty: 3, tz: 0, duration: 1.0, ease: 'sine.inOut' }, 7.0)
    tl.to(cam, { x: 1.25, y: 1.9, z: 10.5, tx: 1.25, ty: 1.8, tz: 0, w: 0, duration: 0.8, ease: 'sine.inOut' }, 8.0)
    tl.to(cam, { z: 6.8, duration: 0.5, ease: 'sine.in' }, 8.8)
    tl.to(cam, { x: 1.2, y: 1.75, z: 3.0, tx: -2.2, ty: 1.2, tz: -3.5, duration: 0.8, ease: 'sine.inOut' }, 9.3)

    tl.to(blueprint, { opacity: 0, duration: 0.5 }, 1.9)
    panel(1, 0.9, 2.4)
    grow(S.footings, { x: 0.001, y: 0.001, z: 0.001, duration: 0.4, stagger: 0.03, ease: 'back.out(2)' }, 1.0)
    grow(S.plinth, { y: 0.001, duration: 0.5 }, 1.7)

    panel(2, 2.6, 4.0)
    grow(S.columns, { y: 0.001, duration: 0.4, stagger: 0.025 }, 2.6)
    grow(S.beams, { x: 0.001, z: 0.001, duration: 0.4, stagger: 0.04 }, 3.0)
    grow(S.slab, { x: 0.001, z: 0.001, duration: 0.5 }, 3.4)
    grow(S.ffColumns, { y: 0.001, duration: 0.4, stagger: 0.03 }, 3.8)

    panel(3, 4.2, 5.6)
    grow(S.walls, { y: 0.001, duration: 0.45, stagger: 0.015 }, 4.2)
    grow(S.glass, { y: 0.001, duration: 0.35, stagger: 0.04 }, 4.8)
    grow(S.door, { y: 0.001, duration: 0.3 }, 5.0)
    grow(S.ffWalls, { y: 0.001, duration: 0.45, stagger: 0.02 }, 5.0)
    grow(S.ffGlass, { y: 0.001, duration: 0.3, stagger: 0.05 }, 5.4)

    panel(4, 5.8, 7.0)
    S.roof.forEach(r => (r.visible = false))
    tl.set(S.roof, { visible: true }, 5.8)
    S.roof.forEach((r, i) => tl.from(r.position, { y: r.position.y + 7, duration: 0.5, ease: 'power3.out' }, 5.8 + i * 0.1))
    tl.set(interior, { visible: true }, 5.9)
    tl.to(env.lawn.material, { opacity: 1, duration: 0.6 }, 6.2)
    grow(S.landscape, { x: 0.001, y: 0.001, z: 0.001, duration: 0.4, stagger: 0.03 }, 6.2)
    grow(S.pool, { x: 0.001, z: 0.001, duration: 0.5 }, 6.3)
    tl.to(crane.position, { y: -22, duration: 0.8, ease: 'power2.in' }, 6.3)
    tl.to(jib.rotation, { y: 2.6, duration: 5.4, ease: 'none' }, 0.8)
    tl.to(trolley.position, { x: 5, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0.8)

    const dusk = new THREE.Color('#2a3350'), fogDusk = new THREE.Color('#3a3f55')
    tl.to(scene.background, { r: dusk.r, g: dusk.g, b: dusk.b, duration: 0.9 }, 7.0)
    tl.to(scene.fog.color, { r: fogDusk.r, g: fogDusk.g, b: fogDusk.b, duration: 0.9 }, 7.0)
    tl.to(sun, { intensity: 0.35, duration: 0.9 }, 7.0)
    tl.to(sun.color, { r: 1, g: 0.62, b: 0.4, duration: 0.9 }, 7.0)
    tl.to(hemi, { intensity: 0.35, duration: 0.9 }, 7.0)
    tl.to(lamps, { intensity: 14, duration: 0.6, stagger: 0.1 }, 7.3)
    tl.to(M.glass, { emissiveIntensity: 0.55, duration: 0.6 }, 7.3)
    tl.to(M.bulb, { emissiveIntensity: 3, duration: 0.6 }, 7.3)
    tl.to(M.globe, { emissiveIntensity: 1.6, duration: 0.6 }, 7.3)
    tl.to(scene, { environmentIntensity: 0.08, duration: 0.9 }, 7.0)
    tl.to(scene, { environmentIntensity: 0.28, duration: 0.6 }, 9.2)
    tl.to(M.glass, { emissiveIntensity: 0.05, opacity: 0.18, duration: 0.5 }, 9.2)
    tl.to(hemi, { intensity: 1.1, duration: 0.6 }, 9.2)
    tl.to(lamps, { intensity: 9, duration: 0.6 }, 9.2)

    panel(5, 7.1, 8.4)
    tl.to(S.door.rotation, { y: 1.75, duration: 0.6, ease: 'power2.inOut' }, 8.6)

    panel(6, 9.5)
    tl.set({}, {}, 10.5)
  }

  return { buildTimeline, render }
}
