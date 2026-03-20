import { resolvePackage, satisfiesVersion } from './version-resolver'

describe('satisfiesVersion', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should match a package configured without a version', () => {
    expect(satisfiesVersion('package-a', 'package-a', '1.2.3')).toBe(true)
  })

  it('should match a package version against a configured range', () => {
    expect(satisfiesVersion('package-a@^1.0.0', 'package-a', '1.2.3')).toBe(true)
  })

  it('should return false for different packages', () => {
    expect(satisfiesVersion('package-b@^1.0.0', 'package-a', '1.2.3')).toBe(false)
  })

  it('should warn and return false for an invalid configured range', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

    expect(satisfiesVersion('package-a@not-a-range', 'package-a', '1.2.3')).toBe(false)
    expect(warnSpy).toHaveBeenCalledWith('Invalid configuration: package-a@not-a-range / package-a@1.2.3')
  })

  it('should warn and return false for an invalid package version', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

    expect(satisfiesVersion('package-a@^1.0.0', 'package-a', 'not-a-version')).toBe(false)
    expect(warnSpy).toHaveBeenCalledWith('Invalid configuration: package-a@^1.0.0 / package-a@not-a-version')
  })
})

describe('resolvePackage', () => {
  it('should prefer an exact version match over name-only and range matches', () => {
    const configuredAllowlist: [string, 'ALLOW' | 'FORBID'][] = [
      ['package-a', 'ALLOW'],
      ['package-a@^1.0.0', 'ALLOW'],
      ['package-a@1.2.3', 'FORBID'],
    ]

    expect(resolvePackage(configuredAllowlist, 'package-a', '1.2.3')).toBe('FORBID')
  })

  it('should prefer a range match over a name-only match', () => {
    const configuredAllowlist: [string, 'ALLOW' | 'FORBID'][] = [
      ['package-a', 'ALLOW'],
      ['package-a@^1.0.0', 'FORBID'],
    ]

    expect(resolvePackage(configuredAllowlist, 'package-a', '1.2.3')).toBe('FORBID')
  })

  it('should use a matching range when there is no exact or name-only match', () => {
    const configuredAllowlist: [string, 'ALLOW' | 'FORBID'][] = [['package-a@^1.0.0', 'ALLOW']]

    expect(resolvePackage(configuredAllowlist, 'package-a', '1.2.3')).toBe('ALLOW')
  })

  it('should return undefined when no rule matches the package', () => {
    const configuredAllowlist: [string, 'ALLOW' | 'FORBID'][] = [
      ['package-b', 'ALLOW'],
      ['package-a@^2.0.0', 'FORBID'],
    ]

    expect(resolvePackage(configuredAllowlist, 'package-a', '1.2.3')).toBeUndefined()
  })
})
