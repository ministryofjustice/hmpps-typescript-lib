export interface ShortDeploymentInfo {
  build: {
    buildNumber: string
    gitRef: string
  }
  version: string
  uptime: number
}

export interface ExtendedDeploymentInfo {
  git: {
    branch: string
  }
  build: {
    artifact: string
    version: string
    name: string
  }
  uptime: number
  productId: string
}

/**
 * Contains information about the application's build and version.
 */
export interface ApplicationInfo {
  /** The build number of the application. */
  buildNumber: string
  /** The name of the application. */
  applicationName: string
  /** The service catalogue/product ID associated with the application. */
  productId: string
  /** The name of the branch from which the application was built. */
  branchName: string
  /** The reference (commit hash) of the build. */
  gitRef: string
  /** Additional fields that should be surfaced via the /info endpoint. */
  additionalFields?: Record<string, unknown>
}
