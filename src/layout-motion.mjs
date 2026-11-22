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
    const offset = Math.max(0, -bounds.top) / 4
    header.style.setProperty('--heading-parallax', `${offset}px`)
    header.style.setProperty('--fan-parallax', `${offset}px`)
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

// Fit the actual font metrics after loading; keep positioning separate from motion.
export function fitHeaderComposition(header) {
  const word = header.querySelector('.portsmouth-word')
  const fan = header.querySelector('.practice-fan')
  const context = document.createElement('canvas').getContext('2d')
  const originalSize = word.style.fontSize
  let alive = true
  let frame = 0
  const update = () => {
    frame = 0
    if (!alive) return
    word.style.fontSize = originalSize
    const headerStyle = getComputedStyle(header)
    const style = getComputedStyle(word)
    const size = parseFloat(style.fontSize)
    const available = Math.max(1, header.clientWidth - parseFloat(headerStyle.paddingLeft) - parseFloat(headerStyle.paddingRight) - 16)
    let textWidth = word.scrollWidth
    if (context) {
      context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
      const metrics = context.measureText(word.textContent)
      const spacing = parseFloat(style.letterSpacing) || 0
      textWidth = Math.max(metrics.width, metrics.width + 2 * Math.max(0, metrics.actualBoundingBoxLeft || 0), 2 * (metrics.actualBoundingBoxRight || metrics.width) - metrics.width) + spacing * Math.max(0, word.textContent.length - 1)
    }
    word.style.fontSize = `${Math.min(size, size * available / Math.max(1, textWidth))}px`
    const width = fan.offsetWidth, height = fan.offsetHeight
    let extent = width / 2
    for (const angle of [-17, -10, 7, 13]) {
      const radians = angle * Math.PI / 180
      for (const x of [0, width]) for (const y of [0, height]) {
        const rotatedX = .2 * width + (x - .2 * width) * Math.cos(radians) - (y - .9 * height) * Math.sin(radians)
        extent = Math.max(extent, rotatedX - width / 2)
      }
    }
    header.style.setProperty('--fan-safe-center', `${header.clientWidth - extent - 16}px`)
  }
  const schedule = () => { if (alive && !frame) frame = requestAnimationFrame(update) }
  const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null
  observer?.observe(header)
  observer?.observe(fan)
  window.addEventListener('resize', schedule)
  document.fonts?.addEventListener('loadingdone', schedule)
  document.fonts?.ready.then(schedule)
  update()
  return () => {
    alive = false; cancelAnimationFrame(frame); observer?.disconnect()
    window.removeEventListener('resize', schedule)
    document.fonts?.removeEventListener('loadingdone', schedule)
    word.style.fontSize = originalSize
    header.style.removeProperty('--fan-safe-center')
  }
}
