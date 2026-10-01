'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import AuroraLayer from '@/components/ui/AuroraLayer'
import profile from '@/data/profile.json'
import styles from '@/styles/sections/AccomplishmentsSection.module.css'

const ITEMS = profile.accomplishments ?? []

export default function AccomplishmentsSection() {
  const sectionRef = useRef(null)
  const headerRef  = useRef(null)
  const listRef    = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const scroller = document.querySelector('main')
    if (!scroller) return

    let active = false

    function reset() {
      gsap.set(headerRef.current, { opacity: 0, y: 24 })
      gsap.set(listRef.current?.children ?? [], { opacity: 0, x: -20 })
    }

    function play() {
      reset()
      gsap.to(headerRef.current, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
      gsap.to(listRef.current?.children ?? [], {
        opacity: 1, x: 0, duration: 0.55, ease: 'power2.out', stagger: 0.07, delay: 0.1,
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
    <section ref={sectionRef} className={styles.section} data-snap-index="5">
      <AuroraLayer variant="warm" />

      <div ref={headerRef} className={styles.header}>
        <span className={styles.label}>Leadership · Public Speaking · Awards</span>
        <h2 className={styles.title}>Accomplishments</h2>
        <p className={styles.subtitle}>
          {`${ITEMS.length} entries — CSI presidency, technical workshops, Engineers' Day presentations, INSPIRE Award, SSC merit, and community recognition.`}
        </p>
      </div>

      <div ref={listRef} className={styles.list}>
        {ITEMS.map((item, i) => (
          <article key={item.id ?? item.title} className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
              <div className={styles.headBody}>
                <div className={styles.badges}>
                  <span className={styles.category}>{item.category}</span>
                  {item.type && <span className={styles.type}>{item.type}</span>}
                </div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.org}>
                  {item.organization}
                  {item.period ? ` · ${item.period}` : ''}
                  {item.location ? ` · ${item.location}` : ''}
                </p>
              </div>
            </div>

            {item.highlights?.length > 0 && (
              <ul className={styles.bullets}>
                {item.highlights.map(point => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
