export const grammar = (value: unknown) => {
  return typeof value === 'string' && !value.endsWith('s') ? `${value}s` : value
}

export const possessive = (value: unknown) => {
  if (typeof value !== 'string' || !value.trim()) return String(value)

  const trimmed = value.trim()
  return trimmed.endsWith('s') ? `${trimmed}'` : `${trimmed}'s`
}

export const ordinal = (value: unknown) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return String(value)
  const suffixes = ['th', 'st', 'nd', 'rd']
  const mod100 = value % 100

  return value + (suffixes[(mod100 - 20) % 10] || suffixes[mod100] || suffixes[0])
}

export const plural = (value: unknown, rules: Record<string, string>, locale: string) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return String(value)
  }

  if (value === 0 && rules.hasOwnProperty('zero')) {
    return rules.zero
  }

  const pluralRules = new Intl.PluralRules(locale)
  const rule = pluralRules.select(value) // e.g., 'one', 'other', etc.

  return rules[rule] ?? rules.other ?? ''
}
