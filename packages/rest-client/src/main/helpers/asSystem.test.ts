import asSystem from './asSystem'
import { TokenType } from '../types/AuthOptions'

describe('asSystem', () => {
  it('should return a system token without a username (anonymous system request)', () => {
    const result = asSystem()

    expect(result).toEqual({
      tokenType: TokenType.SYSTEM_TOKEN,
      user: { username: undefined },
    })
  })

  it('should return a system token with a specific username', () => {
    const result = asSystem('guilty.spark')

    expect(result).toEqual({
      tokenType: TokenType.SYSTEM_TOKEN,
      user: { username: 'guilty.spark' },
    })
  })
})
