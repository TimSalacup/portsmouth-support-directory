import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import data from '../src/directory-data.json' with { type: 'json' }
import { canLinkContact, CRISIS_SOURCE_NOTE } from '../src/verbatim-content.mjs'
const visible=JSON.stringify(data,(key,value)=>key==='href'?undefined:value)
assert.equal(createHash('sha256').update(visible).digest('hex'),'7e080bdf61dc392f5398ea60c7ae5aad43a39117547070671117940b3a116cdd')
assert.deepEqual(Object.values(data).map(rows=>rows.length),[9,1,2,1,2,1,10,5,11,14,6,8])
const rows=Object.values(data).flat(),contacts=rows.flatMap(row=>row.contacts)
assert.equal(rows.length,70);assert.equal(contacts.length,137)
assert.equal(contacts.filter(c=>c.href?.startsWith('tel:')).length,31)
assert.equal(contacts.filter(c=>c.href?.startsWith('mailto:')).length,10)
assert.equal(contacts.filter(c=>c.href?.startsWith('https:')).length,52)
assert.equal(contacts.filter(c=>c.href?.startsWith('http:')).length,1)
for(const row of data['mental-health-in-crisis']) for(const contact of row.contacts) {
 assert.equal(canLinkContact('Mental Health in Crisis',contact),contact.label.startsWith('Website:'))
}
assert.equal(canLinkContact('Mental Health in Crisis',{label:'Phone: archived source text',href:'tel:archival'}),false)
assert.equal(canLinkContact('Mental Health in Crisis',{label:'Text: archived source text',href:'sms:archival'}),false)
assert.equal(CRISIS_SOURCE_NOTE,'It is recommended to verify the most recent changes to the contact information and service hours.')
assert.ok(rows.every(r=>!r.description.includes(CRISIS_SOURCE_NOTE)))
for (const [slug, records] of Object.entries(data)) for (const record of records) for (const contact of record.contacts) {
 const category = slug === 'mental-health-in-crisis' ? 'Mental Health in Crisis' : slug
 const site=contact.label.match(/^Website: ((?:https?:\/\/|www\.)[^\s]+)/i)
 const email=contact.label.match(/^Email: (\S+@\S+)$/)
 if (site) {
   assert.equal(contact.href,site[1].startsWith('www.')?'https://'+site[1]:site[1])
   assert.ok(canLinkContact(category,contact))
 }
 if (email) {
   assert.equal(contact.href,'mailto:'+email[1])
   assert.ok(canLinkContact(category,contact))
 }
}
const named=data['mental-wellbeing-resources'].find(r=>r.title==='Talking Therapies Portsmouth').contacts.find(c=>c.label.startsWith('Website:'))
assert.equal(named.href,'https://www.talkingtherapieshiow.nhs.uk/portsmouth')
assert.ok(canLinkContact('Mental Wellbeing Resources',named))
console.log('PASS all 63 website/email links, cleaned directory text, plain crisis phone/SMS and separate source caution')

assert.ok(rows.every(row => !row.description.includes('\n')))
for (const text of rows.flatMap(row => [row.description, ...row.contacts.map(c=>c.label)])) assert.doesNotMatch(text,/\bPDF\b|\blisted as\b/i)
