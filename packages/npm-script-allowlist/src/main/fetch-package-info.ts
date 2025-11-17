import type { AllPackageInfo, PackageFetcher, Package } from './types/package-fetching'
import { batches, formatDate, runCommand } from './utils'

type NpmShowOutput = {
  time: Record<string, string>
  scripts: Record<string, string>
}

type PackageInfoEntry = [keyof AllPackageInfo, AllPackageInfo[keyof AllPackageInfo]]

export const fetchPackageInfo: PackageFetcher = async (packages: Package[], allowedScripts: string[]) => {
  const allResults: PackageInfoEntry[] = []
  for (const batch of batches(packages, 10)) {
    const results = await Promise.all(batch.map(async ([name, version]) => fetchInfo(name, version, allowedScripts)))
    results.forEach(r => allResults.push(r))
  }
  return Object.fromEntries(allResults)
}
async function fetchInfo(name: string, version: string, allowedScripts: string[]): Promise<PackageInfoEntry> {
  const output = await runCommand(`npm show ${name}@${version} --json`)
  const payload = JSON.parse(output) as NpmShowOutput
  return [
    `node_modules/${name}`,
    {
      published: formatDate(new Date(payload.time[version])),
      scripts: Object.fromEntries(
        Object.entries(payload.scripts || {}).filter(([scriptName]) =>
          allowedScripts.some(allowedScript => allowedScript === scriptName),
        ),
      ),
    },
  ] as PackageInfoEntry
}
