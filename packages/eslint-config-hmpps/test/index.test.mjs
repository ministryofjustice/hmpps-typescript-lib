import path from 'node:path'
import url from 'node:url'

import { ESLint } from 'eslint'

import hmppsConfig from '../index.cjs'

describe('eslint-config-hmpps', () => {
  it('should find errors in sample application', async () => {
    const sampleApplicationPath = path.join(path.dirname(url.fileURLToPath(import.meta.url)), 'sample-application')
    const config = hmppsConfig()
    const eslint = new ESLint({
      cwd: sampleApplicationPath,
      overrideConfigFile: true,
      overrideConfig: config,
      cache: false,
      fix: false,
    })
    const results = await eslint.lintFiles(sampleApplicationPath)
    const expectedFailues = {
      '/globals.fail.js': ['no-undef:2', 'no-undef:5', 'no-undef:8', 'no-undef:11'],
      '/assets/js/globals.fail.js': ['no-undef:2', 'no-undef:5', 'no-undef:8', 'no-undef:11'],
      '/integration_tests/globals.fail.js': ['no-undef:2'],
      '/server/globals.fail.js': ['no-undef:2', 'no-undef:5', 'no-undef:8', 'no-undef:11'],
      '/server/globals.fail.test.js': ['no-undef:2', 'no-undef:5', 'no-undef:8'],
    }
    const problems = []
    for (const result of results) {
      const problemCount = result.warningCount + result.errorCount + result.fatalErrorCount
      const expectFail = result.filePath.includes('fail')
      const relativePath = result.filePath.replace(sampleApplicationPath, '')
      if (expectFail) {
        const foundMessages = new Set(result.messages.map(message => `${message.ruleId}:${message.line}`))
        const expectedMessages = new Set(expectedFailues[relativePath])
        const missingMessages = Array.from(expectedMessages.difference(foundMessages))
        if (missingMessages.length > 0) {
          problems.push(`${relativePath} should have failed with ${missingMessages}`)
        }
        const unexpectedMessages = Array.from(foundMessages.difference(expectedMessages))
        if (unexpectedMessages.length > 0) {
          problems.push(`${relativePath} has unexpected errors ${unexpectedMessages}`)
        }
      } else if (!expectFail && problemCount > 0) {
        problems.push(
          `${relativePath} should have passed but has ${result.messages.map(message => `${message.ruleId}:${message.line}`).join(', ')}`,
        )
      }
    }
    expect(problems).toStrictEqual([])
  })
})
