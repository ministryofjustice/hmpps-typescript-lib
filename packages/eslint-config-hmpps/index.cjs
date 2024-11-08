const importPlugin = require('eslint-plugin-import')
const noOnlyTests = require('eslint-plugin-no-only-tests')
const cypressPlugin = require('eslint-plugin-cypress/flat')

const { fixupPluginRules } = require('@eslint/compat')

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
 * Generates the HMPPS shared best-practice eslint rules for typescript projects
 *
 * @param {string[]} extraIgnorePaths add extra glob entires to ignored paths (e.g. build artefacts)
 * @param {string[]} extraPathsAllowingDevDependencies add extra glob entries that should allow dev dependencies (e.g. bin scripts)
 * @param {Linter.Globals} extraGlobals add languageOptions.globals entries (node and jest are already included)
 * @param {Linter.Globals} extraFrontendGlobals add languageOptions.globals entries to front-end assets (browser is already included)
 *
 * @return {Linter.Config[]}
 */
function hmppsConfig({
  extraIgnorePaths = [],
  extraPathsAllowingDevDependencies = [],
  extraGlobals = {},
  extraFrontendGlobals = {},
} = {}) {
  return [
    // ignore dependencies and build artefacts
    {
      ignores: ['**/node_modules', 'dist/', ...extraIgnorePaths],
    },
    // warn when an eslint-disable comment does nothing
    {
      linterOptions: {
        reportUnusedDisableDirectives: true,
      },
    },
    // Airbnb best-practice rules
    {
      rules: airbnbRules,
    },
    // `prettier` rules
    ...compat.extends('plugin:prettier/recommended'),
    // general plugins and rule overrides
    {
      plugins: {
        import: fixupPluginRules(importPlugin),
        'no-only-tests': noOnlyTests,
      },
      languageOptions: {
        globals: {
          ...globals.node,
          ...globals.jest,
          ...extraGlobals,
        },
      },
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
    ...compat
      .extends(
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
      )
      .map(config => ({
        ...config,
        files: ['**/*.ts'],
        ignores: ['**/*.js'],
      })),
    {
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
          },
        ],
      },
    },
    // cypress integration tests
    {
      files: ['integration_tests/**/*.js', 'integration_tests/**/*.ts'],
      ...cypressPlugin.configs.recommended,
    },
    // front-end globals
    {
      files: ['assets/**/*.js', 'assets/**/*.ts'],
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
