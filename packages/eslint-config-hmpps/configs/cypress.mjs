import cypressPlugin from 'eslint-plugin-cypress'

/**
 * Creates the Cypress integration test lint block.
 *
 * @param {string} scriptExtensionsGlob
 * @returns {import('eslint').Linter.Config}
 */
function createCypressConfig(scriptExtensionsGlob) {
  return {
    files: [`integration_tests/**/*.${scriptExtensionsGlob}`],
    ...cypressPlugin.configs.recommended,
  }
}

export default createCypressConfig
