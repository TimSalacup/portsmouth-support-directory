// Actual CSS/DOM helpers in a fixture, not a full React or downloaded-font render.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright')
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict')
const root=path.join(__dirname,'..'),css=fs.readFileSync(path.join(root,'src/index.css'),'utf8').replace('@import "tailwindcss";','')
const helpers=fs.readFileSync(path.join(root,'src/layout-motion.mjs'),'utf8').replace(/^export /gm,'')+'\nwindow.api={attachCategoryReveals,attachHeaderParallax};'
const header=fs.readFileSync(path.join(__dirname,'motion-offline.cjs'),'utf8').match(/const header=`([\s\S]*?)`/)[1]
;(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});try{const page=await b.newPage()
for(const [width,height]of [[320,568],[800,360],[1023,768],[1024,768],[1440,900],[1920,1080]]){
 await page.setViewportSize({width,height});await page.setContent(`<style>*{box-sizing:border-box}${css}</style>${header}`)
 const results=await page.evaluate(async()=>{
  const rear=document.querySelector('.practice-entry--rear'),front=document.querySelector('.practice-entry--front'),heading=document.querySelector('h1')
  const ra=rear.getAnimations()[0],fa=front.getAnimations()[0],ha=heading.getAnimations()[0]
  await Promise.all([ra.ready,fa.ready,ha.ready]);[ra,fa,ha].forEach(a=>a.pause())
  const timing={rear:ra.effect.getTiming(),front:fa.effect.getTiming(),heading:ha.effect.getTiming()}
  ra.currentTime=0;fa.currentTime=0;ha.currentTime=0
  const starts={rearBottom:rear.firstElementChild.getBoundingClientRect().bottom,frontLeft:front.firstElementChild.getBoundingClientRect().left}
  const opacities=[]
  for(const time of [0,250,500,1500,3000,3500]){ra.currentTime=time;fa.currentTime=time;opacities.push([getComputedStyle(rear).opacity,getComputedStyle(front).opacity,getComputedStyle(rear.firstElementChild).opacity,getComputedStyle(front.firstElementChild).opacity])}
  const rest={rear:getComputedStyle(rear).transform,front:getComputedStyle(front).transform}
  ha.currentTime=2000
  return {timing,starts,opacities,rest,font:getComputedStyle(document.querySelector('.portsmouth-word')).fontFamily}
 })
 assert.equal(results.timing.rear.duration,3000);assert.equal(results.timing.rear.delay,0)
 assert.equal(results.timing.front.duration,3000);assert.equal(results.timing.front.delay,500)
 assert.equal(results.timing.heading.duration,2000)
 assert.ok(results.starts.rearBottom<=0&&results.starts.frontLeft>=width,JSON.stringify({width,height,results}))
 assert.ok(results.opacities.flat().every(v=>v==='1'))
 assert.ok(results.font.includes('League Script'))
 assert.equal(results.rest.rear,'matrix(1, 0, 0, 1, 0, 0)');assert.equal(results.rest.front,'matrix(1, 0, 0, 1, 0, 0)')
 console.log('PASS true offscreen starts, full opacity, exact timings and resting composition',width,height)
}
await page.emulateMedia({reducedMotion:'reduce'})
assert.equal(await page.locator('.practice-entry--front').evaluate(e=>getComputedStyle(e).animationName),'none')
assert.equal(await page.locator('.practice-entry--rear').evaluate(e=>getComputedStyle(e).transform),'none')
console.log('PASS reduced-motion entrance bypass')
await page.emulateMedia({reducedMotion:'no-preference'})
await page.setContent('<main><div class="category-slot"><div class="category-reveal"><button>First</button></div></div><div class="category-slot"><div class="category-reveal"><button>Second</button></div></div></main>')
await page.addScriptTag({content:helpers})
const threshold=await page.evaluate(()=>{
 let callback,options,observed=[],unobserved=[]
 window.IntersectionObserver=class{constructor(cb,opt){callback=cb;options=opt}observe(target){observed.push(target)}unobserve(target){unobserved.push(target)}disconnect(){}}
 const stop=api.attachCategoryReveals(document.querySelector('main')),slots=[...document.querySelectorAll('.category-slot')],items=[...document.querySelectorAll('.category-reveal')]
 callback([{target:slots[0],isIntersecting:true,intersectionRatio:.01}]);const initial=items[0].classList.contains('reveal-ready')
 callback([{target:slots[0],isIntersecting:true,intersectionRatio:.49}]);const under=items[0].classList.contains('reveal-ready')
 callback([{target:slots[0],isIntersecting:true,intersectionRatio:.5}]);const reached=items[0].classList.contains('is-revealed')&&!items[0].classList.contains('reveal-ready')
 items[1].querySelector('button').focus();const focus=!items[1].classList.contains('reveal-ready')
 stop();return {threshold:options.threshold,outer:observed.every((el,i)=>el===slots[i]),initial,under,reached,focus,unobserved:unobserved.length}
})
assert.equal(threshold.threshold,.5);assert.ok(threshold.outer&&threshold.initial&&threshold.under&&threshold.reached&&threshold.focus&&threshold.unobserved===2)
console.log('PASS explicit initial/below/at-50% threshold, outer-slot observation and keyboard exception')
// New page restores native IO after the controlled observer test.
const parallax=await b.newPage({viewport:{width:900,height:600}})
await parallax.setContent('<style>body{margin:0}</style><header style="height:1000px"></header><div style="height:1500px"></div>');await parallax.addScriptTag({content:helpers})
await parallax.evaluate(()=>{window.stop=api.attachHeaderParallax(document.querySelector('header'))});await parallax.waitForTimeout(40);await parallax.evaluate(()=>scrollTo(0,250));await parallax.waitForTimeout(80)
const p=await parallax.locator('header').evaluate(e=>({heading:parseFloat(e.style.getPropertyValue('--heading-parallax')),fan:parseFloat(e.style.getPropertyValue('--fan-parallax'))}))
assert.equal(p.heading,10);assert.equal(p.fan,16);console.log('PASS parallax exactly doubled to 40px/64px maximum')
await parallax.close()
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1})
