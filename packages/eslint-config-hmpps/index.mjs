import prettierRecommended from 'eslint-plugin-prettier/recommended'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import js from '@eslint/js'
import createImportConfigs from './configs/imports.mjs'
import createUniversalConfig from './configs/universal.mjs'
import createTypescriptConfig from './configs/typescript.mjs'
import createCypressConfig from './configs/cypress.mjs'
import createGlobalConfigs from './configs/globals.mjs'

/**
 * Eslint linter config object
 * @typedef { import('eslint').Linter.Config } LinterConfig
 */

/**
 * Eslint linter globals object
 * @typedef { import('eslint').Linter.Globals } LinterGlobals
 */

/** micromatch glob for script file extensions */
const scriptExtensionsGlob = '@(js|mjs|cjs|ts|mts|cts)'
const typescriptFiles = ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts']

/**
 * Adds file scoping to flat config arrays that are otherwise unscoped.
 *
 * @param {LinterConfig[]} configs
 * @param {string[]} files
 * @return {LinterConfig[]}
 */
function withFiles(configs, files) {
  return configs.map(config => ({
    ...config,
    files: typeof config.files === 'undefined' ? files : config.files,
  }))
}

/**
 * Generates the HMPPS shared best-practice eslint rules for typescript projects
 *
 * @param {Object} args
 * @param {string[]=} args.extraIgnorePaths add extra glob entires to ignored paths (e.g. build artefacts)
 * @param {string[]=} args.extraPathsAllowingDevDependencies add extra glob entries that should allow dev dependencies (e.g. bin scripts)
 * @param {LinterGlobals=} args.extraGlobals add languageOptions.globals entries (node is already included)
 * @param {LinterGlobals=} args.extraFrontendGlobals add languageOptions.globals entries to frontend assets (browser is already included)
 * @param {LinterGlobals=} args.extraUnitTestGlobals add languageOptions.globals entries to unit tests (jest is already included)
 * @param {LinterGlobals=} args.extraIntegrationGlobals add languageOptions.globals entries to integration tests (cypress, browser and mocha already included)
 *
 * @return {LinterConfig[]} an array of eslint config objects
 */
function hmppsConfig({
  extraIgnorePaths = [],
  extraPathsAllowingDevDependencies = [],
  extraGlobals = {},
  extraFrontendGlobals = {},
  extraUnitTestGlobals = {},
  extraIntegrationGlobals = {},
} = {}) {
  return [
    // ignore dependencies and build artefacts
    {
      ignores: ['**/node_modules', 'dist/', 'test_results', ...extraIgnorePaths],
    },
    // warn when an eslint-disable comment does nothing
    {
      name: 'universal-options',
      linterOptions: {
        reportUnusedDisableDirectives: true,
      },
    },

    // Base JS recommendations from ESLint core:
    // https://eslint.org/docs/latest/use/configure/configuration-files#using-predefined-configurations
    js.configs.recommended,

    // `import` plugin rules
    ...createImportConfigs({
      typescriptFiles,
      extraPathsAllowingDevDependencies,
    }),

    // modern typescript linting
    ...withFiles(typescriptEslint.configs['flat/recommended'], typescriptFiles),

    // `prettier` rules
    prettierRecommended,

    // general plugins and rule overrides
    createUniversalConfig(),

    // typescript-specific plugins and rule overrides
    createTypescriptConfig(typescriptFiles),

    // cypress integration tests
    createCypressConfig(scriptExtensionsGlob),

    // non-frontend globals
    ...createGlobalConfigs({
      scriptExtensionsGlob,
      extraGlobals,
      extraFrontendGlobals,
      extraUnitTestGlobals,
      extraIntegrationGlobals,
    }),
  ]
}

export default hmppsConfig
