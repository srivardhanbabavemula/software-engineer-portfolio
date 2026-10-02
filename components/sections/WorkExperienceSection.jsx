'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { FiArrowUpRight } from 'react-icons/fi'
import { gsap } from '@/lib/gsap'
import { useTilt3D } from '@/lib/useMouseParallax'
import AuroraLayer from '@/components/ui/AuroraLayer'
import ExperienceDetailModal from '@/components/ui/ExperienceDetailModal'
import profile from '@/data/profile.json'
import styles from '@/styles/sections/WorkExperienceSection.module.css'

const EXPS = profile.experience
const HOVER_DELAY = 650
const PREVIEW_TAGS = 3

export default function WorkExperienceSection() {
  const sectionRef        = useRef(null)
  const lineRef           = useRef(null)
  const cardWrapRef       = useRef(null)
  const dotRefs           = useRef([])
  const cardRefs          = useRef([])
  const tlRef             = useRef(null)
  const hoverTimer        = useRef(null)
  const cooldownUntil     = useRef(0)
  const progressRefs      = useRef([])

  const [active, setActive] = useState(null)

  useTilt3D(cardWrapRef, 4)

  const canHover = () =>
    typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches

  function openDetail(i, hoverMode = false) {
    clearTimeout(hoverTimer.current)
    const card = cardRefs.current[i]
    const r = card?.getBoundingClientRect()
    setActive({ index: i, hoverMode, originRect: r ? { left: r.left, top: r.top, width: r.width, height: r.height } : null })
  }

  const closeDetail = useCallback(() => {
    cooldownUntil.current = Date.now() + 700
    setActive(null)
  }, [])

  const navigateDetail = useCallback((i) => {
    setActive(a => (a ? { ...a, index: i, hoverMode: false } : a))
  }, [])

  function handleCardEnter(i) {
    const dot = dotRefs.current[i]
    if (dot) gsap.to(dot, { scale: 1.1, boxShadow: '0 0 0 8px rgba(122,127,230,0.16), 0 10px 26px rgba(59,99,224,0.22)', duration: 0.3, ease: 'back.out(2)' })
    if (!canHover() || active || Date.now() < cooldownUntil.current) return
    const bar = progressRefs.current[i]
    if (bar) gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: HOVER_DELAY / 1000, ease: 'none' })
    clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => openDetail(i, true), HOVER_DELAY)
  }

  function handleCardLeave(i) {
    clearTimeout(hoverTimer.current)
    const dot = dotRefs.current[i]
    if (dot) gsap.to(dot, { scale: 1, boxShadow: '0 0 0 6px rgba(122,127,230,0.08), 0 8px 22px rgba(16,27,45,0.08)', duration: 0.25, ease: 'power2.in' })
    const bar = progressRefs.current[i]
    if (bar) gsap.to(bar, { scaleX: 0, duration: 0.2, ease: 'power2.out' })
  }

  function handleCardKey(e, i) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(i) }
  }

  useEffect(() => () => clearTimeout(hoverTimer.current), [])

  useEffect(() => {
    const section = sectionRef.current
    if (!section || !lineRef.current) return

    const scroller = document.querySelector('main')
    if (!scroller) return

    let isActive = false

    function resetAnim() {
      tlRef.current?.kill()
      gsap.set(lineRef.current,      { scaleX: 0, transformOrigin: 'left center' })
      dotRefs.current.forEach(el  => el && gsap.set(el,  { scale: 0, opacity: 0 }))
      cardRefs.current.forEach(el => el && gsap.set(el, { opacity: 0, y: 28 }))
    }

    function playAnim() {
      resetAnim()
      const n  = EXPS.length
      const tl = gsap.timeline()
      tlRef.current = tl
      tl.to(lineRef.current, { scaleX: 1, duration: 1.6, ease: 'power2.inOut' }, 0)
      EXPS.forEach((_, i) => {
        const t = i === 0 ? 0.08 : 0.08 + (i / (n - 1)) * 1.44
        tl.to(dotRefs.current[i],  { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)' }, t)
        tl.to(cardRefs.current[i], { opacity: 1, y: 0,    duration: 0.6, ease: 'power3.out'  }, t + 0.14)
      })
    }

    resetAnim()

    function onScroll() {
      const inRange = Math.abs(scroller.scrollTop - section.offsetTop) < window.innerHeight * 0.5
      if (inRange && !isActive)  { isActive = true;  playAnim() }
      if (!inRange && isActive)  { isActive = false; resetAnim() }
    }

    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => scroller.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section ref={sectionRef} className={styles.section} data-snap-index="4">

      <AuroraLayer variant="calm" />

      <div className={styles.header}>
        <div className={styles.headingGroup}>
          <span className={styles.label}>Work Experience</span>
          <h2 className={styles.heading}>
            Where I&apos;ve <em className={styles.headingAccent}>grown</em>
          </h2>
        </div>
        <span className={styles.labelRight}>{String(EXPS.length).padStart(2, '0')} Roles</span>
      </div>

      <div ref={cardWrapRef} className={styles.timeline}>
        <div className={styles.timelineBody}>

          {/* Snake connector */}
          <div ref={lineRef} className={styles.snakeLine} />

          {/* Entry columns */}
          <div className={styles.entries}>
            {EXPS.map((exp, i) => (
              <div
                key={exp.id}
                className={styles.entry}
                onMouseEnter={() => handleCardEnter(i)}
                onMouseLeave={() => handleCardLeave(i)}
              >

                <div
                  ref={el => { dotRefs.current[i] = el }}
                  className={styles.dot}
                >
                  <span className={styles.dotNum}>0{i + 1}</span>
                </div>

                <div
                  ref={el => { cardRefs.current[i] = el }}
                  className={`${styles.card} ${active?.index === i ? styles.cardActive : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-haspopup="dialog"
                  aria-label={`${exp.role} at ${exp.company} — view full details`}
                  onClick={() => openDetail(i)}
                  onKeyDown={e => handleCardKey(e, i)}
                >
                  <h2 className={styles.role}>{exp.role}</h2>
                  <p className={styles.company}>{exp.company}</p>
                  {exp.companySub && (
                    <p className={styles.companySub}>{exp.companySub}</p>
                  )}
                  <div className={styles.cardMeta}>
                    <span className={styles.period}>{exp.period} – {exp.periodEnd}</span>
                    <span className={styles.typeTag}>{exp.type}</span>
                    {exp.location && <span className={styles.location}>{exp.location}</span>}
                  </div>
                  <p className={styles.summary}>{exp.desc || exp.bullets[0]}</p>
                  <div className={styles.stack}>
                    {exp.tech.slice(0, PREVIEW_TAGS).map(t => (
                      <span key={t} className={styles.tag}>{t}</span>
                    ))}
                    {exp.tech.length > PREVIEW_TAGS && (
                      <span className={`${styles.tag} ${styles.tagMore}`}>+{exp.tech.length - PREVIEW_TAGS}</span>
                    )}
                  </div>
                  <span className={styles.viewMore}>
                    View details · {exp.bullets.length} highlights <FiArrowUpRight size={13} />
                  </span>
                  <span
                    ref={el => { progressRefs.current[i] = el }}
                    className={styles.hoverProgress}
                    aria-hidden="true"
                  />
                </div>

              </div>
            ))}
          </div>

        </div>
      </div>

      <ExperienceDetailModal
        exps={EXPS}
        index={active?.index ?? null}
        originRect={active?.originRect ?? null}
        hoverMode={active?.hoverMode ?? false}
        onClose={closeDetail}
        onNavigate={navigateDetail}
      />

    </section>
  )
}
