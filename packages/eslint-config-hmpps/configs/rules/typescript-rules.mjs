/**
 * TypeScript-specific rule overrides.
 *
 * @type {import('eslint').Linter.RulesRecord}
 */
const typescriptRules = {
  // Disallow unused variables. Use the TypeScript-specific variant: @typescript-eslint/no-unused-vars.
  // https://typescript-eslint.io/rules/no-unused-vars
  'no-unused-vars': 'off',
  '@typescript-eslint/no-unused-vars': [
    'warn',
    {
      argsIgnorePattern: 'res|next|^err|_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^err|_',
      ignoreRestSiblings: true,
    },
  ],

  // Require default parameters to be last. Use the TypeScript-specific variant: @typescript-eslint/default-param-last.
  // https://typescript-eslint.io/rules/default-param-last
  'default-param-last': 'off',
  '@typescript-eslint/default-param-last': 'error',

  // Disallow empty functions. Use the TypeScript-specific variant: @typescript-eslint/no-empty-function.
  // https://typescript-eslint.io/rules/no-empty-function
  'no-empty-function': 'off',
  '@typescript-eslint/no-empty-function': [
    'error',
    {
      allow: ['constructors', 'arrowFunctions'],
    },
  ],

  // Disallow unsafe function closures in loops. Use the TypeScript-specific variant: @typescript-eslint/no-loop-func.
  // https://typescript-eslint.io/rules/no-loop-func
  'no-loop-func': 'off',
  '@typescript-eslint/no-loop-func': 'error',

  // Disallow numeric precision loss. The TypeScript variant is deprecated, so use the core rule.
  // https://eslint.org/docs/latest/rules/no-loss-of-precision
  'no-loss-of-precision': 'error',
  '@typescript-eslint/no-loss-of-precision': 'off',

  // Disallow unused private class members. Use the TypeScript-specific variant: @typescript-eslint/no-unused-private-class-members.
  // https://typescript-eslint.io/rules/no-unused-private-class-members
  'no-unused-private-class-members': 'off',
  '@typescript-eslint/no-unused-private-class-members': 'error',

  // Disallow shadowed variable declarations. Use the TypeScript-specific variant: @typescript-eslint/no-shadow.
  // https://typescript-eslint.io/rules/no-shadow
  'no-shadow': 'off',
  '@typescript-eslint/no-shadow': ['error'],

  // Disabled to preserve existing project behaviour.
  // https://typescript-eslint.io/rules/no-use-before-define
  '@typescript-eslint/no-use-before-define': 0,

  // Disabled to preserve existing project behaviour.
  // https://eslint.org/docs/latest/rules/class-methods-use-this
  'class-methods-use-this': 0,

  // Disabled to preserve existing project behaviour.
  // https://eslint.org/docs/latest/rules/no-useless-constructor
  'no-useless-constructor': 0,

  // Disabled; formatting is handled by Prettier.
  // https://typescript-eslint.io/rules/semi
  '@typescript-eslint/semi': 0,

  // Ensure imports resolve to existing files/modules.
  // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-unresolved.md
  'import/no-unresolved': 'error',

  // Disabled due false positives with re-export/member patterns.
  // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-named-as-default-member.md
  'import/no-named-as-default-member': 0,
}

export default typescriptRules
