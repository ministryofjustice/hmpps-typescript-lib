/**
 * Helper function to parse dot/bracket expressions into nested values.
 */
export default function getNestedValue(object: Record<string, any>, path: string): unknown {
  const tokens = path.match(/([^[\].]+)/g) || []

  return tokens.reduce<unknown>((current, token) => {
    if (typeof current !== 'object' || current === null) return undefined
    return (current as Record<string, unknown>)[token]
  }, object)
}
