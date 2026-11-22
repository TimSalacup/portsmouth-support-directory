export const CRISIS_SOURCE_NOTE = 'It is recommended to verify the most recent changes to the contact information and service hours.'

export function canLinkContact(category, contact) {
  if (!contact.href) return false
  if (category !== 'Mental Health in Crisis') return /^(https?:\/\/|mailto:|tel:)/i.test(contact.href)
  // Crisis contact numbers/text instructions are historical transcription, not verified actions.
  return /^https?:\/\//i.test(contact.href) && !/^(phone|text|sms|call|helpline)\b/i.test(contact.label.trim())
}
