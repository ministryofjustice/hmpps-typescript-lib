import { ConfigurationReader, PackageLock, Config } from './types/configuration-loading'

const DEFAULT_ALLOWED_SCRIPTS = ['preinstall', 'install', 'postinstall']

export const readConfiguration: ConfigurationReader = (config: Config, packageLock: PackageLock) => {
  const configuredAllowlist = Object.entries(config.allowlist)
  const dependencyScriptsToRun = config.dependencyScriptsToRun || DEFAULT_ALLOWED_SCRIPTS
  const localScriptsToRun = config.localScriptsToRun || DEFAULT_ALLOWED_SCRIPTS

  const packagesWithScripts = Object.entries(packageLock.packages)
    .map(([name, { version, hasInstallScript }]) => ({ name, version, hasInstallScript }))
    .filter(pkg => pkg.hasInstallScript)
    .map(pkg => {
      const nameWithVersion = `${pkg.name}@${pkg.version}`
      const configuredPackage = configuredAllowlist.find(([name]) => nameWithVersion === name)
      const isConfigured = Boolean(configuredPackage)
      return {
        ...pkg,
        nameWithVersion,
        configured: isConfigured,
        status: configuredPackage ? configuredPackage[1] : '<MISSING>',
      }
    })

  const installedPackagesWithScripts = packagesWithScripts.map(pkg => pkg.nameWithVersion)

  const packagesToRemove = Object.keys(config.allowlist).filter(pkg => !installedPackagesWithScripts.includes(pkg))
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
    },
  }
}
