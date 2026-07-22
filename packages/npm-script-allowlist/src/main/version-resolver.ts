import semver from 'semver'

import { ScriptRunMode } from './types/configuration-loading'

const satisfiesVersionRange = (configuredPackage: string, packageName: string, packageVersion: string) => {
  if (!configuredPackage.startsWith(`${packageName}@`)) return false

  const semverVersion = configuredPackage.slice(`${packageName}@`.length)
  if (!semver.valid(packageVersion) || !semver.validRange(semverVersion)) {
    console.warn(`Invalid configuration: ${configuredPackage} / ${packageName}@${packageVersion}`)
    return false
  }

  return semver.satisfies(packageVersion, semverVersion)
}

export const satisfiesVersion = (configuredPackage: string, packageName: string, packageVersion: string) => {
  if (configuredPackage === packageName) return true
  return satisfiesVersionRange(configuredPackage, packageName, packageVersion)
}

export const resolvePackage = (
  allowList: [string, ScriptRunMode][],
  packageName: string,
  packageVersion: string,
): ScriptRunMode | undefined => {
  const exactMatch = allowList.find(([pkg]) => pkg === `${packageName}@${packageVersion}`)
  if (exactMatch) return exactMatch[1]

  const rangeMatch = allowList.find(([pkg]) => satisfiesVersionRange(pkg, packageName, packageVersion))
  if (rangeMatch) return rangeMatch[1]

  const nameOnlyMatch = allowList.find(([pkg]) => pkg === packageName)
  if (nameOnlyMatch) return nameOnlyMatch[1]
  return undefined
}
