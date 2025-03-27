import nock from 'nock'
import { AgentConfig } from '@ministryofjustice/hmpps-rest-client'
import AuthenticationClient from './AuthenticationClient'
import AuthConfig from './types/AuthConfig'
import InMemoryTokenStore from './tokenStores/InMemoryTokenStore'
import TokenStore from './types/TokenStore'

jest.mock('./tokenStores/InMemoryTokenStore')

describe('AuthenticationClient', () => {
  let fakeHmppsAuthApi: nock.Scope
  let hmppsAuthTokenClient: AuthenticationClient
  let tokenStore: jest.Mocked<TokenStore>

  const username = 'Bob'
  const token = { access_token: 'token-1', expires_in: 300 }
  const config: AuthConfig = {
    systemClientId: 'client_id',
    systemClientSecret: 'client_secret',
    agent: {
      timeout: 10000,
    },
    timeout: { deadline: 1000, response: 1000 },
    url: 'http://hmpps-auth.url/auth',
  }

  beforeEach(() => {
    fakeHmppsAuthApi = nock(config.url)
    tokenStore = new InMemoryTokenStore() as jest.Mocked<InMemoryTokenStore>
    hmppsAuthTokenClient = new AuthenticationClient(config, console, tokenStore)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getToken', () => {
    it('should instantiate the redis client', async () => {
      tokenStore.getToken.mockResolvedValue(token.access_token)
      await hmppsAuthTokenClient.getToken(username)
    })

    it('should return token from tokenStore if one exists', async () => {
      tokenStore.getToken.mockResolvedValue(token.access_token)

      const output = await hmppsAuthTokenClient.getToken(username)

      expect(output).toEqual(token.access_token)
      expect(tokenStore.getToken).toHaveBeenCalledWith('Bob')
      expect(tokenStore.setToken).not.toHaveBeenCalled()
    })

    it('should call HMPPS Auth and return token when none is in tokenStore (with username)', async () => {
      tokenStore.getToken.mockResolvedValue(null)
      fakeHmppsAuthApi
        .post('/oauth/token', 'grant_type=client_credentials&username=Bob')
        .basicAuth({
          user: config.systemClientId,
          pass: config.systemClientSecret,
        })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, token)

      const output = await hmppsAuthTokenClient.getToken(username)

      expect(output).toEqual(token.access_token)
      expect(tokenStore.setToken).toHaveBeenCalledWith('Bob', token.access_token, token.expires_in - 60)
    })

    it('should call HMPPS Auth and return token when none is in tokenStore (without username)', async () => {
      tokenStore.getToken.mockResolvedValue(null)
      fakeHmppsAuthApi
        .post('/oauth/token', 'grant_type=client_credentials')
        .basicAuth({
          user: config.systemClientId,
          pass: config.systemClientSecret,
        })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, token)

      const output = await hmppsAuthTokenClient.getToken()

      expect(output).toEqual(token.access_token)
      expect(tokenStore.setToken).toHaveBeenCalledWith('%ANONYMOUS%', token.access_token, token.expires_in - 60)
    })
  })
})
