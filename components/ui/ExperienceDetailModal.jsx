'use client'

import { useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { FiX, FiChevronLeft, FiChevronRight, FiMapPin, FiCalendar } from 'react-icons/fi'
import { gsap } from '@/lib/gsap'
import styles from '@/styles/ui/ExperienceDetailModal.module.css'

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function ExperienceDetailModal({ exps, index, originRect, hoverMode, onClose, onNavigate }) {
  const backdropRef = useRef(null)
  const dialogRef   = useRef(null)
  const bodyRef     = useRef(null)
  const closeRef    = useRef(null)
  const closingRef  = useRef(false)
  const enteredRef  = useRef(false)
  const leaveTimer  = useRef(null)
  const prevIndexRef = useRef(null)

  const exp   = index != null ? exps[index] : null
  const total = exps.length

  const close = useCallback(() => {
    if (closingRef.current) return
    closingRef.current = true
    clearTimeout(leaveTimer.current)
    const dialog = dialogRef.current
    const backdrop = backdropRef.current
    if (!dialog || !backdrop || prefersReducedMotion()) { onClose(); return }
    gsap.timeline({ onComplete: onClose })
      .to(dialog,   { opacity: 0, scale: 0.94, y: 18, duration: 0.28, ease: 'power2.in' }, 0)
      .to(backdrop, { opacity: 0, duration: 0.3, ease: 'power1.in' }, 0.05)
  }, [onClose])

  useLayoutEffect(() => {
    const prevIndex = prevIndexRef.current
    prevIndexRef.current = index
    if (index == null) { enteredRef.current = false; return }
    const dialog = dialogRef.current
    const backdrop = backdropRef.current
    const body = bodyRef.current
    if (!dialog || !backdrop || !body) return

    if (prevIndex != null) {
      if (prevIndex === index || prefersReducedMotion()) return
      body.scrollTop = 0
      gsap.fromTo(body.querySelectorAll('[data-reveal]'),
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.38, ease: 'power2.out', stagger: 0.025 })
      return
    }

    closingRef.current = false
    if (prefersReducedMotion()) return
    // Grow out of the hovered/clicked card, then reveal the content.
    const final = dialog.getBoundingClientRect()
    let fromX = 0, fromY = 30, fromScale = 0.9
    if (originRect) {
      fromX = (originRect.left + originRect.width / 2) - (final.left + final.width / 2)
      fromY = (originRect.top + originRect.height / 2) - (final.top + final.height / 2)
      fromScale = Math.max(0.25, Math.min(0.7, originRect.width / final.width))
    }
    const items = dialog.querySelectorAll('[data-reveal]')
    gsap.timeline()
      .fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power1.out' }, 0)
      .fromTo(dialog,
        { x: fromX, y: fromY, scale: fromScale, opacity: 0 },
        { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.55, ease: 'expo.out', clearProps: 'transform' }, 0)
      .fromTo(items,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', stagger: 0.035 }, 0.18)
  }, [index, originRect])

  const isOpen = index != null

  useEffect(() => {
    if (!isOpen) return
    const previouslyFocused = document.activeElement
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus({ preventScroll: true })
    return () => {
      document.body.style.overflow = ''
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus({ preventScroll: true })
    }
  }, [isOpen])

  useEffect(() => {
    if (index == null) return
    function onKey(e) {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight') onNavigate((index + 1) % total)
      else if (e.key === 'ArrowLeft') onNavigate((index - 1 + total) % total)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, total, close, onNavigate])

  useEffect(() => () => clearTimeout(leaveTimer.current), [])

  if (!exp || typeof document === 'undefined') return null

  const prev = exps[(index - 1 + total) % total]
  const next = exps[(index + 1) % total]

  // Hover-opened previews dismiss once the pointer has visited the dialog and then leaves it.
  function onDialogEnter() {
    enteredRef.current = true
    clearTimeout(leaveTimer.current)
  }
  function onDialogLeave() {
    if (!hoverMode || !enteredRef.current) return
    clearTimeout(leaveTimer.current)
    leaveTimer.current = setTimeout(close, 380)
  }

  return createPortal(
    <div ref={backdropRef} className={styles.backdrop} onClick={close} role="presentation">
      <div
        ref={dialogRef}
        className={styles.dialog}
        onClick={e => e.stopPropagation()}
        onMouseEnter={onDialogEnter}
        onMouseLeave={onDialogLeave}
        role="dialog"
        aria-modal="true"
        aria-labelledby="exp-modal-title"
      >
        <div className={styles.glow} aria-hidden="true" />

        <header className={styles.topBar}>
          <span className={styles.counter}>
            <em>{String(index + 1).padStart(2, '0')}</em> / {String(total).padStart(2, '0')}
          </span>
          <span className={styles.typeTag}>{exp.type}</span>
          <button ref={closeRef} type="button" className={styles.closeBtn} onClick={close} aria-label="Close details">
            <FiX size={18} />
          </button>
        </header>

        <div ref={bodyRef} className={styles.body}>
          <div className={styles.intro}>
            <h3 id="exp-modal-title" className={styles.role} data-reveal>{exp.role}</h3>
            <p className={styles.company} data-reveal>
              {exp.company}
              {exp.companySub && <span className={styles.companySub}> · {exp.companySub}</span>}
            </p>
            <div className={styles.meta} data-reveal>
              <span className={styles.metaItem}><FiCalendar size={13} /> {exp.period} – {exp.periodEnd}</span>
              {exp.location && <span className={styles.metaItem}><FiMapPin size={13} /> {exp.location}</span>}
            </div>
            {exp.desc && <p className={styles.desc} data-reveal>{exp.desc}</p>}
          </div>

          {exp.metrics?.length > 0 && (
            <div className={styles.metrics}>
              {exp.metrics.map(m => (
                <div key={m.label} className={styles.metric} data-reveal>
                  <span className={styles.metricValue}>{m.value}</span>
                  <span className={styles.metricLabel}>{m.label}</span>
                </div>
              ))}
            </div>
          )}

          <section className={styles.block}>
            <h4 className={styles.blockTitle} data-reveal>What I did</h4>
            <ol className={styles.bullets}>
              {exp.bullets.map((b, bi) => (
                <li key={bi} className={styles.bullet} data-reveal>
                  <span className={styles.bulletNum}>{String(bi + 1).padStart(2, '0')}</span>
                  <span>{b}</span>
                </li>
              ))}
            </ol>
          </section>

          {exp.tech?.length > 0 && (
            <section className={styles.block}>
              <h4 className={styles.blockTitle} data-reveal>Tools &amp; technologies</h4>
              <div className={styles.tags} data-reveal>
                {exp.tech.map(t => <span key={t} className={styles.tag}>{t}</span>)}
              </div>
            </section>
          )}
        </div>

        <footer className={styles.footer}>
          <button type="button" className={styles.navBtn} onClick={() => onNavigate((index - 1 + total) % total)}>
            <FiChevronLeft size={16} />
            <span className={styles.navText}><small>Previous</small>{prev.companyShort || prev.company}</span>
          </button>
          <button type="button" className={`${styles.navBtn} ${styles.navNext}`} onClick={() => onNavigate((index + 1) % total)}>
            <span className={styles.navText}><small>Next</small>{next.companyShort || next.company}</span>
            <FiChevronRight size={16} />
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  )
}
