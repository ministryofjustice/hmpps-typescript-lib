import { URLSearchParams } from 'url'
import superagent from 'superagent'
import type Logger from 'bunyan'
import { ApiConfig } from '../types/ApiConfig'
import TokenStore from '../types/TokenStore'

export interface AuthConfig extends ApiConfig {
  systemClientId: string
  systemClientSecret: string
}

export default async function getSystemClientTokenFromHmppsAuth(
  authConfig: AuthConfig,
  tokenStore: TokenStore,
  logger: Logger | Console,
  username?: string,
): Promise<string> {
  const key = username || '%ANONYMOUS%'
  const existingToken = await tokenStore.getToken(key)

  if (existingToken) {
    return existingToken
  }

  const clientToken = Buffer.from(`${authConfig.systemClientId}:${authConfig.systemClientSecret}`).toString('base64')

  const grantRequest = new URLSearchParams({
    grant_type: 'client_credentials',
    ...(username && { username }),
  }).toString()

  logger.info(`${grantRequest} HMPPS Auth request for client id '${authConfig.systemClientId}'`)

  const response = await superagent
    .post(`${authConfig.url}/oauth/token`)
    .set('Authorization', `Basic ${clientToken}`)
    .set('content-type', 'application/x-www-form-urlencoded')
    .send(grantRequest)
    .timeout(authConfig.timeout)

  const newToken = response.body.access_token
  const expiresIn = response.body.expires_in - 60

  await tokenStore.setToken(key, newToken, expiresIn)

  return newToken
}
