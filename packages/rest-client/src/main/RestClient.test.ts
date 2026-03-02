import nock from 'nock'
import express from 'express'
import { Response } from 'superagent'
import { PassThrough } from 'stream'
import { NotFound } from 'http-errors'
import RestClient from './RestClient'
import { AgentConfig } from './types/ApiConfig'
import { AuthOptions, TokenType } from './types/AuthOptions'
import { SanitisedError } from './types/Errors'
import { CallContext } from './types/Request'

class TestRestClient extends RestClient {
  constructor() {
    super(
      'api-name',
      {
        url: 'http://localhost:8080/api',
        timeout: {
          response: 200,
          deadline: 200,
        },
        agent: new AgentConfig(200),
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

    it('should support custom error handling when provided', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer some_system_jwt' },
      })
        [method]('/api/test')
        .reply(404, { message: 'some not found message' })

      const result = await restClient[method](
        {
          path: '/test',
          headers: { header1: 'headerValue1' },
          raw: true,
          errorHandler: <RESPONSE, ERROR>(path: string, verb: string, error: SanitisedError<ERROR>) => {
            if (error.responseStatus === 404) {
              return error.data as RESPONSE
            }
            throw error
          },
        },
        systemAuthOptions,
      )

      expect(nock.isDone()).toBe(true)
      expect(result).toMatchObject({
        message: 'some not found message',
      })
    })

