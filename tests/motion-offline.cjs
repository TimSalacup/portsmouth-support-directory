// Actual DOM helpers/CSS in isolated fixtures; not a full React or downloaded-font render.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright')
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict')
const root=path.join(__dirname,'..'),css=fs.readFileSync(path.join(root,'src/index.css'),'utf8').replace('@import "tailwindcss";','')
const moduleSource=fs.readFileSync(path.join(root,'src/layout-motion.mjs'),'utf8').replace(/^export /gm,'')+'\nwindow.motionAPI={matchDetailHeight,attachCategoryReveals,attachHeaderParallax};'
const header=`<header class="directory-header"><div class="practice-fan"><div class="practice-parallax"><div class="practice-entry practice-entry--rear"><div class="practice-card practice-card--rear"></div></div><div class="practice-entry practice-entry--front"><div class="practice-card practice-card--front"></div></div></div></div><div class="header-heading-motion"><h1><span class="portsmouth-word">Portsmouth</span> <span>Support Directory</span></h1></div><svg class="section-wave"></svg></header>`
;(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});try{const page=await b.newPage()
for(const [width,height] of [[320,568],[390,844],[800,360],[1023,768],[1024,768],[1440,900],[1920,1080]]){
 await page.setViewportSize({width,height});await page.setContent(`<style>*{box-sizing:border-box}${css}</style>${header}`)
 await page.evaluate(()=>document.getAnimations().forEach(a=>{if(a.effect.getTiming().iterations!==Infinity)a.finish()}))
 for(const state of ['idle','hover']){
  if(state==='hover'){await page.locator('.practice-fan').hover();await page.evaluate(()=>document.getAnimations().forEach(a=>{if(a.effect.getTiming().iterations!==Infinity)a.finish()}))}
  const r=await page.evaluate(()=>{const header=document.querySelector('header').getBoundingClientRect(),title=document.querySelector('h1').getBoundingClientRect(),fan=document.querySelector('.practice-fan').getBoundingClientRect(),wave=document.querySelector('.section-wave').getBoundingClientRect(),cards=[...document.querySelectorAll('.practice-card')].map(c=>c.getBoundingClientRect());return {overlap:cards.some(c=>c.bottom>title.top&&c.top<title.bottom&&c.right>title.left&&c.left<title.right),clipped:cards.some(c=>c.left<0||c.right>innerWidth||c.top<header.top||c.bottom>wave.top),overflow:document.documentElement.scrollWidth>innerWidth,stacked:fan.top>title.bottom,center:Math.abs((fan.left+fan.right)/2-innerWidth/2),fontRatio:parseFloat(getComputedStyle(document.querySelector('.portsmouth-word')).fontSize)/parseFloat(getComputedStyle(document.querySelector('h1')).fontSize)}})
  assert.ok(!r.overlap&&!r.clipped&&!r.overflow,JSON.stringify({width,height,state,r}));assert.ok(Math.abs(r.fontRatio-Math.min(64,width*.12)/Math.min(96,Math.max(22,width*.055)))<.01)
  if(width<1024)assert.ok(r.stacked&&r.center<1,JSON.stringify(r))
 }
 console.log('PASS responsive header',width,height)
}
for(const width of [1023,1024,1440]){
 await page.setViewportSize({width,height:900});await page.setContent(`<style>*{box-sizing:border-box}${css}</style><button id="card" style="width:300px;height:370px">Selected</button><section id="detail" class="category-detail" style="height:250px"><div class="segment-window"><div class="segment-pane"><div class="segment-scroll">${'Long text '.repeat(400)}</div></div></div><button>Return</button></section>`);await page.addScriptTag({content:moduleSource})
 await page.evaluate(()=>{window.stopMatch=motionAPI.matchDetailHeight(document.querySelector('#card'),document.querySelector('#detail'))})
 for(const height of [370,430]){await page.evaluate(h=>document.querySelector('#card').style.height=h+'px',height);await page.waitForTimeout(40);const measured=await page.evaluate(()=>document.querySelector('#detail').getBoundingClientRect().height);assert.ok(Math.abs(measured-(width>=1024?height:250))<.1)}
 await page.evaluate(()=>stopMatch());assert.equal(await page.locator('#detail').evaluate(e=>e.style.height),'250px');console.log('PASS live equal-height binding and cleanup',width)
}
await page.setViewportSize({width:900,height:600});await page.setContent(`<style>*{box-sizing:border-box}${css}</style>${header}<main id="grid"><div style="height:800px"></div><div class="category-reveal"><button>Category</button></div><div style="height:1200px"></div></main>`);await page.addScriptTag({content:moduleSource})
await page.evaluate(()=>{window.stopReveal=motionAPI.attachCategoryReveals(document.querySelector('#grid'));window.stopParallax=motionAPI.attachHeaderParallax(document.querySelector('header'))});await page.waitForTimeout(50)
assert.equal(await page.locator('.category-reveal').evaluate(e=>e.classList.contains('reveal-ready')),true)
await page.locator('.category-reveal').scrollIntoViewIfNeeded();await page.waitForTimeout(60);assert.equal(await page.locator('.category-reveal').evaluate(e=>e.classList.contains('is-revealed')),true)
await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(50);await page.locator('.category-reveal').scrollIntoViewIfNeeded();await page.waitForTimeout(50);assert.equal(await page.locator('.category-reveal').evaluate(e=>e.classList.contains('reveal-ready')),false)
console.log('PASS first-entry reveal does not replay')
await page.evaluate(()=>scrollTo(0,120));await page.waitForTimeout(80);const before=await page.locator('header').evaluate(e=>e.style.getPropertyValue('--fan-parallax'));assert.ok(parseFloat(before)>0)
await page.evaluate(()=>scrollTo(0,1900));await page.waitForTimeout(80);const off=await page.locator('header').evaluate(e=>e.style.getPropertyValue('--fan-parallax'));await page.evaluate(()=>scrollTo(0,2100));await page.waitForTimeout(50);assert.equal(await page.locator('header').evaluate(e=>e.style.getPropertyValue('--fan-parallax')),off)
await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(40);assert.equal(await page.locator('header').evaluate(e=>e.style.getPropertyValue('--fan-parallax')),'0px');await page.evaluate(()=>{stopReveal();stopParallax()})
console.log('PASS offscreen parallax suspension and reduced-motion reset')
await page.setContent('<main><div class="category-reveal"><button>Visible fallback</button></div></main>');await page.addScriptTag({content:moduleSource});const fallback=await page.evaluate(()=>{delete window.IntersectionObserver;motionAPI.attachCategoryReveals(document.querySelector('main'));return document.querySelector('.category-reveal').className});assert.equal(fallback,'category-reveal');console.log('PASS no-IntersectionObserver visible fallback')
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1})
