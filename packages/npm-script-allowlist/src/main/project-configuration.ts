import { Config } from './types/configuration-loading'

/**
 * Provides information as to whether a script should be enabled or not.
 *
 * @param {Config} config
 * @return {Config} configured scripts
 */
export function configureAllowedScripts(config: Config): Config {
  return config
}

export type { Config } from './types/configuration-loading'
