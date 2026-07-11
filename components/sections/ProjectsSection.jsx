'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import profile from '@/data/profile.json'
import styles from '@/styles/sections/ProjectsSection.module.css'

const PROJECTS = profile.projects
const DESKTOP_MQ = '(min-width: 1024px)'

export default function ProjectsSection() {
  const sectionRef  = useRef(null)
  const trackRef    = useRef(null)
  const slideRefs   = useRef([])
  const bgRefs      = useRef([])
  const contentRefs = useRef([])
  const visualRefs  = useRef([])
  const counterRef  = useRef(null)
  const progressRef = useRef(null)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ)
    const sync = () => setIsDesktop(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    if (!section || !isDesktop) return

    function onMove(e) {
      const r = section.getBoundingClientRect()
      const mx = (e.clientX - r.left) / r.width - 0.5
      const my = (e.clientY - r.top) / r.height - 0.5
      bgRefs.current.forEach(el => {
        if (!el) return
        gsap.to(el, {
          x: mx * 36,
          y: my * 22,
          duration: 0.9,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      })
    }

    section.addEventListener('mousemove', onMove)
    return () => section.removeEventListener('mousemove', onMove)
  }, [isDesktop])

  useEffect(() => {
    const section = sectionRef.current
    const track   = trackRef.current
    if (!section || !track) return

    const scroller = document.querySelector('main')
    if (!scroller) return
    const n = PROJECTS.length
    contentRefs.current = contentRefs.current.slice(0, n)
    visualRefs.current  = visualRefs.current.slice(0, n)
    slideRefs.current   = slideRefs.current.slice(0, n)

    let tl = null

    const updateUI = (progress) => {
      const activeIdx = Math.round(progress * (n - 1))
      if (progressRef.current) {
        gsap.set(progressRef.current, {
          scaleX: progress, transformOrigin: 'left center', overwrite: true,
        })
      }
      if (counterRef.current) counterRef.current.textContent = `0${activeIdx + 1}`
    }

    if (isDesktop) {
      contentRefs.current.forEach((el, i) => {
        if (el && i > 0) gsap.set(el, { opacity: 0, y: 24 })
      })
      visualRefs.current.forEach((el, i) => {
        if (el && i > 0) gsap.set(el, { opacity: 0, scale: 0.96 })
      })

      tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          scroller,
          start: 'top top',
          end: () => `+=${(n - 1) * (document.documentElement.clientHeight || window.innerHeight)}`,
          scrub: 0.35,
          invalidateOnRefresh: true,
          onUpdate: (self) => updateUI(self.progress),
        },
      })

      tl.to(track, {
        xPercent: -((n - 1) / n * 100),
        ease: 'none',
        duration: n - 1,
      }, 0)

      for (let i = 0; i < n - 1; i++) {
        const curr  = contentRefs.current[i]
        const next  = contentRefs.current[i + 1]
        const nextV = visualRefs.current[i + 1]

        if (curr) {
          tl.to(curr, { opacity: 0, y: -24, duration: 0.2, ease: 'power2.in' }, i + 0.3)
        }
        if (visualRefs.current[i]) {
          tl.to(visualRefs.current[i], { opacity: 0, scale: 0.98, duration: 0.2, ease: 'power2.in' }, i + 0.3)
        }

        if (nextV) {
          tl.fromTo(nextV, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.55, ease: 'power2.out' }, i + 0.35)
        }

        if (next) {
          tl.set(next, { opacity: 1, y: 0 }, i + 0.42)
          const title = next.querySelector(`.${styles.title}`)
          const sub   = next.querySelector(`.${styles.subtitle}`)
          const desc  = next.querySelector(`.${styles.desc}`)
          const ctx   = next.querySelector(`.${styles.context}`)
          const tags  = next.querySelectorAll(`.${styles.tag}`)
          const btn   = next.querySelector(`.${styles.liveBtn}`)

          if (title) tl.fromTo(title, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: 'expo.out' }, i + 0.44)
          if (sub)   tl.fromTo(sub,   { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.28, ease: 'power2.out' }, i + 0.5)
          if (desc)  tl.fromTo(desc,  { y: 8, opacity: 0 },  { y: 0, opacity: 1, duration: 0.32, ease: 'power2.out' }, i + 0.54)
          if (ctx)   tl.fromTo(ctx,   { y: 8, opacity: 0 },  { y: 0, opacity: 1, duration: 0.32, ease: 'power2.out' }, i + 0.58)
          if (tags.length) {
            tl.fromTo(tags, { y: 6, opacity: 0 }, { y: 0, opacity: 1, duration: 0.22, ease: 'power2.out', stagger: 0.03 }, i + 0.62)
          }
          if (btn) tl.fromTo(btn, { y: 6, opacity: 0 }, { y: 0, opacity: 1, duration: 0.28, ease: 'power2.out' }, i + 0.68)
        }
      }
    } else {
      slideRefs.current.forEach((slide, i) => {
        if (!slide) return
        gsap.set(slide, {
          autoAlpha: i === 0 ? 1 : 0,
          pointerEvents: i === 0 ? 'auto' : 'none',
        })
      })

      tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          scroller,
          start: 'top top',
          end: () => `+=${(n - 1) * (document.documentElement.clientHeight || window.innerHeight)}`,
          scrub: 0.2,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const activeIdx = Math.round(self.progress * (n - 1))
            updateUI(self.progress)
            slideRefs.current.forEach((slide, i) => {
              if (!slide) return
              const on = i === activeIdx
              gsap.set(slide, {
                autoAlpha: on ? 1 : 0,
                pointerEvents: on ? 'auto' : 'none',
              })
            })
          },
        },
      })
    }

    const refresh = () => ScrollTrigger.refresh()
    const onLoad = () => { refresh(); window.removeEventListener('load', onLoad) }
    window.addEventListener('load', onLoad)
    window.addEventListener('resize', refresh)
    const t = setTimeout(refresh, 150)

    return () => {
      clearTimeout(t)
      window.removeEventListener('load', onLoad)
      window.removeEventListener('resize', refresh)
      tl?.scrollTrigger?.kill()
      tl?.kill()
      gsap.set(track, { clearProps: 'transform' })
      slideRefs.current.forEach(slide => slide && gsap.set(slide, { clearProps: 'opacity,visibility,pointerEvents' }))
    }
  }, [isDesktop])

  return (
    <div
      className={styles.wrapper}
      style={{
        height: `${PROJECTS.length * 100}vh`,
        ['--project-count']: PROJECTS.length,
      }}
      data-snap-anchor="projects"
    >
      <section ref={sectionRef} className={styles.section}>

        <div className={styles.topBar}>
          <span className={styles.sectionLabel}>Featured Work</span>
          <div className={styles.counter}>
            <span ref={counterRef} className={styles.cCur}>01</span>
            <span className={styles.cSep}> / </span>
            <span className={styles.cTot}>0{PROJECTS.length}</span>
          </div>
        </div>

        <div
          ref={trackRef}
          className={`${styles.track} ${isDesktop ? styles.trackDesktop : styles.trackStacked}`}
          style={isDesktop ? { width: `${PROJECTS.length * 100}vw` } : undefined}
        >
          {PROJECTS.map((proj, i) => (
            <div
              key={proj.id}
              ref={el => { slideRefs.current[i] = el }}
              className={styles.slide}
            >
              {proj.bgImage && (
                <div className={styles.slideBg} aria-hidden>
                  <div ref={el => { bgRefs.current[i] = el }} className={styles.slideBgInner}>
                    <Image
                      src={proj.bgImage}
                      alt=""
                      fill
                      quality={90}
                      className={styles.slideBgImg}
                      sizes="100vw"
                      style={{ objectPosition: proj.bgImagePosition ?? 'center center' }}
                      priority={i === 0}
                    />
                  </div>
                </div>
              )}
              <span className={styles.slideNum} aria-hidden>0{i + 1}</span>

              <div
                ref={el => { contentRefs.current[i] = el }}
                className={styles.slideContent}
              >
                <div className={styles.meta}>
                  <span className={styles.typeTag}>{proj.type}</span>
                </div>
                <h2 className={styles.title}>{proj.title}</h2>
                <p className={styles.subtitle}>{proj.subtitle}</p>
                <p className={styles.desc}>{proj.desc}</p>
                {proj.context && <p className={styles.context}>{proj.context}</p>}
                <div className={styles.stack}>
                  {proj.tech.map(t => (
                    <span key={t} className={styles.tag}>{t}</span>
                  ))}
                </div>
                <a
                  href={proj.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.liveBtn}
                >
                  <span>View on GitHub</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>

              <div
                ref={el => { visualRefs.current[i] = el }}
                className={styles.visualPanel}
              >
                <Image
                  src={proj.image}
                  alt={`${proj.title} cover`}
                  fill
                  quality={95}
                  className={styles.visualImg}
                  sizes="(min-width: 1024px) 45vw, 92vw"
                  priority={i === 0}
                />
              </div>
            </div>
          ))}
        </div>

        <div className={styles.bottomUI}>
          <div className={styles.progressTrack}>
            <div ref={progressRef} className={styles.progressBar} />
          </div>
        </div>

      </section>
    </div>
  )
}
