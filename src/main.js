import './style.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { initHouse } from './house.js'
import { initMap } from './map.js'

gsap.registerPlugin(ScrollTrigger)

if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
scrollTo(0, 0)

const $ = (s, el = document) => el.querySelector(s)
const $$ = (s, el = document) => [...el.querySelectorAll(s)]
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
const fine = matchMedia('(pointer: fine)').matches

const lenis = new Lenis({ duration: 1.15, smoothWheel: !reduced })
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add(t => lenis.raf(t * 1000))
gsap.ticker.lagSmoothing(0)
lenis.stop()

const easeInOutCubic = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]')
  if (!a) return
  const id = a.getAttribute('href')
  const el = id === '#top' || id === '#' ? 0 : $(id)
  if (el === null) return
  e.preventDefault()
  closeMenu()
  const target = el === 0 ? 0 : el.getBoundingClientRect().top + scrollY - 70
  const distance = Math.abs(target - scrollY)
  const duration = reduced ? 0 : Math.min(3.2, Math.max(1.2, distance / 2600))
  lenis.scrollTo(target, { duration, easing: easeInOutCubic, force: true })
})

const houseSection = $('.house')
const house = initHouse(houseSection)

function intro() {
  const tl = gsap.timeline()
  tl.to('.loader__plan path', { strokeDashoffset: 0, duration: 1.6, stagger: 0.2, ease: 'power2.inOut' }, 0)
  const counter = { v: 0 }
  tl.to(counter, {
    v: 100, duration: 1.9, ease: 'power2.inOut',
    onUpdate: () => { $('.loader__count span').textContent = Math.round(counter.v) }
  }, 0)
  tl.to('.loader', { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'expo.inOut' }, '+=0.15')
  tl.set('.loader', { display: 'none' })
  tl.from('.hero__title .word', { yPercent: 115, rotate: 4, duration: 1.1, stagger: 0.09, ease: 'expo.out' }, '-=0.35')
  tl.from('.panel--hero .eyebrow, .panel--hero .hero__lede', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1 }, '-=0.8')
  tl.from('.nav', { y: -30, autoAlpha: 0, duration: 0.8 }, '-=0.9')
  tl.add(() => lenis.start())
}

function setupHouse() {
  if (!house) return
  const tl = gsap.timeline({
    defaults: { ease: 'power2.inOut' },
    scrollTrigger: {
      trigger: houseSection,
      start: 'top top',
      end: () => '+=' + innerHeight * (innerWidth < 760 ? 7 : 8.8),
      pin: true,
      scrub: 1,
      anticipatePin: 1
    }
  })
  house.buildTimeline(tl)
}

function splitHeadings() {
  $$('.split').forEach(h => {
    const words = h.textContent.trim().split(/\s+/)
    h.innerHTML = words.map(w => `<span class="w"><span>${w}</span></span>`).join(' ')
    gsap.from(h.querySelectorAll('.w > span'), {
      yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.05,
      scrollTrigger: { trigger: h, start: 'top 85%' }
    })
  })
  $$('.fade-up').forEach(el => gsap.from(el, {
    y: 40, autoAlpha: 0, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 88%' }
  }))
  $$('.eyebrow').forEach(el => {
    if (el.closest('.house')) return
    gsap.from(el, { x: -20, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: el, start: 'top 90%' } })
  })
}

