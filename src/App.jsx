import { matchDetailHeight, attachCategoryReveals, attachHeaderParallax, fitHeaderComposition } from './layout-motion.mjs'
import DetailPanel from './DetailPanel.jsx'
import directoryData from './directory-data.json'
import { lockDocumentScroll } from './segment-navigation.mjs'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import practicePhoto from './assets/portsdown.webp'
import { columnsForWidth, categoryPosition } from './directory-layout.mjs'
import categoryImage1 from './assets/categories/mental-wellbeing-resources.webp'
import categoryImage2 from './assets/categories/veterans-support.webp'
import categoryImage3 from './assets/categories/elderly-support.webp'
import categoryImage4 from './assets/categories/relationship-support.webp'
import categoryImage5 from './assets/categories/bereavement.webp'
import categoryImage6 from './assets/categories/citizens-advice.webp'
import categoryImage7 from './assets/categories/domestic-abuse-and-rape.webp'
import categoryImage8 from './assets/categories/drugs-and-substance-abuse.webp'
import categoryImage9 from './assets/categories/end-of-life-support.webp'
import categoryImage10 from './assets/categories/paediatrics.webp'
import categoryImage11 from './assets/categories/mental-health-in-crisis.webp'
import categoryImage12 from './assets/categories/other-resources.webp'

const categories = [
  { title: "Mental Wellbeing Resources", image: categoryImage1 },
  { title: "Veterans Support", image: categoryImage2 },
  { title: "Elderly Support", image: categoryImage3 },
  { title: "Relationship Support", image: categoryImage4 },
  { title: "Bereavement", image: categoryImage5 },
  { title: "Citizens Advice", image: categoryImage6 },
  { title: "Domestic Abuse and Rape", image: categoryImage7 },
  { title: "Drugs and Substance Abuse", image: categoryImage8 },
  { title: "End of Life Support", image: categoryImage9 },
  { title: "Paediatrics", image: categoryImage10 },
  { title: "Mental Health in Crisis", image: categoryImage11 },
  { title: "Other Resources", image: categoryImage12 }
]

