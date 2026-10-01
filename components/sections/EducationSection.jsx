'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import AuroraLayer from '@/components/ui/AuroraLayer'
import profile from '@/data/profile.json'
import styles from '@/styles/sections/EducationSection.module.css'

const EDUCATION = profile.education ?? []

export default function EducationSection() {
  const sectionRef = useRef(null)
  const headerRef  = useRef(null)
  const gridRef    = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const scroller = document.querySelector('main')
    if (!scroller) return

    let active = false

    function reset() {
      gsap.set(headerRef.current, { opacity: 0, y: 24 })
      gsap.set(gridRef.current?.children ?? [], { opacity: 0, y: 28 })
    }

    function play() {
      reset()
      gsap.to(headerRef.current, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
      gsap.to(gridRef.current?.children ?? [], {
        opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.14, delay: 0.12,
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

  return (
    <section ref={sectionRef} className={styles.section} data-snap-index="3">
      <AuroraLayer variant="cool" />

      <div ref={headerRef} className={styles.header}>
        <span className={styles.label}>Academic Background</span>
        <h2 className={styles.title}>Education</h2>
        <p className={styles.subtitle}>
          {EDUCATION.length} degrees — from SSC and intermediate studies through B.Tech and M.S. Data Science at University at Buffalo.
        </p>
      </div>

      <div ref={gridRef} className={styles.grid}>
        {EDUCATION.map(edu => (
          <article key={edu.id ?? edu.degree} className={styles.card}>
            <div className={styles.cardTop}>
              <div>
                <p className={styles.degree}>{edu.degree}</p>
                <p className={styles.school}>{edu.school}</p>
              </div>
              {edu.status && <span className={styles.badge}>{edu.status}</span>}
            </div>

            <p className={styles.meta}>
              {edu.period} – {edu.periodEnd}
              {edu.location ? ` · ${edu.location}` : ''}
            </p>

            {edu.highlights?.length > 0 && (
              <ul className={styles.list}>
                {edu.highlights.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}

            {edu.coursework?.length > 0 && (
              <div className={styles.coursework}>
                <p className={styles.courseLabel}>Relevant Coursework</p>
                <div className={styles.tags}>
                  {edu.coursework.map(course => (
                    <span key={course} className={styles.tag}>{course}</span>
                  ))}
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
