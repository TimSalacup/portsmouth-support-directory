import assert from 'node:assert/strict'
import { attachHeaderParallax } from '../src/layout-motion.mjs'

let top=0, frame, intersection, motionChange
const offsets=new Map(), events=new Map()
const motion={matches:false,addEventListener(_event,fn){motionChange=fn},removeEventListener(){motionChange=null}}
const fakeObserver=class { constructor(fn){intersection=fn} observe(){} disconnect(){intersection=null} }
globalThis.IntersectionObserver=fakeObserver
globalThis.requestAnimationFrame=fn=>{frame=fn;return 1}
globalThis.cancelAnimationFrame=()=>{frame=null}
globalThis.window={IntersectionObserver:fakeObserver,matchMedia:()=>motion,addEventListener:(key,fn)=>events.set(key,fn),removeEventListener:key=>events.delete(key)}
const header={getBoundingClientRect:()=>({top}),style:{setProperty:(key,value)=>offsets.set(key,value)}}
const detach=attachHeaderParallax(header)
intersection([{isIntersecting:true}])
for(const y of [0,1,90,300,900]){
 top=-y;events.get('scroll')();frame()
 assert.deepEqual([...offsets.values()],[`${y/4}px`,`${y/4}px`])
}
intersection([{isIntersecting:false}])
assert.equal(events.has('scroll'),false)
motion.matches=true;motionChange()
assert.deepEqual([...offsets.values()],['0px','0px'])
detach()
assert.equal(intersection,null)
