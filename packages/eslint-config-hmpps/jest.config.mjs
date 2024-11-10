// eslint-disable-next-line import/no-relative-packages
import config from '../../jest.config.mjs'

export default {
  ...config,
  testPathIgnorePatterns: ['sample-application'],
}
