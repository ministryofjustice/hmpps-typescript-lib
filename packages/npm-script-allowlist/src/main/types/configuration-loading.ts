export type ScriptRunMode = 'ALLOW' | 'FORBID'

export type Config = {
  localScriptsToRun?: string[]
  dependencyScriptsToRun?: string[]
  allowlist: Record<string, ScriptRunMode>
}

export type PackageLock = {
  packages: Record<
    string,
    {
      version: string
      hasInstallScript: boolean
    }
  >
}

export type ConfiguredPackage = {
  configured: boolean
  status: string
  nameWithVersion: string
  name: string
  version: string
  hasInstallScript: boolean
}

export type DerivedConfiguration = {
  configToPrint: Config
  packages: {
    toRun: string[]
    toConfigure: ConfiguredPackage[]
    toRemove: string[]
    incorrectlyConfigured: boolean
  }
  scripts: {
    dependencyScriptsToRun: string[]
    localScriptsToRun: string[]
    allInstallScripts: string[]
  }
}

export type ConfigurationReader = (config: Config, packageLock: PackageLock) => DerivedConfiguration
