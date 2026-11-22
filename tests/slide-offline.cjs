// Isolated tests of the actual CSS/DOM behavior, not a full React render.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const fs = require('node:fs')
const path = require('node:path')
const assert = require('node:assert/strict')
const root = path.join(__dirname, '..')
const css = fs.readFileSync(path.join(root,'src/index.css'),'utf8').replace('@import "tailwindcss";','')
;(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']})
 try {
 const page=await browser.newPage({viewport:{width:1000,height:800}})
 for(const direction of [1,-1]) {
  await page.setContent(`<style>*{box-sizing:border-box}${css}.fixture{margin:100px;width:500px;height:300px;flex:none}</style><div tabindex="-1" class="segment-window fixture is-sliding" style="--slide-direction:${direction}"><div class="segment-pane segment-pane--out"><div class="segment-scroll"><article class="segment-content"><h2>Outgoing</h2><p>Visible outgoing text</p></article></div></div><div class="segment-pane segment-pane--in"><div class="segment-scroll"><article class="segment-content"><h2>Incoming</h2><p>Visible incoming text</p></article></div></div></div>`)
  const measurements=await page.evaluate(async()=>{
   const windowElement=document.querySelector('.segment-window'),out=document.querySelector('.segment-pane--out'),incoming=document.querySelector('.segment-pane--in')
   const animations=[...out.getAnimations(),...incoming.getAnimations()]
   await Promise.all(animations.map(a=>a.ready));animations.forEach(a=>{a.pause();a.currentTime=110})
   const wr=windowElement.getBoundingClientRect(),or=out.getBoundingClientRect(),ir=incoming.getBoundingClientRect()
   const middle={out:or.top-wr.top,in:ir.top-wr.top,height:wr.height,clip:getComputedStyle(windowElement).overflow,opacity:getComputedStyle(incoming).opacity}
   animations.forEach(a=>{a.currentTime=440})
   return {middle,settled:incoming.getBoundingClientRect().top-wr.top,outside:Math.abs(out.getBoundingClientRect().top-wr.top)}
  })
  const m=measurements.middle
  assert.equal(m.clip,'hidden');assert.equal(m.opacity,'1')
  assert.ok(m.out*direction<0&&m.in*direction>0,JSON.stringify(measurements))
  assert.ok(Math.abs(m.out)>5&&Math.abs(m.out)<m.height&&Math.abs(m.in)>5&&Math.abs(m.in)<m.height)
  assert.ok(Math.abs(Math.abs(m.in-m.out)-m.height)<1)
  assert.ok(Math.abs(measurements.settled)<1&&Math.abs(measurements.outside-m.height)<1)
  console.log('PASS two visible clipped panes, midpoint travel and exact stop, direction',direction)
 }
 await page.emulateMedia({reducedMotion:'reduce'})
 assert.equal(await page.locator('.segment-pane--in').evaluate(el=>getComputedStyle(el).animationName),'none')
 console.log('PASS reduced-motion removes pane travel')
 for(const [width,height]of [[320,568],[768,600],[1000,900],[1440,900],[800,360]]) {
  await page.setViewportSize({width,height});const mobile=width<640
  await page.setContent(`<style>*{box-sizing:border-box}.p-8{padding:32px}${css}</style><main class="directory-content"><div class="directory-grid has-selection is-open"><ul class="category-list"><li class="category-slot is-selected" style="grid-row:1;grid-column:1"><button class="category-card p-8"><span class="category-title">Mental Wellbeing Resources</span></button></li></ul><section class="category-detail is-visible" style="grid-row:${mobile?2:1};grid-column:${mobile?1:'2 / -1'}"><p class="segment-status">1 / 9</p><div class="segment-window" tabindex="-1"><div class="segment-pane"><div class="segment-scroll" tabindex="0"><article class="segment-content"><h2 tabindex="-1">Segment title</h2><p>${'Long content '.repeat(400)}</p><a href="#fixture-contact">Fixture contact</a></article></div></div></div><div class="detail-controls"><button class="return-button">Return</button></div><button class="previous-segment segment-arrow" aria-label="Previous segment"><svg></svg></button><button class="next-segment segment-arrow" aria-label="Next segment"><svg></svg></button></section></div></main><div style="height:1500px"></div>`)
  const geometry=await page.evaluate(()=>{
   let card=document.querySelector('.is-selected').getBoundingClientRect(),detail=document.querySelector('.category-detail').getBoundingClientRect()
   const mobile=innerWidth<640,rowTop=mobile?card.top:Math.min(card.top,detail.top-52),rowBottom=Math.max(card.bottom,detail.bottom+52)
   window.scrollTo(0,scrollY+rowTop-Math.max(12,(innerHeight-(rowBottom-rowTop))/2))
   card=document.querySelector('.is-selected').getBoundingClientRect();detail=document.querySelector('.category-detail').getBoundingClientRect()
   const up=document.querySelector('.previous-segment').getBoundingClientRect(),down=document.querySelector('.next-segment').getBoundingClientRect(),scroller=document.querySelector('.segment-scroll')
   return {centerDifference:Math.abs((card.top+card.bottom)/2-(detail.top+detail.bottom)/2),upVisible:up.top>=0,downVisible:down.bottom<=innerHeight,noOverlap:mobile?card.bottom<=up.top:card.right<=detail.left,scrollable:scroller.scrollHeight>scroller.clientHeight&&scroller.clientHeight>40,noHorizontal:document.documentElement.scrollWidth<=innerWidth}
  })
  assert.ok(geometry.upVisible&&geometry.downVisible&&geometry.noOverlap&&geometry.scrollable&&geometry.noHorizontal,JSON.stringify({width,height,geometry}))
  if(width>=640&&width<1024)assert.ok(geometry.centerDifference<1,JSON.stringify(geometry))
  // Verify the stable-focus sequence when a now-unavailable arrow is hidden.
  const focus=await page.evaluate(()=>{const arrow=document.querySelector('.previous-segment'),shell=document.querySelector('.segment-window'),heading=document.querySelector('h2');arrow.focus();shell.focus({preventScroll:true});arrow.hidden=true;const stable=document.activeElement===shell;heading.focus({preventScroll:true});return {stable,heading:document.activeElement===heading,hidden:getComputedStyle(arrow).display==='none'}})
  assert.ok(focus.stable&&focus.heading&&focus.hidden)
  console.log('PASS responsive alignment, arrows, overflow and DOM focus sequence',width,height)
 }
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1})
