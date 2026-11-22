// Isolated DOM/CSS checks, not a full React render. Install Playwright or set PLAYWRIGHT_MODULE.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const fs = require('node:fs')
const path = require('node:path')
const assert = require('node:assert/strict')
const root = path.join(__dirname, '..')
;(async () => {
 const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] })
 try {
 const page = await browser.newPage({ viewport: { width: 1000, height: 700 }, reducedMotion: 'reduce' })
 await page.setContent('<style>*{box-sizing:border-box}body{margin:0}#panel{height:160px;overflow:auto}#long{height:1000px}</style><div style="height:400px"></div><div id="panel" tabindex="0"><div id="record">Short record</div></div><button id="return">Return</button><div style="height:1500px"></div>')
 const module = fs.readFileSync(path.join(root, 'src/segment-navigation.mjs'), 'utf8').replace(/^export /gm, '')
 await page.addScriptTag({ content: module + '\nwindow.api={attachSegmentNavigation,lockDocumentScroll};' })
 const result = await page.evaluate(async () => {
  const panel = document.getElementById('panel')
  let steps = 0
  const cleanup = window.api.attachSegmentNavigation(panel, n => { steps += n })
  const wheel = delta => { const e = new WheelEvent('wheel', {deltaY:delta,bubbles:true,cancelable:true});panel.dispatchEvent(e);return e.defaultPrevented }
  const assertions=[]
  assertions.push(wheel(120) && steps===1)
  document.getElementById('record').style.height='1000px'
  assertions.push(wheel(100) && steps===1) // momentum blocked even when new record can scroll
  await new Promise(r=>setTimeout(r,760))
  assertions.push(!wheel(100) && steps===1)
  panel.scrollTop=panel.scrollHeight
  assertions.push(wheel(100) && steps===1) // same gesture cannot leave a long record
  await new Promise(r=>setTimeout(r,760))
  assertions.push(wheel(100) && steps===2)
  panel.scrollTop=0
  panel.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true,cancelable:true}))
  assertions.push(steps===1)
  panel.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',repeat:true,bubbles:true,cancelable:true}))
  assertions.push(steps===1)
  const touch=(type,y)=>{const event=new Event(type,{bubbles:true,cancelable:true});Object.defineProperties(event,{touches:{value:type==='touchend'?[]:[{clientY:y,clientX:50}]},changedTouches:{value:[{clientY:y,clientX:50}]}});panel.dispatchEvent(event)}
  touch('touchstart',50);touch('touchend',140);assertions.push(steps===0)
  touch('touchstart',50);touch('touchcancel',140);assertions.push(steps===0)
  cleanup();wheel(120);assertions.push(steps===0)
  window.scrollTo(0,300)
  const oldBody=document.body.getAttribute('style'), oldRoot=document.documentElement.getAttribute('style')
  const before=panel.getBoundingClientRect();const release=window.api.lockDocumentScroll()
  const locked=panel.getBoundingClientRect()
  assertions.push(document.body.style.position==='fixed' && Math.abs(before.left-locked.left)<1 && Math.abs(before.top-locked.top)<1)
  release();release()
  assertions.push((document.body.getAttribute('style')||'')===(oldBody||'') && (document.documentElement.getAttribute('style')||'')===(oldRoot||'') && window.scrollY===300)
  return { assertions, lockState: {body:document.body.getAttribute('style'),root:document.documentElement.getAttribute('style'),y:window.scrollY,oldBody,oldRoot} }
 })
 assert.ok(result.assertions.every(Boolean), JSON.stringify(result))
 console.log('PASS actual DOM modules: wheel, momentum, overflow, keyboard, touch/cancel, listener cleanup, scroll-lock geometry and idempotent restoration')
 const css=fs.readFileSync(path.join(root,'src/index.css'),'utf8').replace('@import "tailwindcss";','')
 for(const [width,height] of [[320,568],[390,844],[768,600],[1440,900],[800,360]]) {
  await page.setViewportSize({width,height})
  const mobile=width<640
  await page.setContent(`<style>*{box-sizing:border-box}.p-8{padding:32px}.rounded-2xl{border-radius:16px}${css}</style><main class="directory-content"><div class="directory-grid has-selection is-open"><ul class="category-list"><li class="category-slot is-selected" style="grid-row:1;grid-column:1"><button class="category-card p-8"><span class="category-title">Mental Wellbeing Resources</span></button></li></ul><section class="category-detail is-visible" style="grid-row:${mobile?2:1};grid-column:${mobile?1:'2 / -1'}"><p class="segment-status">Mental Wellbeing Resources · 1 / 9</p><div class="segment-window has-content-below"><div class="segment-scroll" tabindex="0"><article class="segment-content"><h2>Long record</h2><p>${'Long content '.repeat(400)}</p><a href="#contact">Contact</a></article></div></div><div class="detail-controls"><button class="previous-segment">Previous</button><button class="return-button">Return</button></div><button class="next-segment">Next</button></section></div></main><div style="height:1500px"></div>`)
  const geometry=await page.evaluate(()=>{const card=document.querySelector('.is-selected').getBoundingClientRect(),detail=document.querySelector('.category-detail').getBoundingClientRect();const mobile=innerWidth<640;const total=mobile?card.height+24+detail.height+48:Math.max(card.height,detail.height+48);window.scrollTo(0,scrollY+card.top-Math.max(12,(innerHeight-total)/2));const button=document.querySelector('.return-button').getBoundingClientRect(),next=document.querySelector('.next-segment').getBoundingClientRect(),scroller=document.querySelector('.segment-scroll');return {fits:button.bottom<=innerHeight&&button.top>=0&&next.bottom<=innerHeight,scrolls:scroller.scrollHeight>scroller.clientHeight&&scroller.clientHeight>40,noHorizontal:document.documentElement.scrollWidth<=innerWidth}})
  assert.ok(geometry.fits&&geometry.scrolls&&geometry.noHorizontal,JSON.stringify({width,height,geometry}))
  console.log('PASS isolated actual CSS: controls visible and long record scrollable',width,height)
 }
 } finally { await browser.close() }
})().catch(error=>{console.error(error);process.exitCode=1})
