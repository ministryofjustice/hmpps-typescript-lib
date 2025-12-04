import type { RedisClient } from '../types/RedisClient'
import TokenStore from './RedisTokenStore'

const redisClient = {
  get: jest.fn(),
  set: jest.fn(),
  on: jest.fn(),
  connect: jest.fn(),
  isOpen: true,
} as unknown as jest.Mocked<RedisClient>

describe('tokenStore', () => {
  let tokenStore: TokenStore

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('Token Store with default prefix', () => {
    beforeEach(() => {
      tokenStore = new TokenStore(redisClient as unknown as RedisClient)
    })

    describe('get token', () => {
      it('Can retrieve token', async () => {
        redisClient.get.mockResolvedValue('token-1')

        await expect(tokenStore.getToken('user-1')).resolves.toBe('token-1')

        expect(redisClient.get).toHaveBeenCalledWith('systemToken:user-1')
      })

      it('Connects when no connection calling getToken', async () => {
        ;(redisClient as unknown as Record<string, boolean>).isOpen = false

        await tokenStore.getToken('user-1')

        expect(redisClient.connect).toHaveBeenCalledWith()
      })
    })

    describe('set token', () => {
      it('Can set token', async () => {
        await tokenStore.setToken('user-1', 'token-1', 10)

        expect(redisClient.set).toHaveBeenCalledWith('systemToken:user-1', 'token-1', { EX: 10 })
      })

      it('Connects when no connection calling set token', async () => {
        ;(redisClient as unknown as Record<string, boolean>).isOpen = false

        await tokenStore.setToken('user-1', 'token-1', 10)

        expect(redisClient.connect).toHaveBeenCalledWith()
      })
    })
  })

  describe('Token Store with custom prefix', () => {
    beforeEach(() => {
      tokenStore = new TokenStore(redisClient as unknown as RedisClient, 'customTokens')
    })

    it('Can retrieve token', async () => {
      redisClient.get.mockResolvedValue('token-1')

      await expect(tokenStore.getToken('user-1')).resolves.toBe('token-1')

      expect(redisClient.get).toHaveBeenCalledWith('customTokens:user-1')
    })

    it('Can set token', async () => {
      await tokenStore.setToken('user-1', 'token-1', 10)

      expect(redisClient.set).toHaveBeenCalledWith('customTokens:user-1', 'token-1', { EX: 10 })
    })
  })
})
