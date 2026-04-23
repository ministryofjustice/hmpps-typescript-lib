import { Config } from './project-configuration'
import { ConfigurationReader, ConfiguredPackage } from './types/configuration-loading'
import { PackageFetcher } from './types/package-fetching'

export type Dependencies = {
  readFile: (path: string) => string
  dynamicImport: (path: string) => Promise<{ default: unknown }>
  log: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
  exit: (code: number) => never
  runScript: (opts: { path: string; event: string }) => Promise<void>
  fetchPackageInfo: PackageFetcher
  readConfiguration: ConfigurationReader
  verifyEnvironment(): void
}

export class Runner {
  constructor(private readonly deps: Dependencies) {}

  async run(): Promise<void> {
    const {
      readFile,
      dynamicImport,
      log,
      error,
      exit,
      runScript,
      fetchPackageInfo,
      readConfiguration,
      verifyEnvironment,
    } = this.deps

    verifyEnvironment()

    const packageLockJson = JSON.parse(readFile('package-lock.json'))
    const configModule = await dynamicImport(`${process.cwd()}/.allowed-scripts.mjs`)
    const config = configModule.default as Config

    const { configToPrint, packages, scripts } = readConfiguration(config, packageLockJson)

    log(`Current configuration: ${JSON.stringify(configToPrint, null, 2)}\n`)

    if (packages.toConfigure.length) {
      const result = await fetchPackageInfo(
        packages.toConfigure.map(pkg => [pkg.name.replace('node_modules/', ''), pkg.version]),
        scripts.allInstallScripts,
      )

      const format = (pkg: ConfiguredPackage) => {
        const info = result[pkg.name]
        const pkgScripts = Object.entries(info.scripts)
          .map(([name, cmd]) => `\t  ${name}: ${cmd}`)
          .join('\n')
        return `${pkg.nameWithVersion} (package published: ${info.published})\n\tscripts:\n${pkgScripts}\n`
      }

      error(
        `ACTION REQUIRED:\nExplicitly ALLOW/FORBID the following:\n\n * ${packages.toConfigure.map(format).join('\n * ')}`,
      )
    }

    if (packages.toRemove.length) {
      error(
        `ACTION REQUIRED:\nRemove configuration for the following packages:\n\n * ${packages.toRemove.join('\n * ')}\n`,
      )
    }

    if (packages.incorrectlyConfigured) {
      log(`Copy the "Current Configuration" from above and update your config file.`)
      exit(1)
    }

    if (!packages.toRun.length) {
      log(`No scripts to run`)
      exit(0)
    }

    log('Running dependency scripts')
    for (const path of packages.toRun) {
      log(`- Running scripts for: ${path}`)
      for (const event of scripts.dependencyScriptsToRun) {
        try {
          await runScript({ path, event })
        } catch (err) {
          error(`Error running dependency script: ${event} for ${path}`, err)
        }
      }
    }

    log('Running local scripts')
    for (const event of scripts.localScriptsToRun) {
      log(`- Running local scripts: ${event}`)
      try {
        await runScript({ path: '.', event })
      } catch (err) {
        error(`Error running local script: ${event}`, err)
      }
    }

    log('FIN!')
  }
}
