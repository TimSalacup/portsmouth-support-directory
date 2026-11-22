import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { attachSegmentNavigation } from './segment-navigation.mjs'
import { canLinkContact, CRISIS_SOURCE_NOTE } from './verbatim-content.mjs'

function SegmentContent({ segment, category, headingRef }) {
  return <><article className="segment-content">
    <h2 ref={headingRef} tabIndex={-1}>{segment?.title || category}</h2>
    {segment?.description && <p className="segment-description">{segment.description}</p>}
    {segment?.contacts?.length > 0 && <div className="segment-contact-block"><h3 className="segment-contact-heading">Contact details</h3><ul className="segment-contacts">{segment.contacts.map((contact, i) => <li key={`${contact.label}-${i}`}>
      {canLinkContact(category, contact) ? <a href={contact.href}>{contact.label}</a> : <span>{contact.label}</span>}
    </li>)}</ul></div>}
  </article>
    {category === 'Mental Health in Crisis' && <aside className="crisis-source-note">{CRISIS_SOURCE_NOTE}</aside>}
  </>
}

export default function DetailPanel({ category, segments, close, active }) {
  const [index, setIndex] = useState(0)
  const [slide, setSlide] = useState(null)
  const windowRef = useRef(null)
  const viewport = useRef(null)
  const heading = useRef(null)
  const latestIndex = useRef(0)
  const sliding = useRef(false)
  const lastStep = useRef(-Infinity)
  const [edges, setEdges] = useState({ top: false, bottom: false })
  const step = direction => {
    if (!active || sliding.current || performance.now() - lastStep.current < 440) return
    const next = Math.max(0, Math.min(segments.length - 1, latestIndex.current + direction))
    if (next === latestIndex.current || next < 0) return
    lastStep.current = performance.now()
    // A stable focus target survives arrow hiding and outgoing content replacement.
    windowRef.current?.focus({ preventScroll: true })
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      latestIndex.current = next
      setIndex(next)
    } else {
      sliding.current = true
      setSlide({ next, direction: Math.sign(direction) })
    }
  }
  const stepRef = useRef(step)
  useEffect(() => { stepRef.current = step })
  useEffect(() => {
    if (active) return attachSegmentNavigation(viewport.current, direction => stepRef.current(direction),
      { eventTarget: windowRef.current, isBlocked: () => sliding.current })
  }, [active])
  useEffect(() => {
    if (!slide) return
    const finish = () => {
      latestIndex.current = slide.next
      sliding.current = false
      setIndex(slide.next)
      setSlide(null)
    }
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMotionChange = () => { if (motion.matches) finish() }
    const timer = window.setTimeout(finish, motion.matches ? 0 : 440)
    motion.addEventListener('change', onMotionChange)
    return () => { clearTimeout(timer); motion.removeEventListener('change', onMotionChange) }
  }, [slide])
  useLayoutEffect(() => {
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
      <div ref={windowRef} tabIndex={-1} aria-label={`${category} segment transition`}
        className={`segment-window ${slide ? 'is-sliding' : ''} ${edges.top || slide ? 'has-content-above' : ''} ${edges.bottom || slide ? 'has-content-below' : ''}`}
        style={{ '--slide-direction': slide?.direction || 1 }}>
        <div className={`segment-pane ${slide ? 'segment-pane--out' : ''}`}>
          <div className="segment-scroll" ref={viewport} tabIndex={slide ? -1 : 0} aria-label={`${category} details`}>
            <div inert={Boolean(slide) || undefined} aria-hidden={Boolean(slide) || undefined}>
              <SegmentContent segment={segments[index]} category={category} headingRef={heading} />
            </div>
          </div>
        </div>
        {slide && <div className="segment-pane segment-pane--in" aria-hidden="true" inert>
          <div className="segment-scroll"><SegmentContent segment={segments[slide.next]} category={category} /></div>
        </div>}
      </div>
      <div className="detail-controls">
        <button type="button" className="return-button" onClick={close}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m10 5-7 7 7 7M3 12h18" /></svg>Return
        </button>
      </div>
      <button type="button" className="previous-segment segment-arrow" hidden={index === 0} aria-disabled={Boolean(slide)} onClick={() => step(-1)} aria-label="Previous segment">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m5 15 7-7 7 7" /></svg>
      </button>
      <button type="button" className="next-segment segment-arrow" hidden={index >= segments.length - 1} aria-disabled={Boolean(slide)} onClick={() => step(1)} aria-label="Next segment">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m5 9 7 7 7-7" /></svg>
      </button>
    </>
  )
}
