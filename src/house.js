import * as THREE from 'three'
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
    grass: std('#6f8a4e', { roughness: 1 }),
    soil: std('#8a6b4e', { roughness: 1 }),
    paving: std('#c9c1b2'),
    concrete: std('#a9a59d'),
    plinth: std('#7d786f'),
    wall: std('#f1eee8'),
    clad: std('#2c2c2e', { roughness: 0.6 }),
    teak: std('#8a5530', { roughness: 0.55 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: '#a9c9d8', roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.32,
      depthWrite: false, emissive: '#ffb25c', emissiveIntensity: 0
    }),
    water: std('#2f9cc4', { roughness: 0.1, metalness: 0.2, emissive: '#0d4f6b', emissiveIntensity: 0.25 }),
    crane: std('#f5b301', { roughness: 0.5 }),
    steel: std('#3a3d42', { roughness: 0.4, metalness: 0.6 }),
    marble: std('#ece7df', { roughness: 0.18 }),
    rug: std('#bfa98a', { roughness: 1 }),
    fabric: std('#4b5059', { roughness: 0.95 }),
    cabinet: std('#2f3237', { roughness: 0.5 }),
    quartz: std('#f4f2ee', { roughness: 0.2 }),
    leaf: std('#4f7a3a', { roughness: 0.9, flatShading: true }),
    palm: std('#5d8a3c', { roughness: 0.9, side: THREE.DoubleSide }),
    trunk: std('#7a6450', { roughness: 1 }),
    bulb: new THREE.MeshStandardMaterial({ color: '#fff2d6', emissive: '#ffcf8a', emissiveIntensity: 0 }),
    hill: std('#7b8f86', { roughness: 1, flatShading: true }),
    neighbour: std('#d8d3ca')
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

  const road = block(scene, M.concrete, -60, 60, 0, 0.02, 16, 22)
  road.castShadow = false

  const rng = mulberry(7)
  for (let i = 0; i < 9; i++) {
    const hill = new THREE.Mesh(new THREE.ConeGeometry(18 + rng() * 22, 14 + rng() * 18, 6, 1), M.hill)
    hill.position.set(-110 + i * 28 + rng() * 10, 0, -95 - rng() * 30)
    hill.rotation.y = rng() * Math.PI
    scene.add(hill)
  }

  const spots = [[-30, -22], [24, -20], [-34, 8], [30, 6], [-22, 34], [26, 34], [6, -30]]
  spots.forEach(([x, z]) => {
    const w = 8 + rng() * 6, h = 4 + rng() * 6, d = 8 + rng() * 5
    block(scene, M.neighbour, x - w / 2, x + w / 2, 0, h, z - d / 2, z + d / 2)
  })

  const palms = [[-17, -11], [13, -12], [-18, 9], [17, 15], [-16, 16], [9, -14], [-5, -13], [24, -4]]
  palms.forEach(([x, z], i) => scene.add(makePalm(M, x, z, 6 + (i % 3), i)))

  return { plot }
}

function makePalm(M, x, z, h, seed) {
  const g = new THREE.Group()
  const lean = (seed % 2 ? 1 : -1) * 0.08
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, h, 7), M.trunk)
  trunk.position.y = h / 2
  trunk.rotation.z = lean
  trunk.castShadow = true
  g.add(trunk)
  const crown = new THREE.Group()
  crown.position.set(-Math.sin(lean) * h, h, 0)
  for (let i = 0; i < 9; i++) {
    const frond = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 3.2), M.palm)
    frond.geometry.translate(0, 1.6, 0)
    frond.rotation.order = 'YXZ'
    frond.rotation.y = (i / 9) * Math.PI * 2 + seed
    frond.rotation.x = 1.0 + (i % 2) * 0.35
    frond.castShadow = true
    crown.add(frond)
  }
  g.add(crown)
  g.position.set(x, 0, z)
  g.userData.crown = crown
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
  S.slab = block(house, M.concrete, -6.4, 6.4, G1, S1, -5.4, 5.4)

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
    const r = 0.9 + (i % 3) * 0.35
    const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), M.leaf)
    bush.position.set(x, r * 0.8, z)
    bush.castShadow = true
    scene.add(bush)
    S.landscape.push(bush)
  })
  return S
}