export default function App() {
  const [columns, setColumns] = useState(() => columnsForWidth(window.innerWidth))
  const [selection, setSelection] = useState(null)
  const gridRef = useRef(null)
  const headerRef = useRef(null)
  const triggers = useRef([])
  const detailRegion = useRef(null)
  const originalScroll = useRef(0)
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const close = useCallback(() => {
    setSelection(current => current && current.phase !== 'closing'
      ? { ...current, phase: 'closing' } : current)
  }, [])

  useEffect(() => {
    const resize = () => { setColumns(columnsForWidth(window.innerWidth)); close() }
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [close])

  useEffect(() => {
    if (!selection) return
    const onKeyDown = event => {
      if (event.key === 'Escape') { event.preventDefault(); close() }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selection, close])

  useEffect(() => {
    if (!selection) return
    const { index, phase } = selection
    const delay = reducedMotion() ? 0 : 440
    if (phase === 'open') return
    const timer = window.setTimeout(() => {
      if (phase === 'opening') {
        setSelection({ index, phase: 'open' })
      } else if (phase === 'closing') {
        triggers.current[index]?.focus({ preventScroll: true })
        window.scrollTo({ top: originalScroll.current, behavior: reducedMotion() ? 'instant' : 'smooth' })
        setSelection(null)
      }
    }, delay)
    return () => clearTimeout(timer)
  }, [selection, columns])

  useEffect(() => {
    if (!selection || selection.phase !== 'opening') return
    const frame = requestAnimationFrame(() => {
      const card = triggers.current[selection.index]?.getBoundingClientRect()
      if (!card) return
      const top = window.scrollY + card.top - Math.max(24, (window.innerHeight - card.height) / 2)
      window.scrollTo({ top: Math.max(0, top), behavior: reducedMotion() ? 'instant' : 'smooth' })
    })
    return () => cancelAnimationFrame(frame)
  }, [columns, selection])

  useEffect(() => {
    if (selection?.phase !== 'open') return
    const card = triggers.current[selection.index]?.getBoundingClientRect()
    const detail = detailRegion.current?.getBoundingClientRect()
    if (!card || !detail) return
    const rowTop = columns === 1 ? card.top : Math.min(card.top, detail.top - 52)
    const rowBottom = Math.max(card.bottom, detail.bottom + 52)
    const rowHeight = rowBottom - rowTop
    const top = window.scrollY + rowTop - Math.max(12, (window.innerHeight - rowHeight) / 2)
    window.scrollTo({ top: Math.max(0, top), behavior: 'instant' })
    return lockDocumentScroll()
  }, [selection, columns])

  useEffect(() => {
    const stopHeader = attachHeaderParallax(headerRef.current)
    const stopReveals = attachCategoryReveals(gridRef.current)
    return () => { stopHeader(); stopReveals() }
  }, [])

  useLayoutEffect(() => fitHeaderComposition(headerRef.current), [])

  useLayoutEffect(() => {
    if (!selection || !detailRegion.current || !triggers.current[selection.index]) return
    return matchDetailHeight(triggers.current[selection.index], detailRegion.current)
  }, [selection, columns])

  const open = index => {
    if (selection) return
    originalScroll.current = window.scrollY
    setSelection({ index, phase: 'opening' })
  }
  const selectedIndex = selection?.index ?? null
  const closing = selection?.phase === 'closing'
  const selectedRow = selectedIndex === null ? null : Math.floor(selectedIndex / columns) + 1

  return (
    <>
      <header ref={headerRef} className="directory-header">
        <div className="practice-fan" aria-hidden="true">
          <div className="practice-parallax">
            <div className="practice-entry practice-entry--rear"><div className="practice-card practice-card--rear" /></div>
            <div className="practice-entry practice-entry--front"><div className="practice-card practice-card--front"><img src={practicePhoto} alt="" /></div></div>
          </div>
        </div>
        <div className="header-heading-motion"><h1><span className="portsmouth-word">Portsmouth</span>{' '}<span>Support Directory</span></h1></div>
        <svg className="section-wave" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <path d="M0 44 C280 124 420 124 720 64 C1020 4 1160 4 1440 64 L1440 120 L0 120 Z" fill="white" />
        </svg>
      </header>
      <main className="directory-content">
        <div ref={gridRef} className={`directory-grid ${selection ? 'has-selection' : ''} ${closing ? 'is-closing' : ''} ${selection?.phase === 'open' ? 'is-open' : ''}`}>
          <ul aria-label="Support categories" className="category-list">
            {categories.map((category, index) => {
              const selected = selectedIndex === index
              const hidden = selectedIndex !== null && !selected
              const position = categoryPosition(index, columns, selectedIndex)
              return (
                <li key={category.title} className={`category-slot ${selected ? 'is-selected' : ''} ${hidden ? 'is-muted' : ''}`}
                  style={{ gridColumn: position.column, gridRow: position.row,
                    transform: selected && !closing ? `translateX(calc(-${position.column - 1} * (100% + 24px)))` : undefined }}
                  aria-hidden={hidden || undefined} inert={hidden || undefined}>
                  <div className="category-reveal">
                  <button ref={element => { triggers.current[index] = element }} type="button"
                    className="category-card rounded-2xl p-8" onClick={() => open(index)}
                    aria-expanded={selected} aria-controls={selected ? 'category-detail' : undefined}
                    aria-label={category.title} tabIndex={hidden ? -1 : 0}>
                    <img className="category-background" src={category.image} alt="" loading="lazy" decoding="async" />
                    <span className="category-title">{category.title}</span>
                    <span className="category-view" aria-hidden="true">
                      <svg className="click-pointer" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" focusable="false">
                        <path d="m8 8 4 12 2-5 5-2-11-5Z" />
                        <g className="click-rays"><path d="M8 2v2M2 8h2M3.5 3.5 5 5M12 3l-1 2M3 12l2-1" /></g>
                      </svg>
                      <span className="view-word">view</span>
                    </span>
                  </button>
                  </div>
                </li>
              )
            })}
          </ul>
          {selection && <section id="category-detail" ref={detailRegion} aria-label={categories[selectedIndex].title}
            className={`category-detail ${selection.phase === 'open' ? 'is-visible' : ''}`}
            style={{ gridColumn: columns === 1 ? 1 : `2 / ${columns + 1}`, gridRow: columns === 1 ? selectedRow + 1 : selectedRow }}
            inert={selection.phase !== 'open' || undefined} aria-hidden={selection.phase !== 'open' || undefined}>
            <DetailPanel key={selectedIndex} active={selection.phase === 'open'} category={categories[selectedIndex].title}
              segments={directoryData[categories[selectedIndex].title.toLowerCase().replace(/[^a-z0-9]+/g, '-')]} close={close} />
          </section>}
        </div>
      </main>
    </>
  )
}
