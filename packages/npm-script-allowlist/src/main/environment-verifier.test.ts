import { existsSync, readFileSync } from 'fs'
import { environmentVerifier } from './environment-verifier'

jest.mock('fs')

describe('environmentVerifier', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    delete process.env.NPM_SCRIPT_ALLOWLIST_VERIFICATION_DISABLED
  })

  it('should log and return early when NPM_SCRIPT_ALLOWLIST_VERIFICATION_DISABLED is true', () => {
    process.env.NPM_SCRIPT_ALLOWLIST_VERIFICATION_DISABLED = 'true'
    const mockLog = jest.fn()

    environmentVerifier(mockLog)

    expect(mockLog).toHaveBeenCalledWith('Environment verification is disabled.')
  })

  it('should throw error when .npmrc file does not exist', () => {
    ;(existsSync as jest.Mock).mockReturnValueOnce(false)

    expect(() => environmentVerifier()).toThrow(
      '.npmrc file not found. Please ensure you have an .npmrc file in the root of your project with the correct ignore-scripts setting.',
    )
  })

  it('should throw error when .npmrc does not have ignore-scripts=true', () => {
    ;(existsSync as jest.Mock).mockReturnValueOnce(true)
    ;(readFileSync as jest.Mock).mockReturnValueOnce('some-other-config=value')

    expect(() => environmentVerifier()).toThrow(
      'Incorrect .npmrc configuration. Please ensure your .npmrc file has "ignore-scripts=true" set.',
    )
  })

  it('should not throw when .npmrc exists with correct configuration and no Dockerfile', () => {
    ;(existsSync as jest.Mock)
      .mockReturnValueOnce(true) // .npmrc exists
      .mockReturnValueOnce(false) // Dockerfile does not exist
    ;(readFileSync as jest.Mock).mockReturnValueOnce('ignore-scripts=true')

    expect(() => environmentVerifier()).not.toThrow()
  })

  it('should throw error when Dockerfile exists but does not reference .npmrc', () => {
    ;(existsSync as jest.Mock)
      .mockReturnValueOnce(true) // .npmrc exists
      .mockReturnValueOnce(true) // Dockerfile exists
    ;(readFileSync as jest.Mock)
      .mockReturnValueOnce('ignore-scripts=true') // .npmrc content
      .mockReturnValueOnce('FROM node:18') // Dockerfile content without .npmrc reference

    expect(() => environmentVerifier()).toThrow(
      'Please ensure your Dockerfile copies the .npmrc file to the container. See here for example: https://github.com/ministryofjustice/hmpps-template-typescript/pull/719',
    )
  })

  it('should not throw when both .npmrc and Dockerfile exist with correct configuration', () => {
    ;(existsSync as jest.Mock)
      .mockReturnValueOnce(true) // .npmrc exists
      .mockReturnValueOnce(true) // Dockerfile exists
    ;(readFileSync as jest.Mock)
      .mockReturnValueOnce('ignore-scripts=true') // .npmrc content
      .mockReturnValueOnce('COPY .npmrc /app/.npmrc') // Dockerfile content with .npmrc reference

    expect(() => environmentVerifier()).not.toThrow()
  })

  it('should use custom log function when provided', () => {
    const mockLog = jest.fn()
    ;(existsSync as jest.Mock).mockReturnValueOnce(false)

    expect(() => environmentVerifier(mockLog)).toThrow()

    expect(mockLog).not.toHaveBeenCalled()
  })

  it('should call process.cwd() to construct file paths', () => {
    jest.spyOn(process, 'cwd').mockReturnValue('/test/project')
    ;(existsSync as jest.Mock)
      .mockReturnValueOnce(true) // .npmrc exists
      .mockReturnValueOnce(false) // Dockerfile does not exist
    ;(readFileSync as jest.Mock).mockReturnValueOnce('ignore-scripts=true')

    environmentVerifier()

    expect(process.cwd).toHaveBeenCalled()
    expect(existsSync).toHaveBeenCalledWith('/test/project/.npmrc')
    expect(readFileSync).toHaveBeenCalledWith('/test/project/.npmrc', 'utf-8')

    jest.restoreAllMocks()
  })

  it('should ignore whitespace around the equals sign', () => {
    ;(existsSync as jest.Mock)
      .mockReturnValueOnce(true) // .npmrc exists
      .mockReturnValueOnce(false) // Dockerfile does not exist
    ;(readFileSync as jest.Mock).mockReturnValueOnce('ignore-scripts = true')

    expect(() => environmentVerifier()).not.toThrow()
  })

  it('should ignore multiple spaces around the equals sign', () => {
    ;(existsSync as jest.Mock)
      .mockReturnValueOnce(true) // .npmrc exists
      .mockReturnValueOnce(false) // Dockerfile does not exist
    ;(readFileSync as jest.Mock).mockReturnValueOnce('ignore-scripts  =  true')

    expect(() => environmentVerifier()).not.toThrow()
  })

  it('should find ignore-scripts=true among multiple configuration lines', () => {
    ;(existsSync as jest.Mock)
      .mockReturnValueOnce(true) // .npmrc exists
      .mockReturnValueOnce(false) // Dockerfile does not exist
    ;(readFileSync as jest.Mock).mockReturnValueOnce('legacy-peer-deps=true\nignore-scripts=true\nautosave-tag=latest')

    expect(() => environmentVerifier()).not.toThrow()
  })

  it('should handle leading and trailing whitespace on the line', () => {
    ;(existsSync as jest.Mock)
      .mockReturnValueOnce(true) // .npmrc exists
      .mockReturnValueOnce(false) // Dockerfile does not exist
    ;(readFileSync as jest.Mock).mockReturnValueOnce('  ignore-scripts=true  ')

    expect(() => environmentVerifier()).not.toThrow()
  })

  it('should reject ignore-scripts with value other than true', () => {
    ;(existsSync as jest.Mock).mockReturnValueOnce(true)
    ;(readFileSync as jest.Mock).mockReturnValueOnce('ignore-scripts=false')

    expect(() => environmentVerifier()).toThrow(
      'Incorrect .npmrc configuration. Please ensure your .npmrc file has "ignore-scripts=true" set.',
    )
  })
})
