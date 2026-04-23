import { existsSync, readFileSync } from 'fs'

export const environmentVerifier = (log: (...args: unknown[]) => void = console.log) => {
  // if process.env.NPM_SCRIPT_ALLOWLIST_VERIFICATION_DISABLED is set, skip verification
  if (process.env.NPM_SCRIPT_ALLOWLIST_VERIFICATION_DISABLED === 'true') {
    log('Environment verification is disabled.')
    return
  }

  // if npmrc file does not exist throw error
  if (!existsSync(`${process.cwd()}/.npmrc`)) {
    throw new Error(
      '.npmrc file not found. Please ensure you have an .npmrc file in the root of your project with the correct ignore-scripts setting.',
    )
  }

  const npmrcContent = readFileSync(`${process.cwd()}/.npmrc`, 'utf-8')
  const hasIgnoreScriptsConfig = npmrcContent.split('\n').some(line => /^\s*ignore-scripts\s*=\s*true\s*$/.test(line))

  if (!hasIgnoreScriptsConfig) {
    throw new Error('Incorrect .npmrc configuration. Please ensure your .npmrc file has "ignore-scripts=true" set.')
  }

  // if dockerfile exists, check it references the .npmrc file
  if (existsSync(`${process.cwd()}/Dockerfile`)) {
    const dockerfileContent = readFileSync(`${process.cwd()}/Dockerfile`, 'utf-8')
    if (!dockerfileContent.includes('.npmrc')) {
      throw new Error(
        'Please ensure your Dockerfile copies the .npmrc file to the container. See here for example: https://github.com/ministryofjustice/hmpps-template-typescript/pull/719. (check .dockerignore does not reference .npmrc as well)',
      )
    }
  }
}
