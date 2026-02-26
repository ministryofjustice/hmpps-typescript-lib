import { HttpAgent, HttpsAgent } from 'agentkeepalive'
import superagent, { Response, ResponseError, Request as SuperAgentRequest } from 'superagent'
import { Readable } from 'stream'
import type Logger from 'bunyan'
import sanitiseError from './helpers/sanitiseError'
import { ApiConfig } from './types/ApiConfig'
import { AuthOptions, TokenType } from './types/AuthOptions'
import { Call, Request, RequestWithBody, StreamRequest } from './types/Request'
import { AuthenticationClient } from './types/AuthenticationClient'
import { RetryError, SanitisedError } from './types/Errors'

/**
 * Base class for REST API clients.
 */
export default class RestClient {
  private readonly agent: HttpAgent

  /**
   * Creates an instance of RestClient.
   *
   * @param name - The name of the API client.
   * @param config - The API configuration, including URL, timeout, and agent options.
   * @param logger - A logger instance for logging.
   * @param authenticationClient - (Optional) The client responsible for retrieving system authentication tokens.
   */
  constructor(
    protected readonly name: string,
    protected readonly config: ApiConfig,
    protected readonly logger: Logger | Console,
    private readonly authenticationClient?: AuthenticationClient,
  ) {
    this.agent = config.url.startsWith('https') ? new HttpsAgent(config.agent) : new HttpAgent(config.agent)
  }

  /**
   * Retrieves the base API URL.
   *
   * @returns The base API URL.
   */
  private apiUrl(): string {
    return this.config.url
  }

  /**
   * Retrieves the timeout configuration.
   *
   * @returns The timeout configuration.
   */
  private timeoutConfig() {
    return this.config.timeout
  }

  /**
   * Provides a default mechanism for handling errors
   *  @param path - path of current request
   *  @param method - verb of HTTP request
   *  @param error - the sanitised error
   *
   *  @returns an optional custom response
   *  @throws an optional error
   */
  protected handleError<Response, ErrorData>(path: string, method: string, error: SanitisedError<ErrorData>): Response {
    this.logger.warn({ ...error }, `Error calling ${this.name}, path: '${path}', verb: '${method}'`)
    throw error
  }

  /**
   * Provides a default mechanism for logging errors
   *  @param path - path of current request
   *  @param method - verb of HTTP request
   *  @param error - the sanitised error
   */
  protected logError<ErrorData>(path: string, method: string, error: SanitisedError<ErrorData>) {
    this.logger.warn({ ...error }, `Error calling ${this.name}, path: '${path}', verb: '${method}'`)
  }

  private readonly ERROR_CODES = new Set([
    'ETIMEDOUT',
    'ECONNRESET',
    'EADDRINUSE',
    'ECONNREFUSED',
    'EPIPE',
    'ENOTFOUND',
    'ENETUNREACH',
    'EAI_AGAIN',
  ])

  private readonly STATUS_CODES = new Set([408, 413, 429, 500, 502, 503, 504, 521, 522, 524])

  /**
   * Returns a retry handler function.
   *
   * @param retry - Indicates whether to retry the request.
   * @returns A function that handles retries.
   */
  private handleRetry(retry: boolean = true) {
    return (error: RetryError, res?: Response) => {
      if (!retry) {
        return false
      }

      if (res && this.STATUS_CODES.has(res.status)) {
        this.logger.info(`Retry handler found API error with status code ${res.status}`)
        return true
      }

      if (error) {
        this.logger.info(`Retry handler found API error with ${error.name} - ${error.message}`)
        if (
          (error?.code && this.ERROR_CODES.has(error.code)) ||
          (error.timeout && error?.code === 'ECONNABORTED') ||
          error.crossDomain
        ) {
          return true
        }
      }

      return false
    }
  }

  /**
   * Sends a GET request to the API.
   *
   * @param request - The request options including path, query, headers, responseType, and raw flag.
   * @param authOptions - (Optional) Either an AuthOptions object, a raw JWT string, or undefined for no auth.
   * @returns The response body or the full response if raw is true.
   * @throws {SanitisedError<ErrorData>} if the request fails. Note that this is the default behaviour, but can be
   *         changed to a different type by specifying a custom errorHandler.
   */
  async get<Response = unknown, ErrorData = unknown>(
    {
      path,
      query = {},
      headers = {},
      responseType = '',
      raw = false,
      retries = 2,
      errorHandler = this.handleError,
      retryHandler = this.handleRetry,
    }: Request<Response, ErrorData>,
    authOptions?: AuthOptions | string,
  ): Promise<Response> {
    this.logger.info(`${this.name} GET: ${path}`)

    // 1) Resolve the token (if any)
    const token = await this.resolveToken(authOptions)

    try {
      // 2) Build the request
      const req = superagent
        .get(`${this.apiUrl()}${path}`)
        .query(query)
        .agent(this.agent)
        .retry(retries, retryHandler.bind(this)())
        .set(headers)
        .responseType(responseType)
        .timeout(this.timeoutConfig())

      if (token) {
        req.auth(token, { type: 'bearer' })
      }

      const result = await req
      return raw ? (result as unknown as Response) : result.body
    } catch (error) {
      const sanitisedError = sanitiseError<ErrorData>(error as ResponseError)
      return errorHandler.bind(this)(path, 'GET', sanitisedError)
    }
  }

