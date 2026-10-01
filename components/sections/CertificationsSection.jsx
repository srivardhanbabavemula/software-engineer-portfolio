'use client'

import { useEffect, useRef, useState } from 'react'
import { FiArrowUpRight, FiEye } from 'react-icons/fi'
import { gsap } from '@/lib/gsap'
import profile from '@/data/profile.json'
import AuroraLayer from '@/components/ui/AuroraLayer'
import CertPreviewModal from '@/components/ui/CertPreviewModal'
import styles from '@/styles/sections/CertificationsSection.module.css'

const CERTS = profile.publications.filter(c => c.title !== 'Certificate of Skills Portfolio')
const ISSUER_COUNT = new Set(CERTS.map(c => c.platform)).size

export default function CertificationsSection() {
  const sectionRef = useRef(null)
  const headerRef  = useRef(null)
  const listRef    = useRef(null)
  const [activeCert, setActiveCert] = useState(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const scroller = document.querySelector('main')
    if (!scroller) return

    let active = false

    function reset() {
      gsap.set(headerRef.current, { opacity: 0, y: 20 })
      gsap.set(listRef.current?.children ?? [], { opacity: 0, y: 14 })
    }

    function play() {
      reset()
      gsap.to(headerRef.current, { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' })
      gsap.to(listRef.current?.children ?? [], {
        opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.03, delay: 0.12,
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

  // Let the wheel scroll the certificate list before the page scroller takes over.
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    function onWheel(e) {
      if (list.scrollHeight <= list.clientHeight + 4) return
      const atTop    = list.scrollTop <= 1
      const atBottom = list.scrollTop + list.clientHeight >= list.scrollHeight - 1
      if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) e.stopPropagation()
    }
    list.addEventListener('wheel', onWheel, { passive: true })
    return () => list.removeEventListener('wheel', onWheel)
  }, [])

  function openCert(cert) {
    if (cert.certImage) setActiveCert(cert)
    else if (cert.link?.startsWith('http')) window.open(cert.link, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      <section ref={sectionRef} className={styles.section} data-snap-anchor="certifications">
        <AuroraLayer variant="warm" />

        <header ref={headerRef} className={styles.header}>
          <span className={styles.eyebrow}>Credentials</span>
          <h2 className={styles.title}>
            Certifi&shy;cations <span className={styles.titleAccent}>&amp; learning</span>
          </h2>
          <p className={styles.subtitle}>
            Select any certificate to preview it and verify the credential.
          </p>
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{CERTS.length}</span>
              <span className={styles.statLabel}>Certificates</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{ISSUER_COUNT}</span>
              <span className={styles.statLabel}>Issuers</span>
            </div>
          </div>
        </header>

        <div ref={listRef} className={styles.list}>
          {CERTS.map((cert, i) => (
            <button
              key={cert.id}
              type="button"
              className={styles.card}
              onClick={() => openCert(cert)}
            >
              <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
              <span className={styles.body}>
                <span className={styles.cardTitle}>{cert.title}</span>
                <span className={styles.platform}>{cert.platform} · {cert.year}</span>
                <span className={styles.desc}>{cert.desc}</span>
              </span>
              <span className={styles.action} aria-hidden>
                {cert.certImage ? <FiEye /> : <FiArrowUpRight />}
              </span>
            </button>
          ))}
        </div>
      </section>

      <CertPreviewModal cert={activeCert} onClose={() => setActiveCert(null)} />
    </>
  )
}
