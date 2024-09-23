import DeploymentInfo from './DeploymentInfo'
import { ApplicationInfo } from './types/DeploymentInfoType'

describe('DeploymentInfo', () => {
  let mockApplicationInfo: ApplicationInfo
  let deploymentInfo: DeploymentInfo

  beforeEach(() => {
    mockApplicationInfo = {
      buildNumber: '1.0.0',
      gitRef: 'abc123',
      branchName: 'main',
      applicationName: 'my-app',
      productId: 'prod-123',
    }

    deploymentInfo = new DeploymentInfo(mockApplicationInfo)

    jest.spyOn(process, 'uptime').mockReturnValue(12345)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getShortInfo', () => {
    it('should return short deployment info', () => {
      const expectedShortInfo = {
        build: {
          buildNumber: mockApplicationInfo.buildNumber,
          gitRef: mockApplicationInfo.gitRef,
        },
        version: mockApplicationInfo.buildNumber,
        uptime: 12345, // Mocked process uptime
      }

      expect(deploymentInfo.getShortInfo()).toEqual(expectedShortInfo)
    })
  })

  describe('getFullInfo', () => {
    it('should return full deployment info', () => {
      const expectedFullInfo = {
        git: {
          branch: mockApplicationInfo.branchName,
        },
        build: {
          artifact: mockApplicationInfo.applicationName,
          version: mockApplicationInfo.buildNumber,
          name: mockApplicationInfo.applicationName,
        },
        productId: mockApplicationInfo.productId,
        uptime: 12345,
      }

      expect(deploymentInfo.getFullInfo()).toEqual(expectedFullInfo)
    })

    it('should return full deployment info without productId when productId is not provided', () => {
      const mockApplicationInfoWithoutProductId = {
        ...mockApplicationInfo,
        productId: undefined,
      }

      deploymentInfo = new DeploymentInfo(mockApplicationInfoWithoutProductId)

      const expectedFullInfoWithoutProductId = {
        git: {
          branch: mockApplicationInfoWithoutProductId.branchName,
        },
        build: {
          artifact: mockApplicationInfoWithoutProductId.applicationName,
          version: mockApplicationInfoWithoutProductId.buildNumber,
          name: mockApplicationInfoWithoutProductId.applicationName,
        },
        productId: undefined,
        uptime: 12345,
      }

      expect(deploymentInfo.getFullInfo()).toEqual(expectedFullInfoWithoutProductId)
    })
  })
})
