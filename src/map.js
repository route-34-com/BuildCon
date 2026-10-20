import { gsap } from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

gsap.registerPlugin(MotionPathPlugin)

const img = id => `https://images.unsplash.com/photo-${id}?w=700&q=70`

const OFFICES = {
  coimbatore: {
    x: 190, y: 283, name: 'Coimbatore', role: 'Head office',
    address: 'No. 34, 2nd Floor, Lakshmi Towers, Avinashi Road, Peelamedu — 641 004',
    phone: '+91 98430 34034', hours: 'Mon–Sat · 9:30 am – 7:00 pm'
  },
  erode: {
    x: 428, y: 150, name: 'Erode', role: 'Branch office',
    address: 'No. 112, Perundurai Road, Thindal — 638 009',
    phone: '+91 98431 34134', hours: 'Mon–Sat · 9:30 am – 6:30 pm'
  }
}

const SITES = [
  { x: 176, y: 256, city: 'coimbatore', name: 'Aaranya Villas', place: 'Saravanampatti', type: 'Residential', size: '14 villas · 46,000 sq.ft', status: 'done', year: 2025, img: img('1600596542815-ffad4c1539a9') },
  { x: 205, y: 290, city: 'coimbatore', name: 'Avinashi One', place: 'Avinashi Road, Peelamedu', type: 'Commercial', size: 'G+11 tower · 2.1 lakh sq.ft', status: 'live', year: 2027, img: img('1565008447742-97f6f38c985c') },
  { x: 168, y: 300, city: 'coimbatore', name: 'Kovai Heights', place: 'Race Course', type: 'Residential', size: '64 apartments · G+8', status: 'done', year: 2024, img: img('1545324418-cc1a3fa10c00') },
  { x: 194, y: 263, city: 'coimbatore', name: 'TidelPark Tech Office', place: 'Vilankurichi', type: 'Interiors', size: 'Office fit-out · 38,000 sq.ft', status: 'done', year: 2025, img: img('1497366216548-37526070297c') },
  { x: 144, y: 286, city: 'coimbatore', name: 'Raman Residence', place: 'Vadavalli', type: 'Residential', size: 'G+1 villa · 3,200 sq.ft', status: 'done', year: 2025, img: img('1512917774080-9991f1c4c750') },
  { x: 154, y: 323, city: 'coimbatore', name: 'Hillview Homes', place: 'Kovaipudur', type: 'Residential', size: '8 row houses · 18,400 sq.ft', status: 'live', year: 2026, img: img('1513694203232-719a280e022f') },
  { x: 160, y: 176, city: 'coimbatore', name: 'Nilgiri Foothill Bungalow', place: 'Mettupalayam', type: 'Residential', size: 'Farm bungalow · 4,800 sq.ft', status: 'done', year: 2023, img: img('1582268611958-ebfd161ef9cf') },
  { x: 410, y: 166, city: 'erode', name: 'Thindal Courtyard House', place: 'Thindal', type: 'Residential', size: 'Private residence · 5,400 sq.ft', status: 'done', year: 2024, img: img('1600607687939-ce8a6c25118c') },
  { x: 398, y: 152, city: 'erode', name: 'Perundurai Road Residence', place: 'Perundurai Road', type: 'Residential', size: 'Duplex villa · 3,900 sq.ft', status: 'live', year: 2026, img: img('1600566753190-17f0baa2a6c3') },
  { x: 378, y: 190, city: 'erode', name: 'Bhavani Textiles Logistics Hub', place: 'SIPCOT Perundurai', type: 'Industrial', size: 'PEB warehouse · 1.6 lakh sq.ft', status: 'done', year: 2023, img: img('1587293852726-70cdb56c2866') },
  { x: 414, y: 108, city: 'erode', name: 'Bhavani Riverside Villa', place: 'Bhavani', type: 'Residential', size: 'Riverside villa · 6,200 sq.ft', status: 'done', year: 2022, img: img('1600585154340-be6161a56a0c') },
  { x: 332, y: 100, city: 'erode', name: 'Gobi Farmhouse', place: 'Gobichettipalayam', type: 'Residential', size: 'Farmhouse · 2,800 sq.ft', status: 'live', year: 2026, img: img('1517581177682-a085bb7ffb15') },
  { x: 392, y: 226, city: 'erode', name: 'Chennimalai Weaving Unit', place: 'Chennimalai', type: 'Industrial', size: 'Factory shed · 42,000 sq.ft', status: 'done', year: 2024, img: img('1504307651254-35680f356dfd') }
]

const NS = 'http://www.w3.org/2000/svg'
const W = 600, H = 440

