import globals from 'globals'

/**
 * Creates global-variable config blocks for backend, tests, and frontend assets.
 *
 * @param {Object} args
 * @param {string} args.scriptExtensionsGlob
 * @param {import('eslint').Linter.Globals=} args.extraGlobals
 * @param {import('eslint').Linter.Globals=} args.extraFrontendGlobals
 * @param {import('eslint').Linter.Globals=} args.extraUnitTestGlobals
 * @param {import('eslint').Linter.Globals=} args.extraIntegrationGlobals
 * @returns {import('eslint').Linter.Config[]}
 */
function createGlobalConfigs({
  scriptExtensionsGlob,
  extraGlobals = {},
  extraFrontendGlobals = {},
  extraUnitTestGlobals = {},
  extraIntegrationGlobals = {},
}) {
  return [
    {
      name: 'hmpps-globals',
      files: [`**/*.${scriptExtensionsGlob}`],
      ignores: [`assets/**/*.${scriptExtensionsGlob}`],
      languageOptions: {
        globals: {
          ...globals.node,
          ...extraGlobals,
        },
      },
    },
    {
      name: 'hmpps-unit-test-globals',
      files: [`**/*.test.${scriptExtensionsGlob}`],
      languageOptions: {
        globals: {
          ...globals.jest,
          ...extraUnitTestGlobals,
        },
      },
    },
    {
      name: 'hmpps-integration-test-globals',
      files: [`integration_tests/**/*.${scriptExtensionsGlob}`],
      languageOptions: {
        globals: {
          // cypress, browser and mocha included by cypressPlugin.configs.recommended
          ...extraIntegrationGlobals,
        },
      },
    },
    {
      name: 'hmpps-frontend-globals',
      files: [`assets/**/*.${scriptExtensionsGlob}`],
      languageOptions: {
        globals: {
          ...globals.browser,
          ...extraFrontendGlobals,
        },
      },
    },
  ]
}

export default createGlobalConfigs
