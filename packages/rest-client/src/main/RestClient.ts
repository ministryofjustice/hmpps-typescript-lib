import { HttpAgent, HttpsAgent } from 'agentkeepalive'
import superagent, { ResponseError } from 'superagent'
import { Readable } from 'stream'
import type Logger from 'bunyan'
import sanitiseError from './helpers/sanitiseError'
import { ApiConfig } from './types/ApiConfig'
import { AuthOptions, TokenType } from './types/AuthOptions'
import { Request, RequestWithBody, StreamRequest } from './types/Request'
import AuthenticationClient from './types/AuthenticationClient'

/**
 * Abstract base class for REST API clients.
 */
export default abstract class RestClient {
  private readonly agent: HttpAgent

  /**
   * Creates an instance of RestClient.
   *
   * @param name - The name of the API client.
   * @param config - The API configuration, including URL, timeout, and agent options.
   * @param logger - A logger instance for logging.
   * @param authenticationClient - The client responsible for retrieving authentication tokens.
   */
  protected constructor(
    private readonly name: string,
    private readonly config: ApiConfig,
    private readonly logger: Logger | Console,
    private readonly authenticationClient: AuthenticationClient,
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
   * Returns a retry handler function.
   *
   * @param retry - Indicates whether to retry the request.
   * @returns A function that handles retries.
   */
  private handleRetry(retry: boolean = true) {
    return (err: Error) => {
      if (!retry) {
        return false
      }

      if (err) {
        this.logger.info(`Retry handler found API error with ${err.name} - ${err.message}`)
      }

      return undefined
    }
  }

  /**
   * Sends a GET request to the API.
   *
   * @param request - The request options including path, query, headers, responseType, and raw flag.
   * @param authOptions - The authentication options containing token type and user details.
   * @returns The response body or the full response if raw is true.
   * @throws Sanitised error if the request fails.
   */
  async get<Response = unknown>(
    { path, query = {}, headers = {}, responseType = '', raw = false }: Request,
    authOptions: AuthOptions,
  ): Promise<Response> {
    this.logger.info(`${this.name} GET: ${path}`)

    const token = await this.resolveToken(authOptions)

    try {
      const result = await superagent
        .get(`${this.apiUrl()}${path}`)
        .query(query)
        .agent(this.agent)
        .retry(2, this.handleRetry())
        .auth(token, { type: 'bearer' })
        .set(headers)
        .responseType(responseType)
        .timeout(this.timeoutConfig())

      return raw ? (result as unknown as Response) : result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error as ResponseError)
      this.logger.warn({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}', verb: 'GET'`)
      throw sanitisedError
    }
  }

  /**
   * Sends a request with a body (PATCH, POST, or PUT) to the API.
   *
   * @param method - The HTTP method ('patch', 'post', or 'put').
   * @param request - The request options including path, query, headers, responseType, data, raw flag, and retry flag.
   * @param authOptions - The authentication options containing token type and user details.
   * @returns The response body or the full response if raw is true.
   * @throws Sanitised error if the request fails.
   */
  private async requestWithBody<Response = unknown>(
    method: 'patch' | 'post' | 'put',
    { path, query = {}, headers = {}, responseType = '', data = {}, raw = false, retry = false }: RequestWithBody,
    authOptions: AuthOptions,
  ): Promise<Response> {
    this.logger.info(`${this.name} ${method.toUpperCase()}: ${path}`)

    const token = await this.resolveToken(authOptions)

    try {
      const result = await superagent[method](`${this.apiUrl()}${path}`)
        .query(query)
        .send(data)
        .agent(this.agent)
        .retry(2, this.handleRetry(retry))
        .auth(token, { type: 'bearer' })
        .set(headers)
        .responseType(responseType)
        .timeout(this.timeoutConfig())

      return raw ? (result as unknown as Response) : result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error as ResponseError)
      this.logger.warn(
        { ...sanitisedError },
        `Error calling ${this.name}, path: '${path}', verb: '${method.toUpperCase()}'`,
      )
      throw sanitisedError
    }
  }

