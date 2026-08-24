'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { gsap } from '@/lib/gsap'
import profile from '@/data/profile.json'
import content from '@/data/content.json'
import styles from '@/styles/sections/VideoIntro.module.css'

const CinematicLayer = dynamic(() => import('@/components/three/CinematicLayer'), { ssr: false })

const INTRO_VIDEO = '/assets/about_me.mp4'

function scrollNext() {
  const main = document.querySelector('main')
  if (main) main.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
}

export default function VideoIntro() {
  const videoRef    = useRef(null)
  const greetRef    = useRef(null)
  const nameRef     = useRef(null)
  const roleRef     = useRef(null)
  const scrollRef   = useRef(null)
  const hintRef     = useRef(null)

  const [muted,    setMuted]    = useState(true)
  const [playing,  setPlaying]  = useState(true)
  const [showHint, setShowHint] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.matchMedia('(max-width: 767px)').matches)
  }, [])

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.4 })
    tl.fromTo(greetRef.current,  { opacity: 0, y: -18 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
      .fromTo(nameRef.current,   { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' }, '-=0.2')
      .fromTo(roleRef.current,   { opacity: 0, y:  20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4')
      .fromTo(scrollRef.current, { opacity: 0 },         { opacity: 1, duration: 0.5 }, '-=0.1')
    return () => tl.kill()
  }, [])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (typeof v.play !== 'function') return
    v.muted = true
    const t = gsap.fromTo(v, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out' })
    return () => t.kill()
  }, [])

  useEffect(() => {
    function onLoaderDismissed() {
      const v = videoRef.current
      if (!v) return
      if (typeof v.play !== 'function') return
      v.muted = false
      setMuted(false)
      dismissHint()
    }
    window.addEventListener('loader-dismissed', onLoaderDismissed)
    return () => window.removeEventListener('loader-dismissed', onLoaderDismissed)
  }, [])

  useEffect(() => {
    function onAnimationDone() {
      const v = videoRef.current
      if (!v) return
      if (typeof v.play !== 'function') return
      v.play().catch(() => {})
    }
    window.addEventListener('loader-animation-done', onAnimationDone)
    return () => window.removeEventListener('loader-animation-done', onAnimationDone)
  }, [])

  useEffect(() => {
    if (!showHint) return
    const id = setTimeout(() => dismissHint(), 6000)
    return () => clearTimeout(id)
  }, [showHint])

  function dismissHint() {
    if (!hintRef.current) return
    gsap.to(hintRef.current, {
      opacity: 0, y: -8, duration: 0.35,
      onComplete: () => setShowHint(false),
    })
  }

  function togglePlay() {
    const v = videoRef.current
    if (!v) return
    if (typeof v.play !== 'function') return
    if (playing) { v.pause(); setPlaying(false) }
    else         { v.play();  setPlaying(true)  }
  }

  function toggleMute() {
    if (showHint) dismissHint()
    const v = videoRef.current
    if (!v) return
    if (typeof v.play !== 'function') return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  function handleEnded() {
    const main = document.querySelector('main')
    if (main && main.scrollTop < window.innerHeight * 0.4) scrollNext()
  }

  return (
    <section className={styles.section} data-snap-index="0">

      <video
        src={INTRO_VIDEO}
        autoPlay muted playsInline loop
        aria-hidden="true"
        className={styles.bgVideo}
      />

      <video
        ref={videoRef}
        data-testid="intro-video"
        src={INTRO_VIDEO}
        muted playsInline loop
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={handleEnded}
        className={styles.mainVideo}
      />

      <div className={styles.overlay} />

      {!isMobile && <CinematicLayer />}

      <div className={styles.heroContent}>
        <p ref={greetRef} className={styles.eyebrow}>{content.site.tagline}</p>
        <h1 ref={nameRef} className={styles.name}>
          {profile.name.first}<br />
          <span className={styles.nameMiddle}>{profile.name.middle}</span>{' '}
          {profile.name.last}
        </h1>
        <p ref={roleRef} className={styles.role}>{profile.roles.detailed}</p>
        <p className={styles.detailLine}>
          {[...new Set([profile.email, profile.emailPersonal].filter(Boolean)), profile.phone].join(' · ')}
        </p>
        <p className={styles.detailSub}>{profile.location.based} · {profile.location.availability}</p>
      </div>

      {!playing && (
        <button className={styles.playOverlay} onClick={togglePlay} aria-label="Play video">
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
            <circle cx="36" cy="36" r="35" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
            <polygon points="29,20 56,36 29,52" fill="white" />
          </svg>
        </button>
      )}

      {showHint && (
        <div ref={hintRef} className={styles.soundHint} onClick={toggleMute} style={{ pointerEvents: 'all', cursor: 'pointer' }}>
          <span className={styles.soundPulse} />
          <span>Tap for sound</span>
        </div>
      )}

      <button
        ref={scrollRef}
        className={styles.scrollCue}
        onClick={scrollNext}
        aria-label="Scroll to next section"
      >
        <span className={styles.scrollLabel}>Scroll</span>
        <span className={styles.scrollLine} />
      </button>

    </section>
  )
}
