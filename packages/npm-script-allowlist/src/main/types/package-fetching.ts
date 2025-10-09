export type Package = [name: string, version: string]

export type PackageInfo = {
  published: string
  scripts: Record<string, string>
}

export type AllPackageInfo = Record<string, PackageInfo>

export type PackageFetcher = (packages: Package[], allowedScripts: string[]) => Promise<AllPackageInfo>
