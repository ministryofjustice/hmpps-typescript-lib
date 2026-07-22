import { Config, ConfigurationReader, PackageLock, ScriptRunStatus } from './types/configuration-loading'
import { resolvePackage, satisfiesVersion } from './version-resolver'

const ALL_INSTALL_SCRIPTS = ['preinstall', 'install', 'prepare', 'postinstall']

export const readConfiguration: ConfigurationReader = (config: Config, packageLock: PackageLock) => {
  const configuredAllowlist = Object.entries(config.allowlist)
  const dependencyScriptsToRun = config.dependencyScriptsToRun || ALL_INSTALL_SCRIPTS
  const localScriptsToRun = config.localScriptsToRun || ALL_INSTALL_SCRIPTS

  const packagesWithScripts = Object.entries(packageLock.packages)
    .map(([name, { version, hasInstallScript }]) => ({ name, version, hasInstallScript }))
    .filter(pkg => pkg.hasInstallScript)
    .map(pkg => {
      const nameWithVersion = `${pkg.name}@${pkg.version}`
      const mode = resolvePackage(configuredAllowlist, pkg.name, pkg.version)
      return {
        ...pkg,
        nameWithVersion,
        configured: Boolean(mode),
        status: mode || ('<MISSING>' as ScriptRunStatus),
      }
    })

  const configuredPackages = configuredAllowlist
    .filter(([configuredPackage]) =>
      packagesWithScripts.some(pkg => satisfiesVersion(configuredPackage, pkg.name, pkg.version)),
    )
    .map(([configuredPackage]) => configuredPackage)

  const packagesToRemove = Object.keys(config.allowlist).filter(pkg => !configuredPackages.includes(pkg))
  const removedPackagesToPrint = packagesToRemove.map(pkg => [pkg, '<REMOVED>'])
  const configToPrint = Object.fromEntries(
    removedPackagesToPrint
      .concat(packagesWithScripts.map(pkg => [pkg.nameWithVersion, pkg.status]))
      .sort(([a], [b]) => a.localeCompare(b)),
  )
  const packagesToConfigure = packagesWithScripts.filter(pkg => !pkg.configured)
  const packagesToRun = packagesWithScripts.filter(pkg => pkg.status === 'ALLOW').map(pkg => pkg.name)

  return {
    configToPrint,
    packages: {
      toRun: packagesToRun,
      toConfigure: packagesToConfigure,
      toRemove: packagesToRemove,
      incorrectlyConfigured: Boolean(packagesToConfigure.length) || Boolean(packagesToRemove.length),
    },
    scripts: {
      dependencyScriptsToRun,
      localScriptsToRun,
      allInstallScripts: ALL_INSTALL_SCRIPTS,
    },
  }
}
