import { importX } from 'eslint-plugin-import-x'
import importRules from './rules/import-rules.mjs'

const defaultPathsAllowingDevDependencies = ['bin/**']

/**
 * Adds project-specific devDependency path allowances to the shared import rules.
 *
 * @param {string[]} extraPathsAllowingDevDependencies
 * @returns {import('eslint').Linter.RulesRecord}
 */
function withExtraDevDependencyPaths(extraPathsAllowingDevDependencies) {
  const [severity, options] = importRules['import-x/no-extraneous-dependencies']

  return {
    ...importRules,
    'import-x/no-extraneous-dependencies': [
      severity,
      {
        ...options,
        devDependencies: [...options.devDependencies, ...extraPathsAllowingDevDependencies],
      },
    ],
  }
}

/**
 * Creates import plugin flat config blocks.
 *
 * @param {Object} args
 * @param {string[]} args.typescriptFiles
 * @param {string[]=} args.extraPathsAllowingDevDependencies
 * @returns {import('eslint').Linter.Config[]}
 */
function createImportConfigs({ typescriptFiles, extraPathsAllowingDevDependencies = [] }) {
  const allDevDependencyPaths = [
    ...new Set([...defaultPathsAllowingDevDependencies, ...extraPathsAllowingDevDependencies]),
  ]

  return [
    {
      name: 'hmpps-import-compatibility',
      plugins: {
        // Keep existing consumer overrides working after migrating to import-x.
        import: importX,
      },
    },
    {
      settings: {
        'import-x/parsers': {
          '@typescript-eslint/parser': ['.ts', '.tsx', '.mts', '.cts'],
        },
        'import-x/resolver': {
          typescript: {
            alwaysTryTypes: true,
          },
          node: {
            extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
          },
        },
      },
      ...importX.flatConfigs.recommended,
    },
    {
      ...importX.flatConfigs.typescript,
      files: typescriptFiles,
    },
    {
      name: 'hmpps-imports',
      rules: withExtraDevDependencyPaths(allDevDependencyPaths),
    },
  ]
}

export default createImportConfigs
