import nock from 'nock'
import express from 'express'
import { PassThrough } from 'stream'
import RestClient from './RestClient'
import { AgentConfig } from './types/ApiConfig'
import { AuthOptions, TokenType } from './types/AuthOptions'

class TestRestClient extends RestClient {
  constructor() {
    super(
      'api-name',
      {
        url: 'http://localhost:8080/api',
        timeout: {
          response: 1000,
          deadline: 1000,
        },
        agent: new AgentConfig(1000),
      },
      console,
      {
        getToken: jest.fn().mockResolvedValue('some_system_jwt'),
      },
    )
  }
}

const restClient = new TestRestClient()

const systemAuthOptions: AuthOptions = {
  tokenType: TokenType.SYSTEM_TOKEN,
  user: {
    username: 'guilty-spark',
  },
}

const userAuthOptions: AuthOptions = {
  tokenType: TokenType.USER_TOKEN,
  user: {
    token: 'some_user_jwt',
  },
}

/**
 * Helper for reading a stream’s contents into a string
 */
async function readAll(stream: NodeJS.ReadableStream): Promise<string> {
  let data = ''
  for await (const chunk of stream) {
    data += chunk
  }
  return data
}

describe('RestClient', () => {
  describe.each(['get', 'patch', 'post', 'put', 'delete'] as const)('%s', method => {
    afterEach(() => {
      nock.cleanAll()
    })

    it('should return response body using system token', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer some_system_jwt' },
      })
        [method]('/api/test')
        .reply(200, { success: true })

      const result = await restClient[method](
        {
          path: '/test',
        },
        systemAuthOptions,
      )

      expect(nock.isDone()).toBe(true)
      expect(result).toStrictEqual({ success: true })
    })

    it('should return raw response when requested', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer some_system_jwt' },
      })
        [method]('/api/test')
        .reply(200, { success: true })

      const result = await restClient[method](
        {
          path: '/test',
          headers: { header1: 'headerValue1' },
          raw: true,
        },
        systemAuthOptions,
      )

      expect(nock.isDone()).toBe(true)
      expect(result).toMatchObject({
        req: { method: method.toUpperCase() },
        status: 200,
        text: '{"success":true}',
      })
    })

    if (method === 'get' || method === 'delete') {
      it('should retry by default', async () => {
        nock('http://localhost:8080', {
          reqheaders: { authorization: 'Bearer some_system_jwt' },
        })
          [method]('/api/test')
          .reply(500)
          [method]('/api/test')
          .reply(500)
          [method]('/api/test')
          .reply(500)

        await expect(
          restClient[method](
            {
              path: '/test',
              headers: { header1: 'headerValue1' },
            },
            systemAuthOptions,
          ),
        ).rejects.toThrow('Internal Server Error')

        expect(nock.isDone()).toBe(true)
      })
    } else {
      it('should not retry by default', async () => {
        nock('http://localhost:8080', {
          reqheaders: { authorization: 'Bearer some_system_jwt' },
        })
          [method]('/api/test')
          .reply(500)

        await expect(
          restClient[method](
            {
              path: '/test',
              headers: { header1: 'headerValue1' },
            },
            systemAuthOptions,
          ),
        ).rejects.toThrow('Internal Server Error')

        expect(nock.isDone()).toBe(true)
      })

      it('should retry if configured to do so', async () => {
        nock('http://localhost:8080', {
          reqheaders: { authorization: 'Bearer some_system_jwt' },
        })
          [method]('/api/test')
          .reply(500)
          [method]('/api/test')
          .reply(500)
          [method]('/api/test')
          .reply(500)

        await expect(
          restClient[method](
            {
              path: '/test',
              headers: { header1: 'headerValue1' },
              retry: true,
            },
            systemAuthOptions,
          ),
        ).rejects.toThrow('Internal Server Error')

        expect(nock.isDone()).toBe(true)
      })
    }

    it('can recover through retries', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer some_system_jwt' },
      })
        [method]('/api/test')
        .reply(500)
        [method]('/api/test')
        .reply(500)
        [method]('/api/test')
        .reply(200, { success: true })

      const result = await restClient[method](
        {
          path: '/test',
          headers: { header1: 'headerValue1' },
          retry: true,
        },
        systemAuthOptions,
      )

      expect(result).toStrictEqual({ success: true })
      expect(nock.isDone()).toBe(true)
    })

    it("should use the user's token if configured to do so", async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer some_user_jwt' },
      })
        [method]('/api/test')
        .reply(200, { success: true })

      const result = await restClient[method](
        {
          path: '/test',
        },
        userAuthOptions,
      )

      expect(nock.isDone()).toBe(true)
      expect(result).toStrictEqual({ success: true })
    })

    it('should call endpoint without a token if authOptions is undefined', async () => {
      nock('http://localhost:8080')
        .matchHeader('authorization', val => val === undefined)
        [method]('/api/test')
        .reply(200, { success: true })

      const result = await restClient[method](
        {
          path: '/test',
        },
        undefined, // no auth
      )

      expect(nock.isDone()).toBe(true)
      expect(result).toStrictEqual({ success: true })
    })

    it('should call endpoint with raw token if authOptions is a JWT string', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer raw_jwt_string' },
      })
        [method]('/api/test')
        .reply(200, { success: true })

      const result = await restClient[method](
        {
          path: '/test',
        },
        'raw_jwt_string', // pass raw string directly
      )

      expect(nock.isDone()).toBe(true)
      expect(result).toStrictEqual({ success: true })
    })
  })

  describe('stream', () => {
    afterEach(() => {
      nock.cleanAll()
    })

    it('should stream data successfully with a system token', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer some_system_jwt' },
      })
        .get('/api/test-file')
        .reply(200, 'this is some file content')

      const readable = await restClient.stream({ path: '/test-file' }, systemAuthOptions)
      const receivedData = await readAll(readable)

      expect(receivedData).toEqual('this is some file content')
      expect(nock.isDone()).toBe(true)
    })

    it('should stream data successfully with a user token', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer some_user_jwt' },
      })
        .get('/api/test-file')
        .reply(200, 'some user file content')

      const readable = await restClient.stream({ path: '/test-file' }, userAuthOptions)
      const receivedData = await readAll(readable)

      expect(receivedData).toEqual('some user file content')
      expect(nock.isDone()).toBe(true)
    })

    it('should stream data without auth if undefined', async () => {
      nock('http://localhost:8080')
        .matchHeader('authorization', val => val === undefined)
        .get('/api/test-file')
        .reply(200, 'public file content')

      const readable = await restClient.stream({ path: '/test-file' }, undefined)
      const receivedData = await readAll(readable)

      expect(receivedData).toEqual('public file content')
      expect(nock.isDone()).toBe(true)
    })

    it('should stream data with a raw token if a string is given', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer raw_stream_jwt' },
      })
        .get('/api/test-file')
        .reply(200, 'stream content for raw token')

      const readable = await restClient.stream({ path: '/test-file' }, 'raw_stream_jwt')
      const receivedData = await readAll(readable)

      expect(receivedData).toEqual('stream content for raw token')
      expect(nock.isDone()).toBe(true)
    })

    it('should include additional headers if provided', async () => {
      nock('http://localhost:8080', {
        reqheaders: {
          authorization: 'Bearer some_system_jwt',
          'x-custom-header': 'some-custom-value',
        },
      })
        .get('/api/test-file')
        .reply(200, 'content with custom header')

      const readable = await restClient.stream(
        {
          path: '/test-file',
          headers: { 'X-Custom-Header': 'some-custom-value' },
        },
        systemAuthOptions,
      )

      const receivedData = await readAll(readable)
      expect(receivedData).toEqual('content with custom header')
      expect(nock.isDone()).toBe(true)
    })

    it('should handle failures', async () => {
      const res = new PassThrough() as unknown as express.Response
      res.set = jest.fn()

      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer some_system_jwt' },
      })
        .get('/api/test-file')
        .reply(500)

      await expect(restClient.stream({ path: '/test-file' }, systemAuthOptions)).rejects.toThrow()

      expect(nock.isDone()).toBe(true)
    })
  })
})
