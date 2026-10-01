'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { FiX, FiExternalLink } from 'react-icons/fi'
import styles from '@/styles/ui/CertPreviewModal.module.css'

export default function CertPreviewModal({ cert, onClose }) {
  const backdropRef = useRef(null)
  const closeRef    = useRef(null)

  useEffect(() => {
    if (!cert) return
    const backdrop = backdropRef.current
    const previouslyFocused = document.activeElement
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    // The modal lives inside the page scroller; keep its wheel/swipe gestures from changing sections.
    function contain(e) { e.stopPropagation() }
    function onWheel(e) {
      e.stopPropagation()
      const scroller = e.target instanceof Element ? e.target.closest(`.${styles.imageWrap}`) : null
      if (!scroller || scroller.scrollHeight <= scroller.clientHeight + 1) e.preventDefault()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    backdrop?.addEventListener('wheel', onWheel, { passive: false })
    backdrop?.addEventListener('touchstart', contain, { passive: true })
    backdrop?.addEventListener('touchend', contain, { passive: true })
    closeRef.current?.focus({ preventScroll: true })
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
      backdrop?.removeEventListener('wheel', onWheel)
      backdrop?.removeEventListener('touchstart', contain)
      backdrop?.removeEventListener('touchend', contain)
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus({ preventScroll: true })
    }
  }, [cert, onClose])

  if (!cert) return null

  return (
    <div ref={backdropRef} className={styles.backdrop} onClick={onClose} role="presentation">
      <div
        className={styles.dialog}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cert-modal-title"
      >
        <header className={styles.header}>
          <div className={styles.heading}>
            <p className={styles.eyebrow}>{cert.platform} · {cert.year}</p>
            <h3 id="cert-modal-title" className={styles.title}>{cert.title}</h3>
          </div>
          <button ref={closeRef} type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <FiX size={18} />
          </button>
        </header>

        {cert.certImage ? (
          <div className={styles.imageWrap}>
            <Image
              src={cert.certImage}
              alt={cert.title}
              width={1200}
              height={1600}
              className={styles.image}
              quality={95}
            />
          </div>
        ) : (
          <p className={styles.noImage}>{cert.desc}</p>
        )}

        {cert.link && cert.link.startsWith('http') && (
          <footer className={styles.footer}>
            {cert.certImage && <p className={styles.desc}>{cert.desc}</p>}
            <a href={cert.link} target="_blank" rel="noopener noreferrer" className={styles.verifyBtn}>
              Verify credential <FiExternalLink />
            </a>
          </footer>
        )}
      </div>
    </div>
  )
}
