const importPlugin = require('eslint-plugin-import')
const noOnlyTests = require('eslint-plugin-no-only-tests')
const cypressPlugin = require('eslint-plugin-cypress/flat')

const globals = require('globals')
const typescriptEslint = require('@typescript-eslint/eslint-plugin')
const tsParser = require('@typescript-eslint/parser')
const js = require('@eslint/js')

// TODO: replace typescript plugin and parser with eslint v9 plugins

const { FlatCompat } = require('@eslint/eslintrc')

const { rules: bestPracticesRules } = require('./airbnbRules/best-practices')
const { rules: errorsRules } = require('./airbnbRules/errors')
const { rules: nodeRules } = require('./airbnbRules/node')
const { rules: styleRules } = require('./airbnbRules/style')
const { rules: variablesRules } = require('./airbnbRules/variables')
const { rules: es6Rules } = require('./airbnbRules/es6')
const { rules: importsRules } = require('./airbnbRules/imports')
const { rules: strictRules } = require('./airbnbRules/strict')

/**
 * Eslint linter config object
 * @typedef { import('eslint').Linter.Config } LinterConfig
 */

/**
 * Eslint linter globals object
 * @typedef { import('eslint').Linter.Globals } LinterGlobals
 */

/** Best practice rules as vendored from Airbnb’s eslint-config-airbnb-base */
const airbnbRules = {
  ...bestPracticesRules,
  ...errorsRules,
  ...nodeRules,
  ...styleRules,
  ...variablesRules,
  ...es6Rules,
  ...importsRules,
  ...strictRules,
}

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

/**
 * Uses `@eslint/eslintrc` to turn classic eslint config into named modern configs
 * @param {string[]} configsToExtend classic plugins to load and convert
 * @param {LinterConfig=} overrides overrides to add to each produced modern config
 * @return {LinterConfig[]} an array of eslint config objects
 */
function makeCompat(configsToExtend, overrides = {}) {
  return configsToExtend
    .map(configToExtend => {
      return compat.extends(configToExtend).map(config => ({
        name: configToExtend,
        ...config,
        ...overrides,
      }))
    })
    .flat()
}

/** micromatch glob for script file extensions */
const scriptExtensionsGlob = '@(js|mjs|cjs|ts|mts|cts)'

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

    // Airbnb best-practice rules
    {
      name: 'airbnb-rules',
      rules: airbnbRules,
    },

    // `import` plugin rules
    {
      settings: {
        'import/parsers': {
          '@typescript-eslint/parser': ['.ts', '.tsx'],
        },
        'import/resolver': {
          typescript: {
            alwaysTryTypes: true,
          },
          node: {
            extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
          },
        },
      },
      ...importPlugin.flatConfigs.recommended,
    },

    // `prettier` rules
    ...makeCompat(['plugin:prettier/recommended']),
    // general plugins and rule overrides
    {
      name: 'hmpps-universal',
      plugins: {
        'no-only-tests': noOnlyTests,
      },
      rules: {
        'no-unused-vars': [
          1,
          {
            argsIgnorePattern: 'res|next|^err|_',
            ignoreRestSiblings: true,
          },
        ],
        'no-use-before-define': 0,
        semi: 0,
        'import/named': 0,
        'import/no-named-as-default-member': 0,
        'import/no-unresolved': 'error',
        'import/extensions': [
          'error',
          'ignorePackages',
          {
            js: 'never',
            mjs: 'never',
            jsx: 'never',
            ts: 'never',
            tsx: 'never',
          },
        ],
        'comma-dangle': ['error', 'always-multiline'],
        'import/no-extraneous-dependencies': [
          'error',
          {
            devDependencies: [
              // unit test mixed in with application code
              '**/*.test.js',
              '**/*.test.ts',
              '**/test/**',
              // integration tests
              'integration_tests/**',
              // test utilities
              '**/testutils/**',
              // tooling config
              'cypress.config.ts',
              'eslint.config.mjs',
              'playwright.config.ts',
              '.allowed-scripts.mjs',
              // build tools
              'esbuild/**',
              ...extraPathsAllowingDevDependencies,
            ],
          },
        ],
        'no-only-tests/no-only-tests': 'error',
        'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
        'prettier/prettier': [
          'warn',
          {
            trailingComma: 'all',
            singleQuote: true,
            printWidth: 120,
            semi: false,
            arrowParens: 'avoid',
          },
        ],
        'no-empty-function': [
          'error',
          {
            allow: ['constructors', 'arrowFunctions'],
          },
        ],
      },
    },

    // typescript-specific plugins and rule overrides
    ...makeCompat(
      [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
      ],
      {
        files: ['**/*.ts'],
        ignores: ['**/*.js'],
      },
    ),
    {
      name: 'hmpps-typescript',
      files: ['**/*.ts'],
      ignores: ['**/*.js'],
      plugins: {
        '@typescript-eslint': typescriptEslint,
      },
      languageOptions: {
        parser: tsParser,
      },
      rules: {
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': ['error'],
        '@typescript-eslint/no-use-before-define': 0,
        'class-methods-use-this': 0,
        'no-useless-constructor': 0,
        '@typescript-eslint/no-unused-vars': [
          1,
          {
            argsIgnorePattern: 'res|next|^err|_',
            ignoreRestSiblings: true,
          },
        ],
        '@typescript-eslint/semi': 0,
        'import/no-unresolved': 'error',
        'import/no-named-as-default-member': 0,
        'prettier/prettier': [
          'warn',
          {
            trailingComma: 'all',
            singleQuote: true,
            printWidth: 120,
            semi: false,
            arrowParens: 'avoid',
          },
        ],
      },
    },

    // cypress integration tests
    {
      files: [`integration_tests/**/*.${scriptExtensionsGlob}`],
      ...cypressPlugin.configs.recommended,
    },

    // non-frontend globals
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

    // unit test globals
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

    // integration test globals
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

    // frontend globals
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

module.exports = hmppsConfig