function buildInterior(scene, M) {
  const g = new THREE.Group()
  scene.add(g)
  const b = (m, ...a) => block(g, m, ...a)
  b(M.marble, -5.75, 5.75, P, P + 0.02, -4.75, 4.75)
  const top = P + 0.02
  b(M.rug, -4.4, -0.4, top, top + 0.02, -3.6, -0.4)
  b(M.fabric, -4.1, -0.9, top, top + 0.45, -4.4, -3.4)
  b(M.fabric, -4.1, -0.9, top, top + 0.95, -4.6, -4.3)
  b(M.fabric, -4.4, -4.1, top, top + 0.65, -4.6, -3.4)
  b(M.fabric, -0.9, -0.6, top, top + 0.65, -4.6, -3.4)
  b(M.rug, -3.9, -3.1, top + 0.45, top + 0.6, -4.25, -3.6)
  b(M.rug, -1.9, -1.1, top + 0.45, top + 0.6, -4.25, -3.6)
  b(M.teak, -3.2, -1.8, top, top + 0.38, -2.4, -1.5)
  b(M.cabinet, -5.75, -5.35, top, top + 0.55, -4.5, -2.4)

  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.55, 12), M.cabinet)
  pot.position.set(-5.1, top + 0.27, 4.2)
  g.add(pot)
  const plant = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6, 0), M.leaf)
  plant.position.set(-5.1, top + 1.05, 4.2)
  g.add(plant)

  b(M.cabinet, 5.1, 5.75, top, top + 0.88, -4.6, 0)
  b(M.quartz, 5.0, 5.75, top + 0.88, top + 0.93, -4.65, 0.05)
  b(M.cabinet, 2.6, 4.4, top, top + 0.88, -2.6, -1.4)
  b(M.quartz, 2.45, 4.55, top + 0.88, top + 0.94, -2.75, -1.25)
  b(M.cabinet, 1.2, 5.75, top, G1 - 0.02, -4.75, -4.35)
  ;[3.0, 3.5, 4.0].forEach(x => {
    const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.12, 0.72, 10), M.teak)
    stool.position.set(x, top + 0.36, -0.95)
    stool.castShadow = true
    g.add(stool)
  })

  const bulbs = []
  ;[2.9, 3.5, 4.1].forEach(x => {
    b(M.steel, x - 0.01, x + 0.01, G1 - 0.9, G1, -2.01, -1.99)
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.18, 0.22, 14, 1, true), M.steel)
    shade.position.set(x, G1 - 1.0, -2)
    g.add(shade)
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), M.bulb)
    bulb.position.set(x, G1 - 1.06, -2)
    g.add(bulb)
    bulbs.push(bulb)
  })
  b(M.bulb, -5.0, 5.0, G1 - 0.03, G1 - 0.01, -4.3, -4.2)
  b(M.bulb, -5.6, -5.5, G1 - 0.03, G1 - 0.01, -4.2, 4.2)

  for (let i = 0; i < 11; i++) {
    const z = 4.3 - i * 0.36
    const y = top + 0.3 * (i + 1)
    b(M.teak, -5.7, -4.6, y - 0.07, y, z - 0.34, z)
  }
  b(M.glass, -4.62, -4.58, top + 0.3, G1, 0.3, 4.4)
  b(M.steel, -4.63, -4.57, G1 - 0.06, G1 - 0.02, 0.3, 4.4)

  b(M.teak, -0.8, 0.5, top + 1.1, top + 2.3, 4.6, 4.75)
  b(M.clad, 5.6, 5.75, top + 1.0, top + 2.6, 1.0, 3.6)

  g.visible = false
  return g
}

