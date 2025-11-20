import nock from 'nock'
import VerificationClient from './VerificationClient'
import { AuthenticatedRequest } from './types/AuthenticatedRequest'
import VerifyConfig from './types/VerifyConfig'

describe('VerificationClient', () => {
  let fakeApi: nock.Scope
  let tokenVerificationClient: VerificationClient
  const config: VerifyConfig = {
    agent: {
      timeout: 10000,
    },
    enabled: true,
    timeout: { deadline: 1000, response: 1000 },
    url: 'http://token-verification.url',
  }

  beforeEach(() => {
    fakeApi = nock(config.url, { badheaders: ['Content-Type'] })
    tokenVerificationClient = new VerificationClient(config, console)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('POST requests', () => {
    describe('Token verification disabled', () => {
      beforeAll(() => {
        config.enabled = false
      })

      it('Token is always considered valid (no API call)', async () => {
        fakeApi.post('/token/verify').reply(200, { active: true })

        const data = await tokenVerificationClient.verifyToken({} as AuthenticatedRequest)
        expect(data).toEqual(true)

        expect(nock.isDone()).toBe(false) // assert api was not called
      })
    })

    describe('Token verification enabled', () => {
      beforeEach(() => {
        config.enabled = true
      })

      it('Calls verify endpoint and parses active response', async () => {
        fakeApi.post('/token/verify', '').reply(200, { active: true })

        const data = await tokenVerificationClient.verifyToken({
          user: { token: 'some_token', username: 'john.doe' },
          verified: false,
        } as AuthenticatedRequest)

        expect(data).toEqual(true)
        expect(nock.isDone()).toBe(true) // assert api was called
      })

      it('Calls verify endpoint and parses inactive response', async () => {
        fakeApi.post('/token/verify', '').reply(200, { active: false })

        const data = await tokenVerificationClient.verifyToken({
          user: { token: 'some_token' },
          verified: false,
        } as AuthenticatedRequest)

        expect(data).toEqual(false)
      })

      it('Calls verify endpoint and parses empty response', async () => {
        fakeApi.post('/token/verify').reply(200, {})

        const data = await tokenVerificationClient.verifyToken({
          user: { token: 'some_token' },
          verified: false,
        } as AuthenticatedRequest)

        expect(data).toEqual(false)
      })

      it('Returns early when already verified (no API call)', async () => {
        fakeApi.post('/token/verify').reply(200, {})

        const data = await tokenVerificationClient.verifyToken({
          verified: true,
        } as AuthenticatedRequest)

        expect(data).toEqual(true)
        expect(nock.isDone()).toBe(false) // assert api was not called
      })
    })
  })
})
