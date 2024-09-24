import HealthCheck from './HealthCheck'
import { createHealthComponentMock } from '../test/utils'

describe('HealthCheck', () => {
  let healthCheckComponents: ReturnType<typeof createHealthComponentMock>[]
  let healthChecker: HealthCheck

  beforeEach(() => {
    healthCheckComponents = [createHealthComponentMock(), createHealthComponentMock()]
  })

  describe('check', () => {
    it('should return UP status if no components', async () => {
      healthCheckComponents = []
      healthChecker = new HealthCheck(healthCheckComponents)

      const result = await healthChecker.check()
      const expectedResult = {
        status: 'UP',
      }

      expect(result).toEqual(expectedResult)
    })

    it('should return UP status if all components healthy', async () => {
      healthChecker = new HealthCheck(healthCheckComponents)

      const result = await healthChecker.check()
      const expectedResult = {
        status: 'UP',
        components: [
          {
            name: healthCheckComponents[0].options.name,
            status: 'UP',
          },
          {
            name: healthCheckComponents[1].options.name,
            status: 'UP',
          },
        ],
      }

      expect(result).toEqual(expectedResult)
    })

    it('should return DOWN status if any components healthy', async () => {
      healthCheckComponents[1] = createHealthComponentMock(false)
      healthChecker = new HealthCheck(healthCheckComponents)

      const result = await healthChecker.check()
      const expectedResult = {
        status: 'DOWN',
        components: [
          {
            name: healthCheckComponents[0].options.name,
            status: 'UP',
          },
          {
            name: healthCheckComponents[1].options.name,
            status: 'DOWN',
          },
        ],
      }

      expect(result).toEqual(expectedResult)
    })
  })
})
