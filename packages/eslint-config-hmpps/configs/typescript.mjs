import typescriptEslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import typescriptRules from './rules/typescript-rules.mjs'

/**
 * Creates the TypeScript-specific shared lint block.
 *
 * @param {string[]} typescriptFiles
 * @returns {import('eslint').Linter.Config}
 */
function createTypescriptConfig(typescriptFiles) {
  return {
    name: 'hmpps-typescript',
    files: typescriptFiles,
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    languageOptions: {
      parser: tsParser,
    },
    rules: typescriptRules,
  }
}

export default createTypescriptConfig
