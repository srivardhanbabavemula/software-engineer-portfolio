import { SECTION, TOTAL_SNAPS } from '@/lib/sections'

function vh() {
  if (typeof window === 'undefined') return 800
  return document.documentElement.clientHeight || window.innerHeight
}

function getScroller() {
  if (typeof document === 'undefined') return null
  return document.querySelector('main')
}

/** Offset of an element from the top of the scroll container (stable while scrolling). */
export function getElementScrollTop(el, scroller = getScroller()) {
  if (!el || !scroller) return 0
  const elRect = el.getBoundingClientRect()
  const scRect = scroller.getBoundingClientRect()
  return elRect.top - scRect.top + scroller.scrollTop
}

/** Scroll position for a snap index — uses DOM offsets when available */
export function getScrollTopForIdx(idx, height = vh()) {
  if (typeof document === 'undefined') return idx * height

  const scroller = getScroller()
  const projects = document.querySelector('[data-snap-anchor="projects"]')
  const skills = document.querySelector('[data-snap-anchor="skills"]')
  const certifications = document.querySelector('[data-snap-anchor="certifications"]')
  const footer = document.querySelector('[data-snap-anchor="footer"]')
  const single = document.querySelector(`[data-snap-index="${idx}"]`)

  if (idx <= SECTION.ACCOMPLISHMENTS && single) {
    return getElementScrollTop(single, scroller)
  }

  if (idx >= SECTION.PROJECTS && idx < SECTION.SKILLS && projects) {
    return getElementScrollTop(projects, scroller) + (idx - SECTION.PROJECTS) * height
  }

  if (idx === SECTION.SKILLS && skills) return getElementScrollTop(skills, scroller)
  if (idx === SECTION.CERTIFICATIONS && certifications) {
    return getElementScrollTop(certifications, scroller)
  }

  if (idx >= SECTION.PUBLICATIONS && footer) {
    return getElementScrollTop(footer, scroller) + (idx - SECTION.PUBLICATIONS) * height
  }

  return idx * height
}

/** Nearest snap index for a scroll position */
export function getIdxFromScrollTop(scrollTop, height = vh()) {
  let bestIdx = 0
  let bestDist = Infinity

  for (let i = 0; i < TOTAL_SNAPS; i++) {
    const dist = Math.abs(scrollTop - getScrollTopForIdx(i, height))
    if (dist < bestDist) {
      bestDist = dist
      bestIdx = i
    }
  }

  return bestIdx
}

/** Nav highlight index — keeps Projects active inside the projects scroll range */
export function getNavActiveIdx(scrollTop, sectionIdx, height = vh()) {
  if (typeof document === 'undefined') return sectionIdx

  const scroller = getScroller()
  const projects = document.querySelector('[data-snap-anchor="projects"]')
  const projectsTop = projects ? getElementScrollTop(projects, scroller) : Infinity
  if (projects && scrollTop >= projectsTop - height * 0.2) {
    const skills = document.querySelector('[data-snap-anchor="skills"]')
    const skillsTop = skills ? getElementScrollTop(skills, scroller) : Infinity
    if (scrollTop < skillsTop - height * 0.35) {
      return Math.max(sectionIdx, SECTION.PROJECTS)
    }
  }

  return sectionIdx
}

export { vh as getViewportHeight }