  /**
   * Sends a PATCH request to the API.
   *
   * @param request - The PATCH request options.
   * @param authOptions - The authentication options.
   * @returns The response body.
   */
  async patch<Response = unknown>(request: RequestWithBody, authOptions: AuthOptions): Promise<Response> {
    return this.requestWithBody('patch', request, authOptions)
  }

  /**
   * Sends a POST request to the API.
   *
   * @param request - The POST request options.
   * @param authOptions - The authentication options.
   * @returns The response body.
   */
  async post<Response = unknown>(request: RequestWithBody, authOptions: AuthOptions): Promise<Response> {
    return this.requestWithBody('post', request, authOptions)
  }

  /**
   * Sends a PUT request to the API.
   *
   * @param request - The PUT request options.
   * @param authOptions - The authentication options.
   * @returns The response body.
   */
  async put<Response = unknown>(request: RequestWithBody, authOptions: AuthOptions): Promise<Response> {
    return this.requestWithBody('put', request, authOptions)
  }

  /**
   * Sends a DELETE request to the API.
   *
   * @param request - The DELETE request options including path, query, headers, responseType, and raw flag.
   * @param authOptions - The authentication options.
   * @returns The response body.
   * @throws Sanitised error if the request fails.
   */
  async delete<Response = unknown>(
    { path, query = {}, headers = {}, responseType = '', raw = false }: Request,
    authOptions: AuthOptions,
  ): Promise<Response> {
    this.logger.info(`${this.name} DELETE: ${path}`)

    const token = await this.resolveToken(authOptions)

    try {
      const result = await superagent
        .delete(`${this.apiUrl()}${path}`)
        .query(query)
        .agent(this.agent)
        .retry(2, this.handleRetry())
        .auth(token, { type: 'bearer' })
        .set(headers)
        .responseType(responseType)
        .timeout(this.timeoutConfig())

      return raw ? (result as unknown as Response) : result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error as ResponseError)
      this.logger.warn({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}', verb: 'DELETE'`)
      throw sanitisedError
    }
  }

  /**
   * Streams data from the API.
   *
   * @param request - The stream request options including path and headers.
   * @param authOptions - The authentication options.
   * @returns A Readable stream containing the response data.
   * @throws An error if the streaming request fails.
   */
  // eslint-disable-next-line default-param-last
  async stream({ path, headers = {} }: StreamRequest = {}, authOptions: AuthOptions): Promise<Readable> {
    this.logger.info(`${this.name} streaming: ${path}`)

    const token = await this.resolveToken(authOptions)

    return new Promise((resolve, reject) => {
      superagent
        .get(`${this.apiUrl()}${path}`)
        .agent(this.agent)
        .auth(token, { type: 'bearer' })
        .retry(2, this.handleRetry())
        .timeout(this.timeoutConfig())
        .set(headers)
        .end((error, response) => {
          if (error) {
            this.logger.warn(sanitiseError(error), `Error calling ${this.name}`)
            reject(error)
          } else if (response) {
            const s = new Readable()
            // eslint-disable-next-line no-underscore-dangle
            s._read = () => {}
            s.push(response.text)
            s.push(null)
            resolve(s)
          }
        })
    })
  }

  /**
   * Resolves an authentication token based on the provided authentication options.
   *
   * @param authOptions - The authentication options containing token type and user details.
   * @returns A promise that resolves to the authentication token.
   * @throws An error if no user token is provided for user-token calls.
   */
  private resolveToken(authOptions: AuthOptions): Promise<string> {
    const { tokenType, user } = authOptions
    if (tokenType === TokenType.SYSTEM_TOKEN) {
      return this.authenticationClient.getToken(user.username)
    }

    if (!user.token) {
      throw new Error('No user token provided for user-token call')
    }
    return Promise.resolve(user.token)
  }
}
