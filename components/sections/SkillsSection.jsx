'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import AuroraLayer from '@/components/ui/AuroraLayer'
import SkillGlobe from '@/components/ui/SkillGlobe'
import profile from '@/data/profile.json'
import styles from '@/styles/sections/SkillsSection.module.css'

const SKILL_GROUPS = profile.skillGroups ?? []
const TINTS = ['tintBlue', 'tintLavender', 'tintSage', 'tintSky']

function groupIndexFor(skill) {
  const needle = skill.toLowerCase()
  const exact = SKILL_GROUPS.findIndex(g => g.items.some(item => item.toLowerCase() === needle))
  if (exact >= 0) return exact
  const partial = SKILL_GROUPS.findIndex(g => g.items.some(item => item.toLowerCase().includes(needle)))
  return partial < 0 ? 0 : partial
}

const GLOBE_ITEMS = (profile.skills ?? []).map(skill => ({ label: skill, group: groupIndexFor(skill) }))

export default function SkillsSection() {
  const sectionRef = useRef(null)
  const headerRef  = useRef(null)
  const gridRef    = useRef(null)
  const globeRef   = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const scroller = document.querySelector('main')
    if (!scroller) return

    let active = false

    function reset() {
      gsap.set(headerRef.current, { opacity: 0, y: 24 })
      gsap.set(globeRef.current, { opacity: 0, scale: 0.94 })
      gsap.set(gridRef.current?.children ?? [], { opacity: 0, y: 20 })
    }

    function play() {
      reset()
      gsap.to(headerRef.current, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
      gsap.to(globeRef.current, { opacity: 1, scale: 1, duration: 1.1, ease: 'power3.out', delay: 0.1 })
      gsap.to(gridRef.current?.children ?? [], {
        opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', stagger: 0.06, delay: 0.15,
      })
    }

    reset()

    function onScroll() {
      const inRange = Math.abs(scroller.scrollTop - section.offsetTop) < window.innerHeight * 0.45
      if (inRange && !active) { active = true; play() }
      if (!inRange && active) { active = false; reset() }
    }

    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => scroller.removeEventListener('scroll', onScroll)
  }, [])

  // Let the wheel scroll the group list before the page scroller takes over.
  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    function onWheel(e) {
      if (grid.scrollHeight <= grid.clientHeight + 4) return
      const atTop    = grid.scrollTop <= 1
      const atBottom = grid.scrollTop + grid.clientHeight >= grid.scrollHeight - 1
      if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) e.stopPropagation()
    }
    grid.addEventListener('wheel', onWheel, { passive: true })
    return () => grid.removeEventListener('wheel', onWheel)
  }, [])

  return (
    <section ref={sectionRef} className={styles.section} data-snap-anchor="skills">
      <AuroraLayer variant="calm" />

      <header ref={headerRef} className={styles.header}>
        <span className={styles.eyebrow}>Technical Skills</span>
        <h2 className={styles.title}>
          Skills &amp; <span className={styles.titleAccent}>stack</span>
        </h2>
        <p className={styles.subtitle}>
          {SKILL_GROUPS.length} skill areas — {profile.roles.detailed}
        </p>
      </header>

      <div ref={globeRef} className={styles.globeCol}>
        <SkillGlobe items={GLOBE_ITEMS} label="Core skills" className={styles.globe} />
      </div>

      <div ref={gridRef} className={styles.grid}>
        {SKILL_GROUPS.map((group, i) => (
          <article key={group.title} className={`${styles.card} ${styles[TINTS[i % TINTS.length]]}`}>
            <h3 className={styles.cardTitle}>
              <span className={styles.cardDot} aria-hidden />
              {group.title}
              <span className={styles.cardCount}>{group.items.length}</span>
            </h3>
            <ul className={styles.tags}>
              {group.items.map(skill => (
                <li key={skill} className={styles.tag}>{skill}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}
