// eslint-disable-next-line import/no-extraneous-dependencies
import hmppsConfig from '@ministryofjustice/eslint-config-hmpps'

export default [
  ...hmppsConfig(),
  {
    rules: {
      'no-param-reassign': ['error', { props: false }],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]