  /**
   * Sends a request with a body (PATCH, POST, or PUT) to the API.
   *
   * @param method - The HTTP method ('patch', 'post', or 'put').
   * @param request - The request options including path, query, headers, responseType, data, raw flag, and retry flag.
   * @param authOptions - (Optional) Either an AuthOptions object, a raw JWT string, or undefined for no auth.
   * @returns The response body or the full response if raw is true.
   * @throws {SanitisedError<ErrorData>} if the request fails. Note that this is the default behaviour, but can be
   *         changed to a different type by specifying a custom errorHandler.
   */
  private async requestWithBody<Response = unknown, ErrorData = unknown>(
    method: 'patch' | 'post' | 'put',
    {
      path,
      query = {},
      headers = {},
      responseType = '',
      data,
      multipartData,
      files,
      raw = false,
      retry = false,
      errorHandler = this.handleError,
      retryHandler = this.handleRetry,
    }: RequestWithBody<Response, ErrorData>,
    authOptions?: AuthOptions | string,
  ): Promise<Response> {
    this.logger.info(`${this.name} ${method.toUpperCase()}: ${path}`)

    const token = await this.resolveToken(authOptions)

    try {
      let req: SuperAgentRequest

      if (multipartData || files) {
        req = superagent[method](`${this.apiUrl()}${path}`)
          .type('form')
          .query(query)
          .agent(this.agent)
          .retry(2, retryHandler.bind(this)(retry))
          .set(headers)
          .responseType(responseType)
          .timeout(this.timeoutConfig())

        if (multipartData) {
          Object.entries(multipartData).forEach(([key, value]) => {
            req.field(key, value)
          })
        }

        if (files) {
          Object.entries(files).forEach(([key, file]) => {
            req.attach(key, file.buffer, file.originalname?.replaceAll("'", ''))
          })
        }
      } else {
        req = superagent[method](`${this.apiUrl()}${path}`)
          .query(query)
          .send(data)
          .agent(this.agent)
          .retry(2, retryHandler.bind(this)(retry))
          .set(headers)
          .responseType(responseType)
          .timeout(this.timeoutConfig())
      }

      if (token) {
        req.auth(token, { type: 'bearer' })
      }

      const result = await req
      return raw ? (result as unknown as Response) : result.body
    } catch (error) {
      const sanitisedError = sanitiseError<ErrorData>(error as ResponseError)
      return errorHandler.bind(this)(path, method.toUpperCase(), sanitisedError)
    }
  }

  /**
   * Sends a PATCH request to the API.
   *
   * @param request - The PATCH request options.
   * @param authOptions - The authentication options.
   * @returns The response body.
   * @throws {SanitisedError<ErrorData>} if the request fails. Note that this is the default behaviour, but can be
   *         changed to a different type by specifying a custom errorHandler.
   */
  async patch<Response = unknown, ErrorData = unknown>(
    request: RequestWithBody<Response, ErrorData>,
    authOptions?: AuthOptions | string,
  ): Promise<Response> {
    return this.requestWithBody<Response, ErrorData>('patch', request, authOptions)
  }

  /**
   * Sends a POST request to the API.
   *
   * @param request - The POST request options.
   * @param authOptions - The authentication options.
   * @returns The response body.
   * @throws {SanitisedError<ErrorData>} if the request fails. Note that this is the default behaviour, but can be
   *         changed to a different type by specifying a custom errorHandler.
   */
  async post<Response = unknown, ErrorData = unknown>(
    request: RequestWithBody<Response, ErrorData>,
    authOptions?: AuthOptions | string,
  ): Promise<Response> {
    return this.requestWithBody<Response, ErrorData>('post', request, authOptions)
  }

  /**
   * Sends a PUT request to the API.
   *
   * @param request - The PUT request options.
   * @param authOptions - The authentication options.
   * @returns The response body.
   * @throws {SanitisedError<ErrorData>} if the request fails. Note that this is the default behaviour, but can be
   *         changed to a different type by specifying a custom errorHandler.
   */
  async put<Response = unknown, ErrorData = unknown>(
    request: RequestWithBody<Response, ErrorData>,
    authOptions?: AuthOptions | string,
  ): Promise<Response> {
    return this.requestWithBody<Response, ErrorData>('put', request, authOptions)
  }