export function initMap(root, { onOffice, card: cardEl } = {}) {
  const svg = root.querySelector('.map')
  const stage = root.querySelector('.mapx__stage')
  const card = cardEl || root.querySelector('.mapx__card')
  const body = card.querySelector('.mapx__body')
  const tip = root.querySelector('.mapx__tip')
  const link = svg.querySelector('.map__link')
  const sitesG = svg.querySelector('.map__sites')
  const route = svg.querySelector('.map__route')
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  let active = null
  let filter = 'all'

  const nodes = SITES.map((s, i) => {
    const g = document.createElementNS(NS, 'g')
    g.setAttribute('class', `site site--${s.status}`)
    g.setAttribute('transform', `translate(${s.x} ${s.y})`)
    g.setAttribute('tabindex', '0')
    g.setAttribute('role', 'button')
    g.setAttribute('aria-label', `${s.name}, ${s.place}`)
    g.innerHTML = '<circle class="site__hit" r="14" /><circle class="site__ring" r="10" /><circle class="site__dot" r="5.5" />'
    sitesG.appendChild(g)
    g.addEventListener('click', e => { e.stopPropagation(); open(i) })
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i) } })
    g.addEventListener('mouseenter', () => showTip(s))
    g.addEventListener('mouseleave', hideTip)
    g.addEventListener('focus', () => showTip(s))
    g.addEventListener('blur', hideTip)
    return g
  })

  root.querySelector('.chip__n').textContent = SITES.length

  const km = svg.querySelector('.map__km')
  const mid = route.getPointAtLength(route.getTotalLength() * 0.5)
  km.setAttribute('transform', `translate(${mid.x - 10} ${mid.y - 26})`)

  const pct = (x, y) => ({ left: (x / W) * 100 + '%', top: (y / H) * 100 + '%' })

  function showTip(s) {
    if (active !== null && SITES[active] === s) return
    tip.textContent = `${s.name} · ${s.place}`
    Object.assign(tip.style, pct(s.x, s.y))
    tip.classList.add('is-on')
  }
  function hideTip() { tip.classList.remove('is-on') }

  function drawLink(from, to) {
    const mx = (from.x + to.x) / 2, my = Math.min(from.y, to.y) - 30
    link.setAttribute('d', `M${from.x} ${from.y} Q${mx} ${my} ${to.x} ${to.y}`)
    const len = link.getTotalLength()
    gsap.fromTo(link, { strokeDasharray: `${len} ${len}`, strokeDashoffset: len, opacity: 1 }, {
      strokeDashoffset: 0, duration: reduced ? 0 : 0.7, ease: 'power2.out',
      onComplete: () => gsap.set(link, { strokeDasharray: '4 6' })
    })
  }

  function reveal() {
    const wasHidden = card.hidden
    card.hidden = false
    card.parentElement.classList.add('has-card')
    if (wasHidden) gsap.fromTo(card, { autoAlpha: 0, x: 40 }, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power3.out' })
    else gsap.fromTo(body, { autoAlpha: 0, x: 16 }, { autoAlpha: 1, x: 0, duration: 0.35, ease: 'power2.out' })
  }

  function visibleIndexes() {
    return SITES.map((s, i) => i).filter(i => filter === 'all' || SITES[i].status === filter)
  }

  function open(i) {
    hideTip()
    const s = SITES[i]
    active = i
    nodes.forEach((n, k) => n.classList.toggle('is-active', k === i))
    svg.querySelectorAll('.pin').forEach(p => p.classList.remove('is-active'))
    const list = visibleIndexes()
    const pos = list.indexOf(i)
    body.innerHTML = `
      <div class="mc__img"><img src="${s.img}" alt="${s.name}" /><span class="mc__status mc__status--${s.status}">${s.status === 'live' ? 'Under construction' : 'Completed'}</span></div>
      <div class="mc__meta"><span class="mc__tag">${s.type}</span><span>${OFFICES[s.city].name} region</span></div>
      <h3>${s.name}</h3>
      <dl class="mc__facts">
        <div><dt>Location</dt><dd>${s.place}, ${OFFICES[s.city].name}</dd></div>
        <div><dt>Scope</dt><dd>${s.size}</dd></div>
        <div><dt>${s.status === 'live' ? 'Handover' : 'Completed'}</dt><dd>${s.year}</dd></div>
        <div><dt>Managed by</dt><dd>${OFFICES[s.city].name} ${OFFICES[s.city].role.toLowerCase()}</dd></div>
      </dl>
      <a href="#contact" class="btn btn--small btn--block mc__cta">Build something similar</a>
      <div class="mc__nav">
        <button type="button" data-step="-1" aria-label="Previous project">←</button>
        <span>${pos + 1} / ${list.length}</span>
        <button type="button" data-step="1" aria-label="Next project">→</button>
      </div>`
    reveal()
    drawLink(OFFICES[s.city], s)
    if (matchMedia('(max-width: 1000px)').matches) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    gsap.fromTo(nodes[i].querySelector('.site__ring'), { scale: 0.4 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)', transformOrigin: 'center' })
  }

  function openOffice(key) {
    hideTip()
    close()
    svg.querySelectorAll('.pin').forEach(p => p.classList.toggle('is-active', p.dataset.office === key))
    const o = OFFICES[key]
    gsap.fromTo(svg.querySelector(`.pin[data-office="${key}"] .pin__core`), { scale: 1.6 }, { scale: 1, transformOrigin: 'center', duration: 0.7, ease: 'elastic.out(1, 0.4)' })
    onOffice && onOffice(key, o)
  }

  function close() {
    if (card.hidden) return
    active = null
    nodes.forEach(n => n.classList.remove('is-active'))
    svg.querySelectorAll('.pin').forEach(p => p.classList.remove('is-active'))
    gsap.to(link, { opacity: 0, duration: 0.3 })
    gsap.to(card, { autoAlpha: 0, x: 40, duration: 0.3, onComplete: () => { card.hidden = true; card.parentElement.classList.remove('has-card') } })
  }

  body.addEventListener('click', e => {
    const b = e.target.closest('[data-step]')
    if (!b || active === null) return
    const list = visibleIndexes()
    const pos = list.indexOf(active)
    open(list[(pos + +b.dataset.step + list.length) % list.length])
  })
  card.querySelector('.mapx__close').addEventListener('click', close)
  stage.addEventListener('click', e => { if (!e.target.closest('.mapx__card, .site, .pin')) close() })
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close() })

  svg.querySelectorAll('.pin').forEach(p => {
    p.addEventListener('click', e => { e.stopPropagation(); openOffice(p.dataset.office) })
    p.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openOffice(p.dataset.office) } })
  })

  root.querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => {
    filter = c.dataset.status
    root.querySelectorAll('.chip').forEach(x => x.classList.toggle('is-active', x === c))
    SITES.forEach((s, i) => {
      const show = filter === 'all' || s.status === filter
      gsap.to(nodes[i], { autoAlpha: show ? 1 : 0.12, scale: show ? 1 : 0.6, transformOrigin: 'center', duration: 0.4, ease: 'power2.out' })
      nodes[i].style.pointerEvents = show ? '' : 'none'
    })
    if (active !== null && !visibleIndexes().includes(active)) close()
  }))

  function intro() {
    const tl = gsap.timeline()
    const draw = (sel, d, at) => svg.querySelectorAll(sel).forEach(p => {
      const len = p.getTotalLength()
      tl.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: d, ease: 'power2.inOut', clearProps: 'strokeDasharray,strokeDashoffset' }, at)
    })
    draw('.map__land', 1.6, 0)
    tl.from('.map__land', { fillOpacity: 0, duration: 1 }, 0.6)
    tl.from('.map__ghats path', { y: 8, autoAlpha: 0, stagger: 0.04, duration: 0.4 }, 0.5)
    tl.from('.map__area, .map__rtxt, .map__town', { autoAlpha: 0, duration: 0.6, stagger: 0.08 }, 1.0)
    draw('.map__river', 1.4, 0.7)
    tl.from(svg.querySelectorAll('.pin'), { scale: 0, transformOrigin: 'center', stagger: 0.25, duration: 0.8, ease: 'back.out(3)' }, 1.3)
    draw('.map__route-bg', 1.2, 1.7)
    draw('.map__route', 1.2, 1.8)
    tl.from(km, { autoAlpha: 0, y: 10, duration: 0.5 }, 2.6)
    tl.from(nodes, { scale: 0, autoAlpha: 0, transformOrigin: 'center', stagger: 0.05, duration: 0.5, ease: 'back.out(3)' }, 2.2)
    tl.from('.mapx__bar', { y: 16, autoAlpha: 0, duration: 0.6 }, 2.4)
    tl.add(() => svg.classList.add('is-live'), 2.8)
    tl.fromTo('.map__truck', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 2.9)
    return tl
  }

  if (!reduced) {
    gsap.to('.map__truck', {
      motionPath: { path: route, align: route, alignOrigin: [0.5, 0.5] },
      duration: 7, repeat: -1, yoyo: true, ease: 'sine.inOut'
    })
  } else {
    gsap.set('.map__truck', { autoAlpha: 0 })
  }

  return { intro, openOffice }
}
