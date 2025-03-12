import asUser from './asUser'
import { TokenType } from '../types/AuthOptions'

describe('asUser', () => {
  it('should return a user token with the given access token', () => {
    const token = 'jwt_token_123'
    const result = asUser(token)

    expect(result).toEqual({
      tokenType: TokenType.USER_TOKEN,
      user: { token: 'jwt_token_123' },
    })
  })
})
