'use client'

import { useEffect, useRef, useState } from 'react'
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu'
import { gsap } from '@/lib/gsap'
import AuroraLayer from '@/components/ui/AuroraLayer'
import profile from '@/data/profile.json'
import { NAV_ITEMS, SECTION, isNavItemActive, scrollToSection } from '@/lib/sections'
import { getIdxFromScrollTop, getNavActiveIdx, getViewportHeight } from '@/lib/scrollSnap'
import styles from '@/styles/ui/Navbar.module.css'
import { FaBars, FaTimes } from 'react-icons/fa'

const CITY          = (profile.location?.based ?? '').split(',')[0].trim()
const RESUME_HREF   = profile.resume ?? '/assets/resume.pdf'
const RESUME_NAME   = `${profile.name.full.replace(/\s+/g, '_')}_Resume.pdf`

function getLocalTime() {
  return new Date().toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).toUpperCase()
}

export default function Navbar() {
  const [time,    setTime]    = useState('')
  const [onIntro, setOnIntro] = useState(true)
  const [onDark,  setOnDark]  = useState(false)
  const [activeIdx, setActiveIdx] = useState(SECTION.VIDEO)
  const [menuOpen, setMenuOpen] = useState(false)
  const headerRef   = useRef(null)
  const lastY       = useRef(0)
  const hidden      = useRef(false)
  const stopTimer   = useRef(null)

  useEffect(() => {
    setTime(getLocalTime())
    const id = setInterval(() => setTime(getLocalTime()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const closeMenu = () => {
      if (window.matchMedia('(min-width: 1024px)').matches) setMenuOpen(false)
    }
    window.addEventListener('resize', closeMenu)
    window.addEventListener('orientationchange', closeMenu)
    return () => {
      window.removeEventListener('resize', closeMenu)
      window.removeEventListener('orientationchange', closeMenu)
    }
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  useEffect(() => {
    const scroller = document.querySelector('main') ?? window

    function showNavbar() {
      if (!hidden.current) return
      gsap.to(headerRef.current, { y: '0%', duration: 0.35, ease: 'power2.out' })
      hidden.current = false
    }

    const onScroll = () => {
      const vh = getViewportHeight()
      const currentY = scroller.scrollTop ?? window.scrollY
      const delta    = currentY - lastY.current

      const sectionIdx = getNavActiveIdx(currentY, getIdxFromScrollTop(currentY, vh), vh)
      setActiveIdx(sectionIdx)
      setOnIntro(currentY < vh * 0.8)
      setOnDark(sectionIdx === SECTION.EXPERIENCE)

      if (delta > 8 && !hidden.current) {
        gsap.to(headerRef.current, { y: '-140%', duration: 0.35, ease: 'power2.inOut' })
        hidden.current = true
      } else if (delta < -6) {
        showNavbar()
      }

      lastY.current = currentY

      clearTimeout(stopTimer.current)
      stopTimer.current = setTimeout(showNavbar, 400)
    }

    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      scroller.removeEventListener('scroll', onScroll)
      clearTimeout(stopTimer.current)
    }
  }, [])

  function handleNavClick(idx) {
    scrollToSection(idx)
    setMenuOpen(false)
  }

  const headerClass = [
    styles.header,
    onIntro && !menuOpen ? styles.introMode : '',
    onDark && !menuOpen ? styles.darkMode : '',
    menuOpen ? styles.menuOpen : '',
  ].filter(Boolean).join(' ')

  return (
    <>
      <header ref={headerRef} className={headerClass}>
        <span className={styles.time}>
          <span className={styles.timeDot} aria-hidden />
          {CITY ? `${CITY} · ` : ''}{time}
        </span>

        <NavigationMenu className={styles.navMenu}>
          <NavigationMenuList className={styles.navList}>
            {NAV_ITEMS.map(({ label, idx }) => {
              const isActive = isNavItemActive(label, idx, activeIdx)

              return (
                <NavigationMenuItem key={label}>
                  <NavigationMenuLink
                    className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                    onClick={() => handleNavClick(idx)}
                  >
                    {label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )
            })}
          </NavigationMenuList>
        </NavigationMenu>

        <div className={styles.actions}>
          <a
            href={RESUME_HREF}
            download={RESUME_NAME}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.emailBtn}
          >
            Resume
          </a>

          <a
            href={`mailto:${profile.email}`}
            className={`${styles.emailBtn} ${styles.emailBtnPrimary}`}
          >
            Email me
          </a>

          <button
            type="button"
            className={styles.hamburger}
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className={styles.mobileMenu} role="dialog" aria-modal="true" aria-label="Site navigation">
          <AuroraLayer variant="hero" />

          <nav className={styles.mobileNav}>
            {NAV_ITEMS.map(({ label, idx }, i) => {
              const isActive = isNavItemActive(label, idx, activeIdx)

              return (
                <button
                  key={label}
                  type="button"
                  className={`${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`}
                  onClick={() => handleNavClick(idx)}
                  aria-current={isActive ? 'true' : undefined}
                >
                  <span className={styles.mobileNavNum}>0{i + 1}</span>
                  <span className={styles.mobileNavLabel}>{label}</span>
                </button>
              )
            })}
          </nav>

          <div className={styles.mobileFooter}>
            <a
              href={RESUME_HREF}
              download={RESUME_NAME}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.mobileMailLink} ${styles.mobileResumeLink}`}
              onClick={() => setMenuOpen(false)}
            >
              Download Resume
            </a>
            <a
              href={`mailto:${profile.email}`}
              className={styles.mobileMailLink}
              onClick={() => setMenuOpen(false)}
            >
              {profile.email}
            </a>
          </div>
        </div>
      )}
    </>
  )
}
