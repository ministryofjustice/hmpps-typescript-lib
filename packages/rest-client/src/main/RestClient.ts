import { HttpAgent, HttpsAgent } from 'agentkeepalive'
import superagent, { ResponseError } from 'superagent'
import { Readable } from 'stream'
import type Logger from 'bunyan'
import sanitiseError from './helpers/sanitiseError'
import { ApiConfig } from './types/ApiConfig'
import { AuthOptions, Token } from './types/AuthOptions'
import { Request, RequestWithBody, StreamRequest } from './types/Request'

export default abstract class RestClient {
  private readonly agent: HttpAgent

  protected constructor(
    private readonly name: string,
    private readonly config: ApiConfig,
    private readonly logger: Logger | Console,
    private readonly getSystemToken: (username?: string) => Promise<string>,
  ) {
    this.agent = config.url.startsWith('https') ? new HttpsAgent(config.agent) : new HttpAgent(config.agent)
  }

  private apiUrl() {
    return this.config.url
  }

  private timeoutConfig() {
    return this.config.timeout
  }

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

  async patch<Response = unknown>(request: RequestWithBody, authOptions: AuthOptions): Promise<Response> {
    return this.requestWithBody('patch', request, authOptions)
  }

  async post<Response = unknown>(request: RequestWithBody, authOptions: AuthOptions): Promise<Response> {
    return this.requestWithBody('post', request, authOptions)
  }

  async put<Response = unknown>(request: RequestWithBody, authOptions: AuthOptions): Promise<Response> {
    return this.requestWithBody('put', request, authOptions)
  }

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
            s.push(response.body)
            s.push(null)
            resolve(s)
          }
        })
    })
  }

  private async resolveToken(authOptions: AuthOptions): Promise<string> {
    const { client, user } = authOptions

    if (client === Token.SYSTEM_TOKEN) {
      return this.getSystemToken(user.username)
    }

    if (!user.token) {
      throw new Error('No user token provided for user-token call')
    }

    return user.token
  }
}
