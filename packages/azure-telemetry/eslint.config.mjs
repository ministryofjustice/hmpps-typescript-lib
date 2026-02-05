// eslint-disable-next-line import/no-extraneous-dependencies
import hmppsConfig from '@ministryofjustice/eslint-config-hmpps'

export default [
  ...hmppsConfig(),
  {
    rules: {
      'import/prefer-default-export': 'off',
    },
  },
  {
    files: ['src/main/TelemetryInitialiser.ts'],
    rules: {
      'no-console': 'off',
    },
  },
]
