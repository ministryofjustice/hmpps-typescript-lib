import { AuthOptions, Token } from '../types/AuthOptions'

/**
 * Use a System Token with a specific username.
 * Example: restClient.get('/some-api', asSystem('username'))
 */
export default function asSystem(username?: string): AuthOptions {
  return {
    client: Token.SYSTEM_TOKEN,
    user: { username },
  }
}
