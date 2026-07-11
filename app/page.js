'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import Navbar                from '@/components/ui/Navbar'
import VideoIntro            from '@/components/sections/VideoIntro'
import HeroSection           from '@/components/sections/HeroSection'
import AboutSection          from '@/components/sections/AboutSection'
import EducationSection      from '@/components/sections/EducationSection'
import ProjectsSection       from '@/components/sections/ProjectsSection'
import WorkExperienceSection from '@/components/sections/WorkExperienceSection'
import AccomplishmentsSection  from '@/components/sections/AccomplishmentsSection'
import SkillsSection         from '@/components/sections/SkillsSection'
import CertificationsSection from '@/components/sections/CertificationsSection'
import PublicationsFooterSection from '@/components/sections/PublicationsFooterSection'
import ScreenLoader from '@/components/sections/ScreenLoader'
import { TOTAL_SNAPS } from '@/lib/sections'
import { getScrollTopForIdx, getIdxFromScrollTop } from '@/lib/scrollSnap'

const TOTAL = TOTAL_SNAPS

function findScrollableAncestor(node, root) {
  let el = node
  while (el && el !== root) {
    const { overflowY } = window.getComputedStyle(el)
    if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 4) {
      return el
    }
    el = el.parentElement
  }
  return null
}

export default function Home() {
  const mainRef        = useRef(null)
  const idxRef         = useRef(0)
  const busyRef        = useRef(false)
  const tweenRef       = useRef(null)
  const loopOverlayRef = useRef(null)
  const touchTargetRef = useRef(null)
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    const el = mainRef.current
    if (!el) return

    function fadeLoop(targetScrollTop, targetIdx) {
      busyRef.current = true
      tweenRef.current?.kill()
      gsap.to(loopOverlayRef.current, {
        opacity: 1,
        duration: 0.55,
        ease: 'power2.in',
        onComplete: () => {
          el.scrollTop    = targetScrollTop
          idxRef.current  = targetIdx
          ScrollTrigger.update()
          gsap.to(loopOverlayRef.current, {
            opacity: 0,
            duration: 0.7,
            ease: 'power2.out',
            delay: 0.05,
            onComplete: () => {
              setTimeout(() => { busyRef.current = false }, 300)
            },
          })
        },
      })
    }

    function goTo(idx) {
      if (idx >= TOTAL) idx = 0
      if (idx < 0)      idx = TOTAL - 1

      if (idx === idxRef.current || busyRef.current) return

      if (idxRef.current === TOTAL - 1 && idx === 0) {
        fadeLoop(0, 0)
        return
      }

      if (idxRef.current === 0 && idx === TOTAL - 1) {
        fadeLoop(getScrollTopForIdx(TOTAL - 1), TOTAL - 1)
        return
      }

      idxRef.current = idx
      busyRef.current = true
      tweenRef.current?.kill()
      tweenRef.current = gsap.to(el, {
        scrollTop: getScrollTopForIdx(idx),
        duration: 0.85,
        ease: 'power3.inOut',
        onUpdate: () => ScrollTrigger.update(),
        onComplete: () => {
          ScrollTrigger.update()
          setTimeout(() => { busyRef.current = false }, 350)
        },
      })
    }

    function onWheel(e) {
      e.preventDefault()
      if (busyRef.current) return
      goTo(idxRef.current + (e.deltaY > 0 ? 1 : -1))
    }

    let touchY = 0
    const touchThreshold = window.matchMedia('(max-width: 767px)').matches ? 52 : 40

    function onTouchStart(e) {
      touchY = e.touches[0].clientY
      touchTargetRef.current = e.target
    }

    function onTouchEnd(e) {
      const dy = touchY - e.changedTouches[0].clientY
      if (Math.abs(dy) < touchThreshold || busyRef.current) return

      const scrollable = touchTargetRef.current
        ? findScrollableAncestor(touchTargetRef.current, el)
        : null

      if (scrollable) {
        const atTop    = scrollable.scrollTop <= 2
        const atBottom = scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - 2
        if (dy > 0 && !atBottom) return
        if (dy < 0 && !atTop) return
      }

      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8
      const atTop    = el.scrollTop < 8
      if (dy > 0 && atBottom) { fadeLoop(0, 0); return }
      if (dy < 0 && atTop)    { fadeLoop(getScrollTopForIdx(TOTAL - 1), TOTAL - 1); return }
      goTo(idxRef.current + (dy > 0 ? 1 : -1))
    }

    function onScroll() {
      if (busyRef.current) return
      idxRef.current = getIdxFromScrollTop(el.scrollTop)
    }

    function onFooterLoop() {
      if (busyRef.current) return
      fadeLoop(0, 0)
    }

    function onNavigate(e) {
      goTo(e.detail.idx)
    }

    el.addEventListener('wheel',  onWheel,  { passive: false })
    el.addEventListener('scroll', onScroll, { passive: true  })
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchend',   onTouchEnd,   { passive: true })
    window.addEventListener('navigate-section', onNavigate)
    window.addEventListener('footer-loop-back', onFooterLoop)

    return () => {
      el.removeEventListener('wheel',  onWheel)
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('navigate-section', onNavigate)
      window.removeEventListener('footer-loop-back', onFooterLoop)
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend',   onTouchEnd)
      tweenRef.current?.kill()
    }
  }, [])

  return (
    <>
      {showLoader && (
        <ScreenLoader onDismiss={() => setShowLoader(false)} />
      )}

      <div
        ref={loopOverlayRef}
        style={{
          position: 'fixed',
          inset: 0,
          background: '#000',
          zIndex: 9999,
          opacity: 0,
          pointerEvents: 'none',
        }}
      />

      <Navbar />
      <main ref={mainRef} className="snapScroller">
        <div>
          <VideoIntro />
          <HeroSection />
          <AboutSection />
          <EducationSection />
          <WorkExperienceSection />
          <AccomplishmentsSection />
          <ProjectsSection />
          <SkillsSection />
          <CertificationsSection />
          <PublicationsFooterSection />
        </div>
      </main>
    </>
  )
}
