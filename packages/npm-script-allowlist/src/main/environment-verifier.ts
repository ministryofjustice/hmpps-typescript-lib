import { existsSync, readFileSync } from 'fs'

export const ERRORS = {
  NPMRC_NOT_FOUND: '[ERR-01] .npmrc file not found. Please ensure you have an .npmrc file in the root of your project.',
  NPMRC_IGNORE_SCRIPTS_NOT_SET:
    '[ERR-02] Incorrect .npmrc configuration. Please ensure your .npmrc file has "ignore-scripts=true" set.',
  DOCKERFILE_MISSING_NPMRC:
    '[ERR-03] Dockerfile needs to copy the .npmrc file to the container. See here for example: https://github.com/ministryofjustice/hmpps-template-typescript/pull/719',
  DOCKERFILE_MISSING_ALLOWED_SCRIPTS:
    '[ERR-04] Dockerfile needs to copy the .allowed-scripts.mjs file to the container. See here for example: https://github.com/ministryofjustice/hmpps-template-typescript/pull/719',
  DOCKERIGNORE_MISSING_NPMRC:
    '[ERR-05] .dockerignore file should contain "!.npmrc" to allow .npmrc file to be copied into the container',
  DOCKERIGNORE_MISSING_ALLOWED_SCRIPTS:
    '[ERR-06] .dockerignore file should contain "!.allowed-scripts.mjs" to allow .allowed-scripts.mjs file to be copied into the container',
} as const

export const environmentVerifier = (log: (...args: unknown[]) => void = console.log) => {
  // if process.env.NPM_SCRIPT_ALLOWLIST_VERIFICATION_DISABLED is set, skip verification
  if (process.env.NPM_SCRIPT_ALLOWLIST_VERIFICATION_DISABLED === 'true') {
    log('Environment verification is disabled.')
    return
  }
  const failedChecks = runChecks()

  if (failedChecks.length) {
    throw new Error(
      `\n🚨 Allowlist environment verification failed! 🚨:\nThese checks ensure that the current environment will be protected by the script allowlist package.\n\n * ${failedChecks.join('\n * ')}\n\n\nSee https://github.com/ministryofjustice/hmpps-typescript-lib/tree/main/packages/npm-script-allowlist for more info or ask #typescript for support.\n`,
    )
  }
}

export function runChecks() {
  return [
    checkNpmrcFileExists(),
    checkIgnoreScriptsSet(),
    checkDockerImageReferencesRequiredFiles(),
    checkDockerIgnoreIncludesRequiredFiles(),
  ].flat()
}

function checkNpmrcFileExists() {
  return !existsSync(`${process.cwd()}/.npmrc`) ? [ERRORS.NPMRC_NOT_FOUND] : []
}

function checkIgnoreScriptsSet() {
  if (!existsSync(`${process.cwd()}/.npmrc`)) {
    return []
  }
  const npmrcContent = readFileSync(`${process.cwd()}/.npmrc`, 'utf-8')
  const hasIgnoreScriptsConfig = npmrcContent.split('\n').some(line => /^\s*ignore-scripts\s*=\s*true\s*$/.test(line))

  return !hasIgnoreScriptsConfig ? [ERRORS.NPMRC_IGNORE_SCRIPTS_NOT_SET] : []
}

function checkDockerImageReferencesRequiredFiles() {
  if (!existsSync(`${process.cwd()}/Dockerfile`)) {
    return []
  }

  const dockerfileContent = readFileSync(`${process.cwd()}/Dockerfile`, 'utf-8')
  const errrors = []
  if (!dockerfileContent.includes('.npmrc')) {
    errrors.push(ERRORS.DOCKERFILE_MISSING_NPMRC)
  }

  if (!dockerfileContent.includes('.allowed-scripts.mjs')) {
    errrors.push(ERRORS.DOCKERFILE_MISSING_ALLOWED_SCRIPTS)
  }
  return errrors
}

function checkDockerIgnoreIncludesRequiredFiles() {
  if (!existsSync(`${process.cwd()}/.dockerignore`)) {
    return []
  }
  const dockerignoreContent = readFileSync(`${process.cwd()}/.dockerignore`, 'utf-8')
  const errors = []
  const hasNpmrcException = dockerignoreContent.split('\n').some(line => /^\s*!\s*\.npmrc\s*$/.test(line))
  if (!hasNpmrcException) {
    errors.push(ERRORS.DOCKERIGNORE_MISSING_NPMRC)
  }

  const hasAllowedScriptsException = dockerignoreContent
    .split('\n')
    .some(line => /^\s*!\s*\.allowed-scripts\.mjs\s*$/.test(line))
  if (!hasAllowedScriptsException) {
    errors.push(ERRORS.DOCKERIGNORE_MISSING_ALLOWED_SCRIPTS)
  }
  return errors
}
