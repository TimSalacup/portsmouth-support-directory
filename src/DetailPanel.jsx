import { useEffect, useRef, useState } from 'react'
import { attachSegmentNavigation } from './segment-navigation.mjs'

export default function DetailPanel({ category, segments, close, active }) {
  const [index, setIndex] = useState(0)
  const viewport = useRef(null)
  const heading = useRef(null)
  const latestIndex = useRef(0)
  const lastStep = useRef(-Infinity)
  const [edges, setEdges] = useState({ top: false, bottom: false })
  const segment = segments[index]
  const step = direction => {
    if (performance.now() - lastStep.current < 400) return
    const next = Math.max(0, Math.min(segments.length - 1, latestIndex.current + direction))
    if (next === latestIndex.current || next < 0) return
    lastStep.current = performance.now()
    latestIndex.current = next
    setIndex(next)
  }
  const stepRef = useRef(step)
  useEffect(() => { stepRef.current = step })
  useEffect(() => {
    if (active) return attachSegmentNavigation(viewport.current, direction => stepRef.current(direction))
  }, [active])
  useEffect(() => {
    if (!active) return
    const element = viewport.current
    element.scrollTo({ top: 0, behavior: 'instant' })
    heading.current?.focus({ preventScroll: true })
    const update = () => setEdges({ top: element.scrollTop > 2, bottom: element.scrollTop + element.clientHeight < element.scrollHeight - 2 })
    const observer = new ResizeObserver(update)
    observer.observe(element)
    if (element.firstElementChild) observer.observe(element.firstElementChild)
    element.addEventListener('scroll', update, { passive: true })
    const frame = requestAnimationFrame(update)
    return () => { cancelAnimationFrame(frame); observer.disconnect(); element.removeEventListener('scroll', update) }
  }, [index, active])
  return (
    <>
      <p className="segment-status" aria-live="polite" aria-atomic="true">{category}{segments.length > 1 ? ` · ${index + 1} / ${segments.length}` : ''}</p>
      <div className={`segment-window ${edges.top ? 'has-content-above' : ''} ${edges.bottom ? 'has-content-below' : ''}`}>
        <div className="segment-scroll" ref={viewport} tabIndex={0} aria-label={`${category} details`}>
          <article key={index} className="segment-content">
            <h2 ref={heading} tabIndex={-1}>{segment?.title || category}</h2>
            {segment?.description && <p className="segment-description">{segment.description}</p>}
            {segment?.contacts?.length > 0 && <ul className="segment-contacts">{segment.contacts.map((contact, i) => <li key={`${contact.label}-${i}`}>
              {contact.href ? <a href={contact.href}>{contact.label}</a> : <span>{contact.label}</span>}
            </li>)}</ul>}
          </article>
        </div>
      </div>
      <div className="detail-controls">
        {index > 0 && <button type="button" className="previous-segment" onClick={() => step(-1)}>Previous</button>}
        <button type="button" className="return-button" onClick={close}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m10 5-7 7 7 7M3 12h18" /></svg>Return
        </button>
      </div>
      {index < segments.length - 1 && <button type="button" className="next-segment" onClick={() => step(1)} aria-label="Next segment">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m5 9 7 7 7-7" /></svg>
      </button>}
    </>
  )
}
