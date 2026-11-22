// Actual CSS geometry in an isolated fixture; not a full React/font render.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright')
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict')
const css=fs.readFileSync(path.join(__dirname,'../src/index.css'),'utf8').replace('@import "tailwindcss";','')
;(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});try{
const page=await browser.newPage()
for(const [width,height]of [[320,568],[390,844],[640,600],[768,600],[1024,768],[1280,800],[1440,900],[1280,1000],[1440,1000],[1920,1000],[1920,1080],[800,360]]){
 await page.setViewportSize({width,height})
 await page.setContent(`<style>*{box-sizing:border-box}${css}</style><header class="directory-header"><div class="practice-fan"><div class="practice-card practice-card--rear"></div><div class="practice-card practice-card--front"></div></div><h1><span>PORTSMOUTH</span> <span>SUPPORT DIRECTORY</span></h1><svg class="section-wave"></svg></header>`)
 for(const state of ['idle','hover']){
  if(state==='hover'){await page.locator('.practice-fan').hover();await page.waitForTimeout(400)}
  const result=await page.evaluate(()=>{const header=document.querySelector('header').getBoundingClientRect(),heading=document.querySelector('h1').getBoundingClientRect(),wave=document.querySelector('.section-wave').getBoundingClientRect();const cards=[...document.querySelectorAll('.practice-card')];return {cardWidths:cards.map(c=>parseFloat(getComputedStyle(c).width)),cardHeights:cards.map(c=>parseFloat(getComputedStyle(c).height)),overlap:cards.some(c=>{const b=c.getBoundingClientRect();return b.bottom>heading.top&&b.top<heading.bottom&&b.right>heading.left&&b.left<heading.right}),clipped:cards.some(c=>{const b=c.getBoundingClientRect();return b.left<0||b.right>innerWidth||b.top<header.top||b.bottom>wave.top}),overflow:document.documentElement.scrollWidth>innerWidth}})
  assert.ok(!result.overlap&&!result.clipped&&!result.overflow,JSON.stringify({width,height,state,result}))
  if(width>=1280&&height>=1000)assert.ok(result.cardWidths.every(w=>Math.abs(w-400)<.1),JSON.stringify(result))
  assert.ok(result.cardWidths.every((w,i)=>Math.abs(result.cardHeights[i]/w-9/8)<.01))
 }
 console.log('PASS idle/hover card geometry',width,height)
}
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1})
