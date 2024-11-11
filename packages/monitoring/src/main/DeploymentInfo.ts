import { ApplicationInfo, ExtendedDeploymentInfo, ShortDeploymentInfo } from './types/DeploymentInfoType'

export default class DeploymentInfo {
  constructor(private readonly applicationInfo: ApplicationInfo) {}

  getShortInfo(): ShortDeploymentInfo {
    return {
      build: {
        buildNumber: this.applicationInfo.buildNumber,
        gitRef: this.applicationInfo.gitRef,
      },
      version: this.applicationInfo.buildNumber,
      uptime: Math.floor(process.uptime()),
    }
  }

  getFullInfo(): ExtendedDeploymentInfo {
    return {
      git: {
        branch: this.applicationInfo.branchName,
      },
      build: {
        artifact: this.applicationInfo.applicationName,
        version: this.applicationInfo.buildNumber,
        name: this.applicationInfo.applicationName,
      },
      productId: this.applicationInfo.productId,
      uptime: Math.floor(process.uptime()),
      ...(this.applicationInfo.additionalFields || {}),
    }
  }
}
