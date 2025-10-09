import { PackageLock, ScriptRunMode } from './types/configuration-loading'
import { Config } from './project-configuration'
import { readConfiguration } from './configuration-reader'

describe('readConfiguration', () => {
  const baseConfig: Config = {
    allowlist: {
      'package-a@1.0.0': ScriptRunMode.ALLOW,
      'package-b@2.0.0': ScriptRunMode.FORBID,
      'package-c@1.9.0': ScriptRunMode.ALLOW,
    },
    dependencyScriptsToRun: ['install'],
    localScriptsToRun: ['postinstall'],
  }

  const basePackageLock: PackageLock = {
    packages: {
      'package-a': {
        version: '1.0.0',
        hasInstallScript: true,
      },
      'package-b': {
        version: '2.0.0',
        hasInstallScript: true,
      },
      'package-c': {
        version: '3.0.0',
        hasInstallScript: true,
      },
      'package-d': {
        version: '4.0.0',
        hasInstallScript: false,
      },
    },
  }

  it('should correctly identify packages to run, configure, and remove', () => {
    const result = readConfiguration(baseConfig, basePackageLock)

    expect(result.packages.toRun).toEqual(['package-a'])
    expect(result.packages.toConfigure.map(p => p.name)).toContain('package-c')
    expect(result.packages.toRemove).toContain('package-c@1.9.0')
    expect(result.packages.incorrectlyConfigured).toBe(true)

    expect(result.configToPrint).toEqual({
      'package-a@1.0.0': 'ALLOW',
      'package-b@2.0.0': 'FORBID',
      'package-c@1.9.0': '<REMOVED>',
      'package-c@3.0.0': '<MISSING>',
    })

    expect(result.scripts.dependencyScriptsToRun).toEqual(['install'])
    expect(result.scripts.localScriptsToRun).toEqual(['postinstall'])
  })

  it('should use default scripts if none are provided', () => {
    const configWithoutScripts: Config = {
      allowlist: {
        'package-a@1.0.0': ScriptRunMode.ALLOW,
      },
    }

    const result = readConfiguration(configWithoutScripts, basePackageLock)

    expect(result.scripts.dependencyScriptsToRun).toEqual(['preinstall', 'install', 'postinstall'])
    expect(result.scripts.localScriptsToRun).toEqual(['preinstall', 'install', 'postinstall'])
  })

  it('should handle empty packageLock gracefully', () => {
    const result = readConfiguration(baseConfig, { packages: {} })

    expect(result.packages.toRun).toEqual([])
    expect(result.packages.toConfigure).toEqual([])
    expect(result.packages.toRemove).toEqual(['package-a@1.0.0', 'package-b@2.0.0', 'package-c@1.9.0'])
    expect(result.packages.incorrectlyConfigured).toBe(true)
  })
})
