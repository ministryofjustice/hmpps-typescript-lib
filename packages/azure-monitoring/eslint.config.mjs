// eslint-disable-next-line import/no-extraneous-dependencies
import hmppsConfig from '@ministryofjustice/eslint-config-hmpps'

export default [
  ...hmppsConfig(),
  { ignores: ['src/sample/**.ts'] },
  { files: ['**/*.ts'], rules: { 'import/prefer-default-export': 'off' } },
]
