// eslint-disable-next-line import-x/no-extraneous-dependencies
import hmppsConfig from '@ministryofjustice/eslint-config-hmpps'

export default [
  ...hmppsConfig(),
  {
    rules: {
      'no-await-in-loop': 'off',
      'no-console': 'off',
      'import-x/prefer-default-export': 'off',
    },
  },
]
