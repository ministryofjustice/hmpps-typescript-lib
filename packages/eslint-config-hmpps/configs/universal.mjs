import noOnlyTests from 'eslint-plugin-no-only-tests'
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
      'no-only-tests': noOnlyTests,
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
