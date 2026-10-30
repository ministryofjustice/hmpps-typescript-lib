// eslint-disable-next-line import-x/no-extraneous-dependencies
import hmppsConfig from '@ministryofjustice/eslint-config-hmpps'

export default [
  ...hmppsConfig(),
  {
    rules: {
      'import-x/prefer-default-export': 'off',
    },
  },
  {
    files: ['src/main/TelemetryInitialiser.ts'],
    rules: {
      'no-console': 'off',
    },
  },
]
