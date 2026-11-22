// Actual DOM helpers and CSS; actual Google font downloading may be blocked.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright')
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict')
const root=path.join(__dirname,'..'),css=fs.readFileSync(path.join(root,'src/index.css'),'utf8').replace('@import "tailwindcss";','')
const helper=fs.readFileSync(path.join(root,'src/layout-motion.mjs'),'utf8').replace(/^export /gm,'')+'\nwindow.api={attachHeaderParallax,fitHeaderComposition};'
const header=fs.readFileSync(path.join(__dirname,'motion-offline.cjs'),'utf8').match(/const header=`([\s\S]*?)`/)[1]
;(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});try{const page=await browser.newPage()
for(const [width,height]of [[320,568],[360,640],[390,844],[480,700],[800,360],[1023,768],[1024,768],[1024,1000],[1280,1000],[1440,900],[1920,1080]]){
 await page.setViewportSize({width,height});await page.setContent(`<style>*{box-sizing:border-box}${css}</style>${header}<main class="directory-content"></main>`);await page.addScriptTag({content:helper});await page.evaluate(()=>{window.stopFit=api.fitHeaderComposition(document.querySelector('header'));document.getAnimations().forEach(a=>{if(a.effect.getTiming().iterations!==Infinity)a.finish()})});await page.waitForTimeout(30)
 for(const state of ['idle','hover']){if(state==='hover'){await page.locator('.practice-fan').hover();await page.evaluate(()=>document.getAnimations().forEach(a=>{if(a.effect.getTiming().iterations!==Infinity)a.finish()}))}
 const result=await page.evaluate(()=>{const fan=document.querySelector('.practice-fan'),r=fan.getBoundingClientRect(),header=document.querySelector('header'),word=document.querySelector('.portsmouth-word'),style=getComputedStyle(word),range=document.createRange();range.selectNodeContents(word);const text=range.getBoundingClientRect(),cards=[...document.querySelectorAll('.practice-card')].map(c=>c.getBoundingClientRect()),center=(r.left+r.right)/2;return {textFits:text.left>=0&&text.right<=innerWidth,clip:cards.some(c=>c.left<0||c.right>innerWidth),center,expected:Math.min(innerWidth*.6+184,parseFloat(header.style.getPropertyValue('--fan-safe-center'))),padding:getComputedStyle(document.querySelector('.directory-content')).paddingBottom,font:style.fontFamily,overflow:document.documentElement.scrollWidth>innerWidth}})
 assert.ok(result.textFits&&!result.clip&&!result.overflow,JSON.stringify({width,height,state,result}));assert.equal(result.padding,'240px');assert.ok(result.font.includes('BBH Bartle'))
 assert.ok(Math.abs(result.center-(width>=1024?result.expected:width/2))<1,JSON.stringify(result))
 }
 // Switch to a wide fallback and remeasure on resize.
 if(width<1024){await page.addStyleTag({content:'.portsmouth-word{font-family:Arial,sans-serif!important;font-size:180px!important}'}); // inline important would defeat fitting, so remove font-size override after establishing fallback.
 await page.evaluate(()=>{document.styleSheets[document.styleSheets.length-1].cssRules[0].style.removeProperty('font-size');window.dispatchEvent(new Event('resize'))});await page.waitForTimeout(40)
 const fits=await page.locator('.portsmouth-word').evaluate(el=>{const range=document.createRange();range.selectNodeContents(el);const r=range.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth});assert.ok(fits)}
 console.log('PASS title fallback bounds, capped desktop shift/centered mobile and 240px padding',width,height)
}
await page.setViewportSize({width:1000,height:700});await page.setContent('<style>body{margin:0}header{height:1500px}.heading{transform:translateY(var(--heading-parallax,0px))}.fan{transform:translateY(var(--fan-parallax,0px))}</style><header><div class="heading">Heading</div><div class="fan">Images</div></header><div style="height:2000px"></div>');await page.addScriptTag({content:helper});await page.evaluate(()=>{scrollTo(0,0);window.stop=api.attachHeaderParallax(document.querySelector('header'))});await page.waitForTimeout(40)
const original=await page.locator('.heading').evaluate(e=>e.getBoundingClientRect().top)
for(const distance of [90,300,600,900]){await page.evaluate(y=>scrollTo(0,y),distance);await page.waitForTimeout(50);const result=await page.evaluate(()=>({heading:parseFloat(document.querySelector('header').style.getPropertyValue('--heading-parallax')),fan:parseFloat(document.querySelector('header').style.getPropertyValue('--fan-parallax')),top:document.querySelector('.heading').getBoundingClientRect().top}));assert.ok(Math.abs(result.heading-distance/4)<.01&&Math.abs(result.fan-distance/4)<.01);assert.ok(Math.abs(result.top-(original-distance*3/4))<.1)}
console.log('PASS exact +scrollDistance/4 offset and visual 3/4 page speed')
await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(30);assert.equal(await page.locator('header').evaluate(e=>e.style.getPropertyValue('--heading-parallax')),'0px');console.log('PASS reduced-motion reset')
}finally{await browser.close()}})().catch(error=>{console.error(error);process.exitCode=1})
