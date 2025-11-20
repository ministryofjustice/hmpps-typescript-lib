import { readFileSync } from 'node:fs'
import npmRunScript from '@npmcli/run-script'

import { readConfiguration } from './configuration-reader'
import { fetchPackageInfo } from './fetch-package-info'
import { Runner } from './runner'

export { configureAllowedScripts, type Config } from './project-configuration'

export async function run() {
  await new Runner({
    readFile: path => readFileSync(path, 'utf-8'),
    dynamicImport: path => import(path),
    log: console.log,
    error: console.error,
    exit: code => process.exit(code),
    runScript: ({ path, event }) => npmRunScript({ event, path, stdio: 'inherit' }),
    fetchPackageInfo,
    readConfiguration,
  }).run()
}