function counters() {
  $$('[data-count]').forEach(el => {
    const end = parseFloat(el.dataset.count), dec = +(el.dataset.decimals || 0)
    const o = { v: 0 }
    gsap.to(o, {
      v: end, duration: 2.2, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
      onUpdate: () => { el.textContent = o.v.toFixed(dec) }
    })
  })
  gsap.from('.stat', { y: 60, autoAlpha: 0, stagger: 0.1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.stats', start: 'top 85%' } })
}

function revealImages() {
  $$('.reveal-img').forEach(w => {
    const img = $('img', w)
    gsap.timeline({ scrollTrigger: { trigger: w, start: 'top 82%' } })
      .fromTo(w, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.3, ease: 'expo.inOut' })
      .from(img, { scale: 1.35, duration: 1.6, ease: 'expo.out' }, 0.2)
    gsap.to(img, { yPercent: -8, ease: 'none', scrollTrigger: { trigger: w, scrub: true } })
  })
  gsap.from('.checks li', { x: 30, autoAlpha: 0, stagger: 0.08, duration: 0.7, scrollTrigger: { trigger: '.checks', start: 'top 85%' } })
}

function services() {
  const track = $('.services__track')
  const mm = gsap.matchMedia()
  mm.add('(min-width: 900px)', () => {
    const dist = () => track.scrollWidth - innerWidth + 80
    gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: '.services', start: 'top top', end: () => '+=' + dist(), pin: '.services__pin', scrub: 1, invalidateOnRefresh: true }
    })
  })
  gsap.from('.svc', { y: 80, autoAlpha: 0, stagger: 0.08, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.services', start: 'top 70%' } })
}

function process() {
  gsap.fromTo('.process__line i', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.process__list', start: 'top 70%', end: 'bottom 60%', scrub: true } })
  $$('.step').forEach(s => {
    ScrollTrigger.create({ trigger: s, start: 'top 65%', onEnter: () => s.classList.add('is-on'), onLeaveBack: () => s.classList.remove('is-on') })
    gsap.timeline({ scrollTrigger: { trigger: s, start: 'top 92%', end: 'top 62%', scrub: 0.6 } })
      .from(s, { x: 60, autoAlpha: 0, ease: 'power2.out' })
      .from(s.querySelector('b'), { scale: 0.6, transformOrigin: 'left center', ease: 'back.out(2)' }, 0)
  })
}

function projects() {
  const cards = $$('.card')
  gsap.from(cards, { y: 80, autoAlpha: 0, duration: 1, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.grid', start: 'top 80%' } })
  $$('.filters button').forEach(b => b.addEventListener('click', () => {
    $$('.filters button').forEach(x => x.classList.toggle('is-active', x === b))
    const f = b.dataset.filter
    const show = cards.filter(c => f === 'all' || c.dataset.city === f)
    const hide = cards.filter(c => !show.includes(c))
    gsap.to(hide, { scale: 0.9, autoAlpha: 0, duration: 0.3, onComplete: () => hide.forEach(c => (c.style.display = 'none')) })
    show.forEach(c => (c.style.display = ''))
    gsap.fromTo(show, { scale: 0.92, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.5, stagger: 0.05, delay: 0.3, ease: 'power3.out', onComplete: () => ScrollTrigger.refresh() })
  }))
  if (!fine) return
  cards.forEach(c => {
    const img = $('img', c)
    c.addEventListener('mousemove', e => {
      const r = c.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5
      gsap.to(c, { rotateY: x * 8, rotateX: -y * 8, duration: 0.5, ease: 'power2.out' })
      gsap.to(img, { x: x * -16, y: y * -16, scale: 1.08, duration: 0.6 })
    })
    c.addEventListener('mouseleave', () => {
      gsap.to(c, { rotateY: 0, rotateX: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' })
      gsap.to(img, { x: 0, y: 0, scale: 1, duration: 0.7 })
    })
  })
}

function estimator() {
  const form = $('.calc')
  const range = $('.calc__range', form)
  const out = { v: 0 }
  const val = name => +$(`.seg[data-name="${name}"] .is-active`, form).dataset.value
  const fmt = n => n.toLocaleString('en-IN')
  function update() {
    const area = +range.value
    const total = area * val('pkg') * val('city')
    $('.calc__area', form).textContent = `${fmt(area)} sq.ft`
    range.style.setProperty('--p', ((area - range.min) / (range.max - range.min)) * 100 + '%')
    const months = Math.round(6 + area / 1000 * 1.6)
    $('.calc__time', form).textContent = `Approx. ${months} months to handover`
    gsap.to(out, {
      v: total, duration: 0.6, ease: 'power2.out', overwrite: true,
      onUpdate: () => {
        const v = out.v
        $('.calc__total', form).textContent = v >= 1e7 ? `₹${(v / 1e7).toFixed(2)} Cr` : `₹${(v / 1e5).toFixed(1)} L`
      }
    })
  }
  $$('.seg', form).forEach(seg => seg.addEventListener('click', e => {
    const b = e.target.closest('button')
    if (!b) return
    $$('button', seg).forEach(x => x.classList.toggle('is-active', x === b))
    update()
  }))
  range.addEventListener('input', update)
  update()
  gsap.from('.calc', { y: 60, autoAlpha: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.calc', start: 'top 85%' } })
}

function map() {
  const offices = $$('.office')
  const m = initMap($('.mapx'), {
    card: $('.offices .mapx__card'),
    onOffice: key => offices.forEach(o => {
      const on = o.dataset.office === key
      o.classList.toggle('is-active', on)
      if (on) gsap.fromTo(o, { scale: 0.97 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.5)' })
    })
  })
  const tl = m.intro().pause()
  ScrollTrigger.create({ trigger: '.mapx', start: 'top 75%', once: true, onEnter: () => tl.play() })
  offices.forEach(o => o.addEventListener('click', e => {
    if (e.target.closest('a')) return
    m.openOffice(o.dataset.office)
  }))
  gsap.from('.office', { y: 60, autoAlpha: 0, stagger: 0.15, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.offices', start: 'top 85%' } })
}

function voices() {
  const items = $$('.voice')
  let i = 0, timer
  const go = d => {
    const prev = items[i]
    i = (i + d + items.length) % items.length
    const next = items[i]
    gsap.to(prev, { autoAlpha: 0, x: -40 * d, duration: 0.5, onComplete: () => prev.classList.remove('is-active') })
    next.classList.add('is-active')
    gsap.fromTo(next, { autoAlpha: 0, x: 40 * d }, { autoAlpha: 1, x: 0, duration: 0.7, delay: 0.25, ease: 'power3.out' })
    $('.voices__count b').textContent = String(i + 1).padStart(2, '0')
    restart()
  }
  const restart = () => { clearInterval(timer); timer = setInterval(() => go(1), 7000) }
  gsap.set(items.slice(1), { autoAlpha: 0 })
  $$('.voices__btn').forEach(b => b.addEventListener('click', () => go(+b.dataset.dir)))
  restart()
}

function contact() {
  gsap.fromTo('.contact__bg img', { yPercent: -12 }, { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.contact', scrub: true } })
  gsap.from('.form .field, .form .btn', { y: 30, autoAlpha: 0, stagger: 0.07, duration: 0.8, scrollTrigger: { trigger: '.form', start: 'top 85%' } })
  const form = $('.form'), note = $('.form__note')
  form.addEventListener('submit', e => {
    e.preventDefault()
    const bad = $$('[required]', form).filter(f => !f.checkValidity())
    $$('.field', form).forEach(f => f.classList.remove('is-bad'))
    if (bad.length) {
      bad.forEach(f => f.parentElement.classList.add('is-bad'))
      gsap.fromTo(bad.map(f => f.parentElement), { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' })
      note.textContent = 'Please fill in the highlighted fields.'
      return
    }
    const city = form.city.value
    note.textContent = `Thank you, ${form.name.value.split(' ')[0]}! Our ${city === 'Erode' ? 'Erode' : 'Coimbatore'} team will call you within one working day.`
    form.reset()
  })
}

function why() {
  gsap.from('.perk', { y: 60, autoAlpha: 0, duration: 0.9, stagger: 0.07, ease: 'power3.out', scrollTrigger: { trigger: '.why__grid', start: 'top 82%' } })
  gsap.from('.versus__head > *', { y: 30, autoAlpha: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.versus', start: 'top 75%' } })
  const vs = gsap.timeline({ scrollTrigger: { trigger: '.vs', start: 'top 80%' } })
  vs.from('.vs', { y: 50, autoAlpha: 0, duration: 0.8, ease: 'power3.out' })
    .from('.vs__row:not(.vs__row--head) .yes', { x: -24, autoAlpha: 0, stagger: 0.07, duration: 0.5 }, 0.3)
    .from('.vs__row:not(.vs__row--head) .no', { x: 24, autoAlpha: 0, stagger: 0.07, duration: 0.5 }, 0.3)
    .from('.vs__cta', { y: 20, autoAlpha: 0, duration: 0.6 }, 0.8)
}

function packages() {
  gsap.from('.pkg', { y: 90, autoAlpha: 0, duration: 1, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: '.pkgs', start: 'top 82%' } })
}

function track() {
  const ring = $('.ring__fill'), txt = $('.ring__txt')
  const pct = { v: 0 }
  const tl = gsap.timeline({ scrollTrigger: { trigger: '.devices', start: 'top 80%' } })
  tl.from('.laptop', { y: 80, autoAlpha: 0, duration: 1.1, ease: 'expo.out' })
    .from('.devices .phone', { x: 60, y: 60, rotate: 8, autoAlpha: 0, duration: 1.1, ease: 'expo.out' }, 0.25)
    .from('.ms em i', { width: 0, stagger: 0.12, duration: 0.8, ease: 'power2.out' }, 0.5)
    .from('.dash__photos i', { scale: 0.6, autoAlpha: 0, stagger: 0.08, duration: 0.5, ease: 'back.out(2)' }, 0.6)
    .from('.dash__kpis div', { y: 14, autoAlpha: 0, stagger: 0.08, duration: 0.5 }, 0.9)
    .to(pct, {
      v: 64, duration: 1.6, ease: 'power2.out',
      onUpdate: () => {
        ring.style.strokeDashoffset = 201 - (201 * pct.v) / 100
        txt.textContent = Math.round(pct.v) + '%'
      }
    }, 0.7)
    .from('.app__pay', { y: 20, autoAlpha: 0, duration: 0.6 }, 1.2)
  gsap.from('.track__text > *', { y: 30, autoAlpha: 0, stagger: 0.08, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.track__text', start: 'top 82%' } })
  gsap.from('.tile', { y: 30, autoAlpha: 0, stagger: 0.07, duration: 0.6, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.tiles', start: 'top 90%' } })
}

function faq() {
  $$('.qa').forEach(d => {
    d.addEventListener('toggle', () => {
      if (d.open) gsap.from($('p', d), { y: -10, autoAlpha: 0, duration: 0.5, ease: 'power2.out' })
      ScrollTrigger.refresh()
    })
  })
  gsap.from('.qa', { y: 30, autoAlpha: 0, stagger: 0.06, duration: 0.7, scrollTrigger: { trigger: '.faq__list', start: 'top 85%' } })
}

function fab() {
  ScrollTrigger.create({
    trigger: '.stats', start: 'top bottom',
    onEnter: () => $('.fab').classList.add('is-on'),
    onLeaveBack: () => $('.fab').classList.remove('is-on')
  })
}

function footer() {
  gsap.from('.footer__big', { yPercent: 60, autoAlpha: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.footer', start: 'top 85%' } })
}

function chrome() {
  const nav = $('.nav')
  lenis.on('scroll', ({ scroll }) => nav.classList.toggle('is-scrolled', scroll > 40))

  const toggle = $('.theme-toggle')
  const syncToggle = () => toggle.setAttribute('aria-label', document.documentElement.dataset.theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode')
  syncToggle()
  toggle.addEventListener('click', () => {
    const root = document.documentElement
    const next = root.dataset.theme === 'light' ? 'dark' : 'light'
    root.classList.add('theme-anim')
    if (next === 'light') root.dataset.theme = 'light'
    else delete root.dataset.theme
    try { localStorage.setItem('kb-theme', next) } catch (e) {}
    syncToggle()
    setTimeout(() => root.classList.remove('theme-anim'), 500)
  })

  const burger = $('.burger')
  burger.addEventListener('click', () => (document.body.classList.contains('menu-open') ? closeMenu() : openMenu()))

  if (!fine || reduced) return
  $$('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect()
      gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.4, duration: 0.4 })
    })
    el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' }))
  })
}

function openMenu() {
  document.body.classList.add('menu-open')
  $('.burger').setAttribute('aria-expanded', 'true')
  $('.menu').setAttribute('aria-hidden', 'false')
  lenis.stop()
  gsap.fromTo('.menu a', { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, stagger: 0.05, duration: 0.6, delay: 0.2, ease: 'expo.out' })
}

function closeMenu() {
  if (!document.body.classList.contains('menu-open')) return
  document.body.classList.remove('menu-open')
  $('.burger').setAttribute('aria-expanded', 'false')
  $('.menu').setAttribute('aria-hidden', 'true')
  lenis.start()
}

setupHouse()
splitHeadings()
counters()
revealImages()
services()
process()
why()
projects()
packages()
estimator()
track()
map()
voices()
faq()
contact()
fab()
footer()
chrome()

const ready = document.fonts ? document.fonts.ready : Promise.resolve()
ready.then(() => { ScrollTrigger.refresh(); intro() })
