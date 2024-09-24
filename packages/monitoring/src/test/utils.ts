import nock from 'nock'

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