  /**
   * Sends a DELETE request to the API.
   *
   * @param request - The DELETE request options including path, query, headers, responseType, and raw flag.
   * @param authOptions - (Optional) Either an AuthOptions object, a raw JWT string, or undefined for no auth.
   * @returns The response body.
   * @throws {SanitisedError<ErrorData>} if the request fails. Note that this is the default behaviour, but can be
   *         changed to a different type by specifying a custom errorHandler.
   */
  async delete<Response = unknown, ErrorData = unknown>(
    {
      path,
      query = {},
      headers = {},
      responseType = '',
      raw = false,
      retries = 2,
      errorHandler = this.handleError,
      retryHandler = this.handleRetry,
    }: Request<Response, ErrorData>,
    authOptions?: AuthOptions | string,
  ): Promise<Response> {
    this.logger.info(`${this.name} DELETE: ${path}`)

    const token = await this.resolveToken(authOptions)

    try {
      const req = superagent
        .delete(`${this.apiUrl()}${path}`)
        .query(query)
        .agent(this.agent)
        .retry(retries, retryHandler.bind(this)())
        .set(headers)
        .responseType(responseType)
        .timeout(this.timeoutConfig())

      if (token) {
        req.auth(token, { type: 'bearer' })
      }

      const result = await req
      return raw ? (result as unknown as Response) : result.body
    } catch (error) {
      const sanitisedError = sanitiseError<ErrorData>(error as ResponseError)
      return errorHandler.bind(this)(path, 'DELETE', sanitisedError)
    }
  }

  /**
   * Streams data from the API.
   *
   * @param request - The stream request options including path and headers.
   * @param authOptions - (Optional) Either an AuthOptions object, a raw JWT string, or undefined for no auth.
   * @returns A Readable stream containing the response data. If this request fails then the promise is rejected with
   *          type SanitisedError<ErrorData>.
   */
  async stream<ErrorData = unknown>(
    { path, headers = {}, errorLogger = this.logError }: StreamRequest<ErrorData>,
    authOptions?: AuthOptions | string,
  ): Promise<Readable> {
    this.logger.info(`${this.name} streaming: ${path}`)

    const token = await this.resolveToken(authOptions)

    return new Promise((resolve, reject) => {
      const req = superagent
        .get(`${this.apiUrl()}${path}`)
        .agent(this.agent)
        .retry(2, this.handleRetry())
        .timeout(this.timeoutConfig())
        .set(headers)

      if (token) {
        req.auth(token, { type: 'bearer' })
      }

      req.end((error, response) => {
        if (error) {
          const sanitisedError = sanitiseError<ErrorData>(error as ResponseError)
          errorLogger.bind(this)(path, 'GET', sanitisedError)
          reject(sanitisedError)
        } else if (response) {
          const s = new Readable()
          // eslint-disable-next-line no-underscore-dangle
          s._read = () => {}
          s.push(response.body)
          s.push(null)
          resolve(s)
        }
      })
    })
  }

  /**
   * Make a request using underlying superagent instance, potentially getting a token.
   *
   * In an ideal world, this would rarely be used but provides an escape hatch to cater for bespoke usecases.
   *
   * @param call - A callback that provides the client a token and the underlying superagent instance.
   * @param authOptions - The authentication options for this call.
   * @returns The response body.
   */
  async makeRestClientCall<Response = unknown>(
    authOptions: AuthOptions | string,
    call: Call<Response>,
  ): Promise<Response> {
    const token = await this.resolveToken(authOptions)
    return call({ superagent, token, agent: this.agent })
  }

  /**
   * Resolves an authentication token from several possible inputs:
   *  1) A raw JWT string
   *  2) An AuthOptions object referencing a system or user token
   *  3) Undefined (no token)
   *
   * @param authOptions - AuthOptions, a raw token string, or undefined (no auth).
   * @returns A promise that resolves to the authentication token or undefined if no auth.
   * @throws An error if no user token is provided for user-token calls.
   * @throws An error if no authentication client is provided for system token calls.
   */
  private async resolveToken(authOptions?: AuthOptions | string): Promise<string | undefined> {
    if (!authOptions) {
      return undefined
    }

    if (typeof authOptions === 'string') {
      return authOptions
    }

    const { tokenType, user } = authOptions

    if (tokenType === TokenType.SYSTEM_TOKEN) {
      if (!this.authenticationClient) {
        throw new Error('No authentication client provided for system tokens')
      }

      return this.authenticationClient.getToken(user.username)
    }

    if (!user.token) {
      throw new Error('No user token provided for user-token call')
    }

    return user.token
  }
}
