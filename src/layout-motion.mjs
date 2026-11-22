export function matchDetailHeight(card, detail) {
  const media = window.matchMedia('(min-width: 1024px)')
  const previous = detail.style.height
  const update = () => { detail.style.height = media.matches ? `${card.getBoundingClientRect().height}px` : previous }
  const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(update) : null
  observer?.observe(card)
  media.addEventListener('change', update)
  window.addEventListener('resize', update)
  update()
  return () => { observer?.disconnect(); media.removeEventListener('change', update); window.removeEventListener('resize', update); detail.style.height = previous }
}

const revealed = new WeakSet()
export function attachCategoryReveals(container) {
  const items = [...container.querySelectorAll('.category-reveal')]
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  if (!('IntersectionObserver' in window)) return () => {}
  const show = item => { revealed.add(item); item.classList.add('is-revealed'); item.classList.remove('reveal-ready') }
  const targets = new Map(items.map(item => [item.closest('.category-slot') || item, item]))
  const targetFor = item => item.closest('.category-slot') || item
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      // The initial observer callback can be intersecting below its threshold.
      if (entry.isIntersecting && entry.intersectionRatio >= .5) {
        const item = targets.get(entry.target)
        if (item) show(item)
        observer.unobserve(entry.target)
      }
    }
  }, { threshold: .5 })
  for (const item of items) {
    if (motion.matches || revealed.has(item)) show(item)
    else { item.classList.add('reveal-ready'); observer.observe(targetFor(item)) }
  }
  const onFocus = event => { const item = event.target.closest('.category-reveal'); if (item) { show(item); observer.unobserve(targetFor(item)) } }
  const onMotion = () => { if (motion.matches) { items.forEach(show); observer.disconnect() } }
  container.addEventListener('focusin', onFocus)
  motion.addEventListener('change', onMotion)
  return () => { observer.disconnect(); container.removeEventListener('focusin', onFocus); motion.removeEventListener('change', onMotion); items.forEach(item => item.classList.remove('reveal-ready')) }
}

export function attachHeaderParallax(header) {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  if (!('IntersectionObserver' in window)) return () => {}
  let visible = false
  let listening = false
  let frame = 0
  const reset = () => { header.style.setProperty('--heading-parallax', '0px'); header.style.setProperty('--fan-parallax', '0px') }
  const update = () => {
    frame = 0
    if (!visible || motion.matches) return
    const bounds = header.getBoundingClientRect()
    const progress = Math.max(0, Math.min(1, -bounds.top / Math.max(1, bounds.height)))
    header.style.setProperty('--heading-parallax', `${progress * 40}px`)
    header.style.setProperty('--fan-parallax', `${progress * 64}px`)
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
  const configure = () => {
    if (visible && !motion.matches) {
      if (!listening) window.addEventListener('scroll', schedule, { passive: true })
      listening = true
      schedule()
    } else {
      window.removeEventListener('scroll', schedule); listening = false
      cancelAnimationFrame(frame); frame = 0
      if (motion.matches) reset()
    }
  }
  const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; configure() })
  observer.observe(header)
  motion.addEventListener('change', configure)
  return () => { observer.disconnect(); motion.removeEventListener('change', configure); window.removeEventListener('scroll', schedule); cancelAnimationFrame(frame); reset() }
}
