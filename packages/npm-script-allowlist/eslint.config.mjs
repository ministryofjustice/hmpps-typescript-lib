import hmppsConfig from '@ministryofjustice/eslint-config-hmpps'

export default [
  ...hmppsConfig(),
  {
    rules: {
      'no-await-in-loop': 'off',
      'no-console': 'off',
      'import/prefer-default-export': 'off',
    },
  },
]
