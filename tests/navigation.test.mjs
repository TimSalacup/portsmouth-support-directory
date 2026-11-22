import assert from 'node:assert/strict'
import { createWheelGate } from '../src/segment-navigation.mjs'
import data from '../src/directory-data.json' with { type: 'json' }
const gate = createWheelGate()
assert.equal(gate.feed(25, 0, false), 0)
assert.equal(gate.feed(25, 20, false), 1)
for (let time = 40; time <= 1600; time += 20) {
  assert.equal(gate.blocks(time), true)
  assert.equal(gate.feed(90, time, false), 0, 'Momentum must not skip records')
}
assert.equal(gate.blocks(1900), false)
assert.equal(gate.feed(-60, 1900, false), -1)
const overflow = createWheelGate()
assert.equal(overflow.feed(80, 0, true), 0)
assert.equal(overflow.feed(80, 20, false), 0, 'Reaching the boundary within a scroll gesture must not change record')
assert.equal(overflow.feed(80, 400, false), 1)
assert.equal(overflow.feed(80, 700, false), 0, 'Cooldown rejects a rapid second gesture')
assert.equal(overflow.feed(80, 1200, false), 1)
assert.equal(Object.keys(data).length, 12)
assert.equal(Object.values(data).flat().length, 75)
assert.deepEqual(Object.values(data).map(rows => rows.length), [9,1,2,1,2,1,10,5,11,18,5,10])
for (const rows of Object.values(data)) for (const row of rows) {
  assert.equal(typeof row.title, 'string')
  assert.equal(typeof row.description, 'string')
  assert.ok(Array.isArray(row.contacts))
  for (const contact of row.contacts) assert.ok(!contact.href || /^(https?:\/\/|mailto:|tel:)/.test(contact.href))
}
console.log('PASS: momentum, direction, boundary, cooldown and all 75 data records')

const phones = Object.values(data).flat().flatMap(record => record.contacts).filter(contact => contact.href?.startsWith('tel:'))
assert.equal(phones.length, 46)
assert.ok(data['mental-health-in-crisis'].every(record => record.contacts.every(contact => !contact.href?.startsWith('tel:'))))
console.log('PASS: 46 clickable phone links; crisis entries remain links-only')
