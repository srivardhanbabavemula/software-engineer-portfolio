'use client'

import { useEffect, useMemo, useRef } from 'react'
import styles from '@/styles/ui/SkillGlobe.module.css'

const TINTS = ['tintBlue', 'tintLavender', 'tintSage', 'tintSky']
const AUTO_SPEED = 0.16
const TILT = -0.32
const DRAG_GAIN = 0.0065
const FRICTION = 2.4

function fibonacciSphere(count) {
  const points = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = count === 1 ? 0 : 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = golden * i
    points.push({ x: Math.cos(theta) * r, y, z: Math.sin(theta) * r })
  }
  return points
}

/**
 * DOM-based CSS-3D tag sphere.
 * items: Array<string | { label: string, group?: number }>
 */
export default function SkillGlobe({ items = [], label = 'Skills', className = '' }) {
  const wrapRef = useRef(null)
  const tagRefs = useRef([])

  const tags = useMemo(
    () => items.map(it => (typeof it === 'string'
      ? { label: it, group: 0 }
      : { label: it.label, group: it.group ?? 0 })),
    [items],
  )

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap || tags.length === 0) return

    const points = fibonacciSphere(tags.length)
    const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let reduced = reduceQuery.matches

    let radius = 140
    let rotX = TILT
    let rotY = 0
    let velX = 0
    let velY = reduced ? 0 : AUTO_SPEED

    let dragging = false
    let pointerId = null
    let lastX = 0
    let lastY = 0
    let lastT = 0
    let startX = 0
    let startY = 0

    let raf = 0
    let prevT = 0
    let inView = false

    function render() {
      const cx = Math.cos(rotX)
      const sx = Math.sin(rotX)
      const cy = Math.cos(rotY)
      const sy = Math.sin(rotY)
      const persp = radius * 3

      for (let i = 0; i < points.length; i++) {
        const el = tagRefs.current[i]
        if (!el) continue
        const p = points[i]
        const x1 = p.x * cy + p.z * sy
        const z1 = -p.x * sy + p.z * cy
        const y1 = p.y * cx - z1 * sx
        const z2 = p.y * sx + z1 * cx

        const depth = (z2 + 1) / 2
        const proj = persp / (persp - z2 * radius)
        const scale = (0.7 + depth * 0.38) * proj * 0.86
        const blur = depth < 0.45 ? ((0.45 - depth) * 4).toFixed(2) : 0

        el.style.transform =
          `translate3d(${(x1 * radius * proj).toFixed(1)}px, ${(y1 * radius * proj).toFixed(1)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`
        el.style.opacity = (0.18 + depth * 0.82).toFixed(3)
        el.style.filter = blur ? `blur(${blur}px)` : 'none'
        el.style.zIndex = String(Math.round(depth * 100))
      }
    }

    function tick(t) {
      const dt = Math.min(0.05, prevT ? (t - prevT) / 1000 : 0.016)
      prevT = t

      if (!dragging) {
        const k = 1 - Math.exp(-dt * FRICTION)
        velY += (AUTO_SPEED - velY) * k
        velX += (0 - velX) * k
        rotX += (TILT - rotX) * (1 - Math.exp(-dt * 0.6))
        rotY += velY * dt
        rotX += velX * dt
      }

      render()
      raf = requestAnimationFrame(tick)
    }

    function start() {
      if (raf || reduced || !inView || document.hidden) return
      prevT = 0
      raf = requestAnimationFrame(tick)
    }

    function stop() {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      prevT = 0
    }

    function percentile(values, p) {
      const sorted = values.filter(Boolean).sort((a, b) => a - b)
      return sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] : 0
    }

    // Fit the sphere so edge tags (projected ~1.06r out, ~0.9 scale) stay inside the box.
    function measure() {
      const els = tagRefs.current.slice(0, points.length)
      const halfW = percentile(els.map(el => el?.offsetWidth ?? 0), 0.8) / 2
      const halfH = percentile(els.map(el => el?.offsetHeight ?? 0), 0.8) / 2
      const fitX = (wrap.clientWidth / 2 - halfW * 0.9) / 1.06
      const fitY = (wrap.clientHeight / 2 - halfH * 0.9 - 8) / 1.06
      radius = Math.max(56, Math.min(fitX, fitY))
      render()
    }

    function onPointerDown(e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      dragging = true
      pointerId = e.pointerId
      lastX = startX = e.clientX
      lastY = startY = e.clientY
      lastT = performance.now()
      velX = 0
      velY = 0
      wrap.setPointerCapture?.(e.pointerId)
      wrap.dataset.dragging = 'true'
      start()
    }

    function onPointerMove(e) {
      if (!dragging || e.pointerId !== pointerId) return
      const now = performance.now()
      const dt = Math.max(0.008, (now - lastT) / 1000)
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      const gain = DRAG_GAIN * (160 / Math.max(radius, 80))
      rotY += dx * gain
      rotX -= dy * gain
      const vY = (dx * gain) / dt
      const vX = (-dy * gain) / dt
      velY = velY * 0.4 + vY * 0.6
      velX = velX * 0.4 + vX * 0.6
      lastX = e.clientX
      lastY = e.clientY
      lastT = now
      if (reduced) render()
    }

    function onPointerUp(e) {
      if (e.pointerId !== pointerId) return
      dragging = false
      pointerId = null
      delete wrap.dataset.dragging
      if (performance.now() - lastT > 90) { velX = 0; velY = 0 }
      wrap.releasePointerCapture?.(e.pointerId)
      start()
    }

    // Keep horizontal globe drags from being read as section swipes by the page scroller.
    function onTouchEnd(e) {
      const t = e.changedTouches[0]
      if (!t) return
      if (Math.abs(t.clientX - startX) > Math.abs(t.clientY - startY)) e.stopPropagation()
    }

    function onVisibility() {
      if (document.hidden) stop()
      else start()
    }

    function onReduceChange(e) {
      reduced = e.matches
      velX = 0
      velY = reduced ? 0 : AUTO_SPEED
      if (reduced) stop()
      else start()
      render()
    }

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      if (inView) start()
      else stop()
    }, { threshold: 0.05 })

    const ro = new ResizeObserver(measure)

    measure()
    document.fonts?.ready.then(measure)
    io.observe(wrap)
    ro.observe(wrap)
    wrap.addEventListener('pointerdown', onPointerDown)
    wrap.addEventListener('pointermove', onPointerMove)
    wrap.addEventListener('pointerup', onPointerUp)
    wrap.addEventListener('pointercancel', onPointerUp)
    wrap.addEventListener('touchend', onTouchEnd)
    document.addEventListener('visibilitychange', onVisibility)
    reduceQuery.addEventListener('change', onReduceChange)

    return () => {
      stop()
      io.disconnect()
      ro.disconnect()
      wrap.removeEventListener('pointerdown', onPointerDown)
      wrap.removeEventListener('pointermove', onPointerMove)
      wrap.removeEventListener('pointerup', onPointerUp)
      wrap.removeEventListener('pointercancel', onPointerUp)
      wrap.removeEventListener('touchend', onTouchEnd)
      document.removeEventListener('visibilitychange', onVisibility)
      reduceQuery.removeEventListener('change', onReduceChange)
    }
  }, [tags])

  return (
    <div ref={wrapRef} className={`${styles.globe} ${className}`}>
      <span className={styles.halo} aria-hidden />
      <span className={styles.ring} aria-hidden />
      <ul className={styles.list} aria-label={label}>
        {tags.map((tag, i) => (
          <li
            key={`${tag.label}-${i}`}
            ref={el => { tagRefs.current[i] = el }}
            className={`${styles.tag} ${styles[TINTS[tag.group % TINTS.length]]}`}
          >
            {tag.label}
          </li>
        ))}
      </ul>
      <span className={styles.hint} aria-hidden>Drag to explore</span>
    </div>
  )
}
