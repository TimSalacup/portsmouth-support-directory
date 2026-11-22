// One wheel gesture can scroll one segment OR change one segment, never both.
export function createWheelGate({ quietMs = 260, cooldownMs = 700, threshold = 48 } = {}) {
  let lastEvent = -Infinity
  let lastStep = -Infinity
  let used = false
  let total = 0
  let direction = 0
  let stepped = false
  return {
    blocks(time) { return stepped && time - lastEvent <= quietMs },
    feed(delta, time, canScroll) {
      if (time - lastEvent > quietMs) { used = false; total = 0; direction = 0; stepped = false }
      lastEvent = time
      if (canScroll) { used = true; return 0 }
      if (used || time - lastStep < cooldownMs) return 0
      const nextDirection = Math.sign(delta)
      if (nextDirection !== direction) total = 0
      direction = nextDirection
      total += Math.abs(delta)
      if (total < threshold || !direction) return 0
      used = true
      lastStep = time
      stepped = true
      return direction
    },
  }
}

export function attachSegmentNavigation(viewport, step, { eventTarget = viewport, isBlocked = () => false } = {}) {
  const gate = createWheelGate()
  const canScroll = direction => direction > 0
    ? viewport.scrollTop + viewport.clientHeight < viewport.scrollHeight - 2
    : viewport.scrollTop > 2
  const wheel = event => {
    if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientHeight : 1)
    const scrollable = canScroll(Math.sign(delta))
    const time = performance.now()
    const blocked = gate.blocks(time)
    const move = gate.feed(delta, time, scrollable)
    if (!scrollable || blocked || isBlocked()) event.preventDefault()
    if (move && !isBlocked()) step(move)
  }
  let touch = null
  const touchstart = event => {
    if (isBlocked() || event.touches.length !== 1) { touch = null; return }
    touch = { y: event.touches[0].clientY, x: event.touches[0].clientX, top: viewport.scrollTop,
      up: !canScroll(-1), down: !canScroll(1), moved: false }
  }
  const touchmove = event => {
    if (isBlocked()) { event.preventDefault(); return }
    if (!touch || event.touches.length !== 1) return
    if (Math.abs(viewport.scrollTop - touch.top) > 2) touch.moved = true
    const direction = Math.sign(touch.y - event.touches[0].clientY)
    if (!canScroll(direction)) event.preventDefault()
  }
  const touchend = event => {
    if (isBlocked() || !touch || !event.changedTouches.length) return
    const dy = touch.y - event.changedTouches[0].clientY
    const dx = touch.x - event.changedTouches[0].clientX
    if (!touch.moved && Math.abs(viewport.scrollTop - touch.top) < 3 && Math.abs(dy) >= 64 && Math.abs(dy) > Math.abs(dx) * 1.3
      && (dy > 0 ? touch.down : touch.up)) step(Math.sign(dy))
    touch = null
  }
  const keydown = event => {
    if (event.target.closest('a, button, input, textarea, select') || event.altKey || event.ctrlKey || event.metaKey) return
    const direction = ['ArrowDown', 'PageDown', ' '].includes(event.key) ? (event.shiftKey ? -1 : 1)
      : ['ArrowUp', 'PageUp'].includes(event.key) ? -1 : 0
    if (!direction) return
    event.preventDefault()
    if (event.repeat || isBlocked()) return
    if (canScroll(direction)) viewport.scrollBy({ top: direction * (event.key.startsWith('Arrow') ? 48 : viewport.clientHeight * .85), behavior: 'instant' })
    else step(direction)
  }
  const touchcancel = () => { touch = null }
  eventTarget.addEventListener('wheel', wheel, { passive: false })
  eventTarget.addEventListener('touchstart', touchstart, { passive: true })
  eventTarget.addEventListener('touchmove', touchmove, { passive: false })
  eventTarget.addEventListener('touchend', touchend)
  eventTarget.addEventListener('touchcancel', touchcancel)
  eventTarget.addEventListener('keydown', keydown)
  return () => {
    eventTarget.removeEventListener('wheel', wheel)
    eventTarget.removeEventListener('touchstart', touchstart)
    eventTarget.removeEventListener('touchmove', touchmove)
    eventTarget.removeEventListener('touchend', touchend)
    eventTarget.removeEventListener('touchcancel', touchcancel)
    eventTarget.removeEventListener('keydown', keydown)
  }
}

// Keep the existing content width when removing the document scrollbar.
export function lockDocumentScroll() {
  const body = document.body
  const root = document.documentElement
  const y = window.scrollY
  const x = window.scrollX
  const bodyStyle = body.getAttribute('style')
  const rootStyle = root.getAttribute('style')
  const scrollbar = window.innerWidth - root.clientWidth
  const padding = parseFloat(getComputedStyle(body).paddingRight) || 0
  Object.assign(body.style, { position: 'fixed', top: `-${y}px`, left: `-${x}px`, width: '100%',
    boxSizing: 'border-box', paddingRight: `${padding + scrollbar}px`, overflow: 'hidden' })
  root.style.overflow = 'hidden'
  let released = false
  return () => {
    if (released) return
    released = true
    if (bodyStyle === null) body.removeAttribute('style'); else body.setAttribute('style', bodyStyle)
    if (rootStyle === null) root.removeAttribute('style'); else root.setAttribute('style', rootStyle)
    window.scrollTo({ left: x, top: y, behavior: 'instant' })
  }
}
