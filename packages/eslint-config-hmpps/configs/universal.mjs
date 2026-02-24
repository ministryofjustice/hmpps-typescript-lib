import noOnlyTests from 'eslint-plugin-no-only-tests'
import nPlugin from 'eslint-plugin-n'
import stylisticPlugin from '@stylistic/eslint-plugin'
import errorPreventionRules from './rules/error-prevention-rules.mjs'
import codeConventionRules from './rules/code-convention-rules.mjs'
import complexityRules from './rules/complexity-rules.mjs'
import bannedPatternsRules from './rules/banned-patterns-rules.mjs'
import stylisticRules from './rules/stylistic-rules.mjs'

/**
 * Creates the shared universal lint block.
 *
 * @returns {import('eslint').Linter.Config}
 */
function createUniversalConfig() {
  return {
    name: 'hmpps-universal',
    plugins: {
      '@stylistic': stylisticPlugin,
      'no-only-tests': noOnlyTests,
      n: nPlugin,
    },
    rules: {
      ...errorPreventionRules,
      ...codeConventionRules,
      ...complexityRules,
      ...bannedPatternsRules,
      ...stylisticRules,
    },
  }
}

export default createUniversalConfig