    it('can coerce 404s to null', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer some_system_jwt' },
      })
        [method]('/api/test')
        .reply(404, { message: 'some not found message' })

      const response: string | null = await restClient[method]<string | null>(
        {
          path: '/test',
          headers: { header1: 'headerValue1' },
          raw: true,
          errorHandler: <ERROR>(path: string, verb: string, error: SanitisedError<ERROR>) => {
            if (error.responseStatus === 404) {
              return null
            }
            throw error
          },
        },
        systemAuthOptions,
      )

      expect(response).toStrictEqual(null)

      expect(nock.isDone()).toBe(true)
    })

    it('can propagate api response status when desired', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer some_system_jwt' },
      })
        [method]('/api/test')
        .reply(404, { message: 'some not found message' })

      const call = restClient[method](
        {
          path: '/test',
          headers: { header1: 'headerValue1' },
          raw: true,
          errorHandler: <ERROR>(path: string, verb: string, error: SanitisedError<ERROR>) => {
            if (error.responseStatus === 404) {
              const notFound = NotFound(`Resource not found on '${verb.toLowerCase()}: ${path}'`)
              notFound.cause = error
              throw notFound
            }
            throw error
          },
        },
        systemAuthOptions,
      )

      await expect(() => call).rejects.toStrictEqual(
        expect.objectContaining({
          message: `Resource not found on '${method.toLowerCase()}: /test'`,
          status: 404,
          cause: expect.any(Error),
        }),
      )

      expect(nock.isDone()).toBe(true)
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

      it('should accept custom retry handler', async () => {
        nock('http://localhost:8080', {
          reqheaders: { authorization: 'Bearer some_system_jwt' },
        })
          [method]('/api/test')
          .reply(500)
          [method]('/api/test')
          .reply(404)

        await expect(
          restClient[method](
            {
              path: '/test',
              headers: { header1: 'headerValue1' },
              retryHandler: () => (err: Error, res: Response) => {
                if (err) return true
                if (res?.statusCode) {
                  return res.statusCode >= 500
                }
                return undefined
              },
            },
            systemAuthOptions,
          ),
        ).rejects.toThrow('Not Found')

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

    it('retries on retryable network error code (ECONNRESET)', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer some_system_jwt' },
      })
        [method]('/api/test')
        .delay(300)
        .reply(200, {})
        [method]('/api/test')
        .delay(300)
        .reply(200, {})
        [method]('/api/test')
        .delay(300)
        .reply(200, {})

      await expect(
        restClient[method](
          {
            path: '/test',
            headers: { header1: 'headerValue1' },
            retry: method !== 'get' && method !== 'delete',
          },
          systemAuthOptions,
        ),
      ).rejects.toThrow()

      expect(nock.isDone()).toBe(true)
    })

    it('should NOT retry on non-retryable status codes', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer some_system_jwt' },
      })
        [method]('/api/test')
        .reply(401, { message: 'Unauthorized' })

      await expect(
        restClient[method](
          {
            path: '/test',
            headers: { header1: 'headerValue1' },
            retry: true,
          },
          systemAuthOptions,
        ),
      ).rejects.toThrow('Unauthorized')

      expect(nock.isDone()).toBe(true)
    })

    it('should retry on retryable status codes', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer some_system_jwt' },
      })
        [method]('/api/test')
        .reply(502)
        [method]('/api/test')
        .reply(502)
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

  describe.each(['patch', 'post', 'put'] as const)('%s request with body', method => {
    afterEach(() => {
      nock.cleanAll()
    })

    it('should handle json request body', async () => {
      let interceptedRequestBody: unknown

      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer some_system_jwt' },
      })
        [method]('/api/test', body => {
          interceptedRequestBody = body
          return true
        })
        .reply(200, { success: true })

      const result = await restClient[method](
        {
          path: '/test',
          data: { test: 'data' },
        },
        systemAuthOptions,
      )

      expect(nock.isDone()).toBe(true)
      expect(result).toStrictEqual({ success: true })
      expect(interceptedRequestBody).toStrictEqual({ test: 'data' })
    })

    it('should handle multipart request body', async () => {
      let interceptedRequestBody: unknown

      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer some_system_jwt' },
      })
        [method]('/api/test', body => {
          interceptedRequestBody = body
          return true
        })
        .reply(200, { success: true })

      const result = await restClient[method](
        {
          path: '/test',
          multipartData: {
            test: 'data',
            object: { key: 'value', array: [1, 2] },
            array: ['value1', 'value2'],
            undefinedProp: undefined,
            nullProp: null,
          },
          files: { sample: { originalname: 'sample.txt', buffer: Buffer.from('Lorem ipsum', 'utf8') } },
        },
        systemAuthOptions,
      )

      expect(nock.isDone()).toBe(true)
      expect(result).toStrictEqual({ success: true })
      expect(interceptedRequestBody).toMatch(/Content-Disposition: form-data; name="test"\s+data/)
      expect(interceptedRequestBody).toMatch(
        /Content-Disposition: form-data; name="sample"; filename="sample.txt"\s+Content-Type: text\/plain\s+Lorem ipsum/,
      )
      expect(interceptedRequestBody).toMatch(
        /Content-Disposition: form-data; name="object"\s+Content-Type: application\/json\s+\{"key":"value","array":\[1,2]}/,
      )
      expect(interceptedRequestBody).toMatch(/Content-Disposition: form-data; name="array"\s+value1/)
      expect(interceptedRequestBody).toMatch(/Content-Disposition: form-data; name="array"\s+value2/)
      expect(interceptedRequestBody).not.toContain('undefinedProp')
      expect(interceptedRequestBody).not.toContain('nullProp')
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
        .reply(200, 'this is some file content', { 'Content-Type': 'application/x-zip-compressed' })

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
        .reply(200, 'some user file content', { 'Content-Type': 'application/x-zip-compressed' })

      const readable = await restClient.stream({ path: '/test-file' }, userAuthOptions)
      const receivedData = await readAll(readable)

      expect(receivedData).toEqual('some user file content')
      expect(nock.isDone()).toBe(true)
    })

    it('should stream data without auth if undefined', async () => {
      nock('http://localhost:8080')
        .matchHeader('authorization', val => val === undefined)
        .get('/api/test-file')
        .reply(200, 'public file content', { 'Content-Type': 'application/x-zip-compressed' })

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
        .reply(200, 'stream content for raw token', { 'Content-Type': 'application/x-zip-compressed' })

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
        .reply(200, 'content with custom header', { 'Content-Type': 'application/x-zip-compressed' })

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

  describe('make bespoke rest call', () => {
    afterEach(() => {
      nock.cleanAll()
    })

    it('should get data successfully with a system token', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer some_system_jwt' },
      })
        .get('/api/some-path')
        .reply(200, { message: 'some response' })

      const receivedData = await restClient.makeRestClientCall<string>(
        systemAuthOptions,
        async ({ superagent, token, agent }: CallContext): Promise<string> => {
          const result = await superagent
            .get(`http://localhost:8080/api/some-path`)
            .auth(token as string, { type: 'bearer' })
            .agent(agent)

          return result.body.message
        },
      )

      expect(receivedData).toEqual('some response')
      expect(nock.isDone()).toBe(true)
    })
  })
})
