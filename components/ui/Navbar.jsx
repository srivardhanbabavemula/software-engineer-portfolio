'use client'

import { useEffect, useRef, useState } from 'react'
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu'
import { gsap } from '@/lib/gsap'
import profile from '@/data/profile.json'
import { NAV_ITEMS, SECTION, isNavItemActive, scrollToSection } from '@/lib/sections'
import { getIdxFromScrollTop, getNavActiveIdx, getViewportHeight } from '@/lib/scrollSnap'
import styles from '@/styles/ui/Navbar.module.css'
import { FaBars, FaTimes } from 'react-icons/fa'

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
        gsap.to(headerRef.current, { y: '-100%', duration: 0.35, ease: 'power2.inOut' })
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

  return (
    <>
      <header ref={headerRef} className={`${styles.header} ${onIntro ? styles.introMode : ''} ${onDark ? styles.darkMode : ''}`}>
        <span className={styles.time}>BUFFALO TIME - {time}</span>

        <NavigationMenu className={styles.navMenu}>
          <NavigationMenuList className={styles.navList}>
            {NAV_ITEMS.map(({ label, idx }) => {
              const isActive = isNavItemActive(label, idx, activeIdx)

              return (
                <NavigationMenuItem key={label}>
                  <NavigationMenuLink
                    className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                    onClick={() => handleNavClick(idx)}
                    style={{ cursor: 'pointer' }}
                  >
                    {label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )
            })}
          </NavigationMenuList>
        </NavigationMenu>

        <a
          href={profile.resume ?? '/assets/resume.pdf'}
          download="SriVardhan_Baba_Vemula_Resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.emailBtn} rounded-full text-xs font-semibold px-5 h-8`}
          style={{ marginRight: '0.5rem' }}
        >
          Resume
        </a>

        <a
          href={`mailto:${profile.email}`}
          className={`${styles.emailBtn} rounded-full text-xs font-semibold px-5 h-8`}
        >
          Email me
        </a>

        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
        </button>
      </header>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          {NAV_ITEMS.map(({ label, idx }) => {
            const isActive = isNavItemActive(label, idx, activeIdx)

            return (
              <button
                key={label}
                className={`${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`}
                onClick={() => handleNavClick(idx)}
              >
                {label}
              </button>
            )
          })}
          <a
            href={profile.resume ?? '/assets/resume.pdf'}
            download="SriVardhan_Baba_Vemula_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mobileMailLink}
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
      )}
    </>
  )
}