function buildCrane(scene, M) {
  const crane = new THREE.Group()
  crane.position.set(-10, 0, -7.5)
  const H = 17
  block(crane, M.concrete, -1.2, 1.2, 0, 0.6, -1.2, 1.2)
  for (let i = 0; i < 4; i++) {
    const x = i % 2 ? 0.4 : -0.4, z = i < 2 ? 0.4 : -0.4
    block(crane, M.crane, x - 0.07, x + 0.07, 0.6, H, z - 0.07, z + 0.07)
  }
  for (let y = 1.5; y < H; y += 1.5) {
    block(crane, M.crane, -0.45, 0.45, y, y + 0.08, 0.36, 0.44)
    block(crane, M.crane, -0.45, 0.45, y, y + 0.08, -0.44, -0.36)
    block(crane, M.crane, 0.36, 0.44, y, y + 0.08, -0.45, 0.45)
    block(crane, M.crane, -0.44, -0.36, y, y + 0.08, -0.45, 0.45)
  }
  const jib = new THREE.Group()
  jib.position.y = H
  block(jib, M.crane, -0.5, 0.5, 0, 1.0, -0.5, 0.5)
  block(jib, M.steel, 0.1, 0.9, 0.1, 0.9, 0.5, 1.1)
  block(jib, M.crane, -0.25, 15, 1.0, 1.5, -0.25, 0.25)
  block(jib, M.crane, -6, -0.25, 1.0, 1.4, -0.25, 0.25)
  block(jib, M.concrete, -6, -4.4, 0.2, 1.0, -0.5, 0.5)
  block(jib, M.crane, -0.15, 0.15, 1.5, 4, -0.15, 0.15)
  const cable = block(jib, M.steel, 10.98, 11.02, -9, 1.0, -0.02, 0.02)
  cable.castShadow = false
  block(jib, M.steel, 10.6, 11.4, -9.6, -9, -0.4, 0.4)
  crane.add(jib)
  scene.add(crane)
  return { crane, jib }
}

