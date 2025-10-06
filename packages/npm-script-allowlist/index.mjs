/**
 * @readonly
 * @enum {'ALLOW' | 'FORBID'}
 */
export const Status = {
  ALLOW: 'ALLOW',
  FORBID: 'FORBID',
}

/**
 * Types
 * @typedef {Object} Config
 * @property {Array<string>} localScriptsToRun - A list of the lifecycle scripts to run for this package
 * @property {Array<string>} dependencyScriptsToRun - A list of the lifecycle scripts to run for each allowed dependency
 * @property {Record<string, Status>} allowlist
 */

/**
 * Provides information as to whether a script should be enabled or not.
 *
 * @param {Config} config
 * @return {Config} an array of eslint config objects
 */
export default function configureAllowedScripts(config) {
  return config
}
