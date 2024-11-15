import nock from 'nock'

export const createTestNock = ({
  method,
  baseUrl,
  path,
}: {
  method: 'get' | 'post' | 'put' | 'delete' | 'patch'
  baseUrl: string
  path: string
}) => {
  const scope = nock(baseUrl)
  const uniquePath = `${path}/${Math.random().toString(36).substring(2, 8)}`

  return {
    scope: scope.persist()[method](uniquePath),
    fullUrl: `${baseUrl}${uniquePath}`,
    uniquePath,
    baseUrl,
    done: () => scope.done(),
  }
}

export const createHealthComponentMock = (isHealthy = true, isEnabled = true) => {
  const name = `mock-component-${Math.random().toString(36).substring(2, 8)}`
  return {
    isEnabled: jest.fn().mockResolvedValue(isEnabled),
    health: jest.fn().mockResolvedValue({
      name,
      status: isHealthy ? 'UP' : 'DOWN',
    }),
    options: {
      name,
    },
  }
}
