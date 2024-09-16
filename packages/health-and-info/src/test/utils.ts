// eslint-disable-next-line import/no-extraneous-dependencies
import nock from 'nock'

// eslint-disable-next-line import/prefer-default-export
export const createTestNock = (
  method: 'get' | 'post' | 'put' | 'delete' | 'patch',
  baseUrl: string = 'https://test.local',
) => {
  const uniquePath = `/test/${Math.random().toString(36).substring(2, 8)}`
  const scope = nock(baseUrl)

  return {
    scope: scope.persist()[method](uniquePath),
    url: `${baseUrl}${uniquePath}`,
    done: () => scope.done(),
  }
}
