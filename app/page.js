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

    function resetPanels(targetTop, forward) {
      let top = 0
      for (const section of el.firstElementChild.children) {
        const h = section.offsetHeight
        if (targetTop >= top - 2 && targetTop < top + h - 2) {
          if (section.offsetHeight > el.clientHeight + 4) return
          section.querySelectorAll('*').forEach((node) => {
            if (node.scrollHeight <= node.clientHeight + 4) return
            if (!/auto|scroll/.test(window.getComputedStyle(node).overflowY)) return
            node.scrollTop = forward ? 0 : node.scrollHeight
          })
          return
        }
        top += h
      }
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

      const forward = idx > idxRef.current
      const target = getScrollTopForIdx(idx)
      resetPanels(target, forward)

      idxRef.current = idx
      busyRef.current = true
      tweenRef.current?.kill()
      tweenRef.current = gsap.to(el, {
        scrollTop: target,
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
    let touchX = 0
    const touchThreshold = window.matchMedia('(max-width: 767px)').matches ? 52 : 40

    let panel = null
    let panelAtTop = true
    let panelAtBottom = true

    function onTouchStart(e) {
      touchY = e.touches[0].clientY
      touchX = e.touches[0].clientX
      touchTargetRef.current = e.target
      panel = findScrollableAncestor(e.target, el)
      panelAtTop    = !panel || panel.scrollTop <= 2
      panelAtBottom = !panel || panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 2
    }

    // Native momentum scrolling of <main> fights the GSAP snap tween and leaves sticky
    // sections half-stacked, so only inner scrollable panels may scroll natively.
    function onTouchMove(e) {
      if (!e.cancelable) return
      const dy = touchY - e.touches[0].clientY
      const dx = touchX - e.touches[0].clientX
      if (Math.abs(dx) > Math.abs(dy)) return

      if (panel) {
        const atTop    = panel.scrollTop <= 2
        const atBottom = panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 2
        if ((dy > 0 && !atBottom) || (dy < 0 && !atTop)) return
      }
      e.preventDefault()
    }

    function onTouchEnd(e) {
      const dy = touchY - e.changedTouches[0].clientY
      const dx = touchX - e.changedTouches[0].clientX
      if (Math.abs(dy) < touchThreshold || Math.abs(dx) > Math.abs(dy) || busyRef.current) return

      // Leave the section only if the inner panel was already at its edge when the swipe began.
      if (dy > 0 && !panelAtBottom) return
      if (dy < 0 && !panelAtTop) return

      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8
      const atTop    = el.scrollTop < 8
      if (dy > 0 && atBottom) { fadeLoop(0, 0); return }
      if (dy < 0 && atTop)    return
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
    el.addEventListener('touchmove',  onTouchMove,  { passive: false })
    el.addEventListener('touchend',   onTouchEnd,   { passive: true })
    window.addEventListener('navigate-section', onNavigate)
    window.addEventListener('footer-loop-back', onFooterLoop)

    let resizeTimer = null
    function syncViewport() {
      ScrollTrigger.refresh()
      const idx = idxRef.current
      if (!busyRef.current) {
        el.scrollTop = getScrollTopForIdx(idx)
        ScrollTrigger.update()
      }
    }
    function onResize() {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(syncViewport, 140)
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', syncViewport)
    window.visualViewport?.addEventListener('resize', onResize)

    return () => {
      el.removeEventListener('wheel',  onWheel)
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('navigate-section', onNavigate)
      window.removeEventListener('footer-loop-back', onFooterLoop)
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove',  onTouchMove)
      el.removeEventListener('touchend',   onTouchEnd)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', syncViewport)
      window.visualViewport?.removeEventListener('resize', onResize)
      clearTimeout(resizeTimer)
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
          background: 'var(--canvas)',
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