function buildBlueprint(scene) {
  const grid = new THREE.GridHelper(26, 26, '#f5b301', '#ffffff')
  grid.position.set(0, 0.03, 0)
  grid.material.transparent = true
  grid.material.opacity = 0.55
  scene.add(grid)
  const pts = [
    [-6, -5], [6, -5], [6, -5], [6, 5], [6, 5], [-6, 5], [-6, 5], [-6, -5],
    [-2, -5], [-2, 5], [2, -5], [2, 5], [-6, 0], [6, 0]
  ]
  const geo = new THREE.BufferGeometry().setFromPoints(pts.map(([x, z]) => new THREE.Vector3(x, 0.05, z)))
  const mat = new THREE.LineBasicMaterial({ color: '#f5b301', transparent: true, opacity: 1 })
  const lines = new THREE.LineSegments(geo, mat)
  scene.add(lines)
  return [grid.material, mat]
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
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 1.75))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05

  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#cdd8de')
  scene.fog = new THREE.Fog(scene.background.clone(), 45, 150)

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
  lamps[2].position.set(1.2, G1 - 0.4, 3)
  lamps[3].position.set(-3, F1 - 0.6, 1)
  lamps.forEach(l => scene.add(l))

  const env = buildEnvironment(scene, M)
  const S = buildHouse(scene, M)
  const interior = buildInterior(scene, M)
  const { crane, jib } = buildCrane(scene, M)
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

  const hsDefs = {
    door: new THREE.Vector3(1.25, 2.2, 5.0),
    floor: new THREE.Vector3(0.2, P + 0.05, -0.2),
    sofa: new THREE.Vector3(-2.5, 1.6, -4.1),
    kitchen: new THREE.Vector3(3.5, 1.45, -2),
    stairs: new THREE.Vector3(-5.1, 2.4, 1.6),
    light: new THREE.Vector3(2.9, G1 - 0.9, -2)
  }
  const hotspots = [...section.querySelectorAll('.hs')].map(el => ({ el, p: hsDefs[el.dataset.hs] }))
  const v = new THREE.Vector3()

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
    const w = section.clientWidth, h = section.clientHeight
    hotspots.forEach(({ el, p }) => {
      v.copy(p).project(camera)
      const behind = v.z > 1
      el.style.transform = `translate(${(v.x * 0.5 + 0.5) * w}px, ${(-v.y * 0.5 + 0.5) * h}px)`
      el.classList.toggle('is-behind', behind)
    })
  }

  let visible = true
  new IntersectionObserver(([e]) => { visible = e.isIntersecting }).observe(section)
  gsap.ticker.add(() => { if (visible) render(performance.now()) })

  function buildTimeline(tl) {
    const panels = [...section.querySelectorAll('.panel')]
    const panel = (i, a, b) => {
      tl.fromTo(panels[i], { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' }, a)
      if (b != null) tl.to(panels[i], { autoAlpha: 0, y: -50, duration: 0.35, ease: 'power2.in' }, b)
    }
    const scales = arr => arr.map(m => m.scale)
    const hs = name => hotspots.find(h => h.el.dataset.hs === name).el
    const hsShow = (names, a, b) => names.forEach((n, i) => {
      tl.fromTo(hs(n), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, a + i * 0.08)
      if (b != null) tl.to(hs(n), { autoAlpha: 0, duration: 0.2 }, b)
    })

    tl.to(panels[0], { autoAlpha: 0, y: -80, duration: 0.5, ease: 'power2.in' }, 0.25)
    tl.to(section.querySelector('.hero__scroll'), { autoAlpha: 0, duration: 0.3 }, 0.1)

    tl.to(cam, { x: 18, y: 15, z: 22, duration: 1.2, ease: 'sine.inOut' }, 0)
    tl.to(cam, { x: -16, y: 11, z: 18, tx: 0, ty: 0.5, duration: 1.6, ease: 'sine.inOut' }, 1.2)
    tl.to(cam, { x: -19, y: 9, z: -4, ty: 2, duration: 1.4, ease: 'sine.inOut' }, 2.8)
    tl.to(cam, { x: 15, y: 8, z: 18, ty: 2.5, duration: 1.6, ease: 'sine.inOut' }, 4.2)
    tl.to(cam, { x: 19, y: 10, z: 22, ty: 3, duration: 1.2, ease: 'sine.inOut' }, 5.8)
    tl.to(cam, { x: 4, y: 3.2, z: 21, tx: 0.5, ty: 3, tz: 0, duration: 1.0, ease: 'sine.inOut' }, 7.0)
    tl.to(cam, { x: 1.25, y: 1.9, z: 10.5, tx: 1.25, ty: 1.8, tz: 0, w: 0, duration: 0.8, ease: 'sine.inOut' }, 8.0)
    tl.to(cam, { z: 6.8, duration: 0.5, ease: 'sine.in' }, 8.8)
    tl.to(cam, { x: 1.2, y: 1.75, z: 3.0, tx: -2.2, ty: 1.2, tz: -3.5, duration: 0.8, ease: 'sine.inOut' }, 9.3)
    tl.to(cam, { x: 0.4, y: 1.8, z: 2.4, tx: 4.2, ty: 1.2, tz: -2.6, duration: 0.8, ease: 'sine.inOut' }, 10.1)
    tl.to(cam, { x: 1.2, y: 1.9, z: 0.6, tx: -5.2, ty: 2.0, tz: 2.4, duration: 0.8, ease: 'sine.inOut' }, 10.9)

    tl.to(blueprint, { opacity: 0, duration: 0.5 }, 1.9)
    panel(1, 0.9, 2.4)
    tl.from(scales(S.footings), { x: 0.001, y: 0.001, z: 0.001, duration: 0.4, stagger: 0.03, ease: 'back.out(2)' }, 1.0)
    tl.from(S.plinth.scale, { y: 0.001, duration: 0.5 }, 1.7)

    panel(2, 2.6, 4.0)
    tl.from(scales(S.columns), { y: 0.001, duration: 0.4, stagger: 0.025 }, 2.6)
    tl.from(scales(S.beams), { x: 0.001, z: 0.001, duration: 0.4, stagger: 0.04 }, 3.0)
    tl.from(S.slab.scale, { x: 0.001, z: 0.001, duration: 0.5 }, 3.4)
    tl.from(scales(S.ffColumns), { y: 0.001, duration: 0.4, stagger: 0.03 }, 3.8)

    panel(3, 4.2, 5.6)
    tl.from(scales(S.walls), { y: 0.001, duration: 0.45, stagger: 0.015 }, 4.2)
    tl.from(scales(S.glass), { y: 0.001, duration: 0.35, stagger: 0.04 }, 4.8)
    tl.from(S.door.scale, { y: 0.001, duration: 0.3 }, 5.0)
    tl.from(scales(S.ffWalls), { y: 0.001, duration: 0.45, stagger: 0.02 }, 5.0)
    tl.from(scales(S.ffGlass), { y: 0.001, duration: 0.3, stagger: 0.05 }, 5.4)

    panel(4, 5.8, 7.0)
    S.roof.forEach(r => (r.visible = false))
    tl.set(S.roof, { visible: true }, 5.8)
    S.roof.forEach((r, i) => tl.from(r.position, { y: r.position.y + 7, duration: 0.5, ease: 'power3.out' }, 5.8 + i * 0.1))
    tl.set(interior, { visible: true }, 5.9)
    tl.to(env.plot.material.color, { r: M.grass.color.r, g: M.grass.color.g, b: M.grass.color.b, duration: 0.6 }, 6.2)
    tl.from(scales(S.landscape), { x: 0.001, y: 0.001, z: 0.001, duration: 0.4, stagger: 0.03 }, 6.2)
    tl.from(S.pool.scale, { x: 0.001, z: 0.001, duration: 0.5 }, 6.3)
    tl.to(crane.position, { y: -22, duration: 0.8, ease: 'power2.in' }, 6.3)
    tl.to(jib.rotation, { y: 2.6, duration: 5.4, ease: 'none' }, 0.8)

    const dusk = new THREE.Color('#2a3350'), fogDusk = new THREE.Color('#3a3f55')
    tl.to(scene.background, { r: dusk.r, g: dusk.g, b: dusk.b, duration: 0.9 }, 7.0)
    tl.to(scene.fog.color, { r: fogDusk.r, g: fogDusk.g, b: fogDusk.b, duration: 0.9 }, 7.0)
    tl.to(sun, { intensity: 0.35, duration: 0.9 }, 7.0)
    tl.to(sun.color, { r: 1, g: 0.62, b: 0.4, duration: 0.9 }, 7.0)
    tl.to(hemi, { intensity: 0.35, duration: 0.9 }, 7.0)
    tl.to(lamps, { intensity: 14, duration: 0.6, stagger: 0.1 }, 7.3)
    tl.to(M.glass, { emissiveIntensity: 0.55, duration: 0.6 }, 7.3)
    tl.to(M.bulb, { emissiveIntensity: 3, duration: 0.6 }, 7.3)
    tl.to(M.glass, { emissiveIntensity: 0.05, opacity: 0.18, duration: 0.5 }, 9.2)
    tl.to(hemi, { intensity: 1.1, duration: 0.6 }, 9.2)
    tl.to(lamps, { intensity: 9, duration: 0.6 }, 9.2)

    panel(5, 7.1, 8.4)
    hsShow(['door'], 8.2, 8.9)
    tl.to(S.door.rotation, { y: 1.75, duration: 0.6, ease: 'power2.inOut' }, 8.6)

    panel(6, 9.5, 10.5)
    hsShow(['floor', 'sofa'], 9.6, 10.3)
    hsShow(['kitchen', 'light'], 10.4, 11.0)
    hsShow(['stairs'], 11.2)
    tl.set({}, {}, 11.9)
  }

  return { buildTimeline, render }
}
