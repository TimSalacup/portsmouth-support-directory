// Uses the actual stylesheet without requiring React or downloading fonts.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const css = fs.readFileSync(path.join(__dirname, '../src/index.css'), 'utf8')
  .replace(/^@import .*;$/gm, '')
const card = '<div class="category-reveal"><button class="category-card"><span class="category-title">Mental Wellbeing Resources</span><span class="category-view">view</span></button></div>'
const markup = '<main class="directory-content"><div class="directory-grid"><ul class="category-list"><li class="category-slot is-selected">'+card+'</li><li class="category-slot">'+card+'</li></ul></div></main>'
const run = async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] })
  try {
    const page = await browser.newPage()
    for (const [width,height] of [[320,570],[390,844],[639,700],[640,360],[900,500],[1023,640]]) {
      await page.setViewportSize({ width, height })
      await page.setContent('<style>*{box-sizing:border-box}'+css+'</style>'+markup)
      const result = await page.evaluate(async () => {
        const grid = document.querySelector('.directory-grid'), target=grid.querySelector('.category-card')
        const h = () => target.getBoundingClientRect().height
        const before = h(), natural = target.getBoundingClientRect().width*4/3
        const expected = innerWidth < 640 ? Math.max(64,Math.min(innerHeight*.18,160)) : Math.min(natural,innerHeight-112)
        if (Math.abs(before-expected)<.1) return { before,natural,expected }
        const add = className => grid.classList.add(className)
        const resize = () => target.getAnimations().find(a=>a.transitionProperty==='height')
        add('has-selection')
        h()
        const opening = resize(); opening.pause(); opening.currentTime=170; const middle=h()
        const duration=opening.effect.getTiming().duration; opening.finish()
        const compact=h()
        add('is-open'); const whenOpen=h()
        add('is-closing'); h()
        const closing=resize(); closing.pause(); closing.currentTime=170; const closingMiddle=h(); closing.finish()
        return {before,natural,middle,compact,whenOpen,closingMiddle,restored:h(),duration,expected}
      })
      assert.ok(Math.abs(result.before-result.natural)<.1,JSON.stringify(result))
      if(result.middle===undefined) continue
      assert.equal(result.duration,400)
      assert.ok(result.before>result.middle&&result.middle>result.compact,JSON.stringify(result))
      assert.ok(Math.abs(result.compact-result.expected)<.1,JSON.stringify(result))
      assert.equal(result.compact,result.whenOpen)
      assert.ok(result.compact<result.closingMiddle&&result.closingMiddle<result.restored,JSON.stringify(result))
      assert.ok(Math.abs(result.before-result.restored)<.1,JSON.stringify(result))
      console.log('PASS interpolated open and return',width,height)
    }
    await page.setViewportSize({width:390,height:844})
    await page.emulateMedia({reducedMotion:'reduce'})
    await page.setContent('<style>*{box-sizing:border-box}'+css+'</style>'+markup)
    assert.equal(await page.locator('.category-card').first().evaluate(el=>{el.closest('.directory-grid').classList.add('has-selection');return el.getAnimations().length}),0)
    console.log('PASS reduced motion')
  } finally { await browser.close() }
}
run().catch(e=>{console.error(e);process.exitCode=1})
