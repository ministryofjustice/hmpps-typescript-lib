import { existsSync, PathLike, PathOrFileDescriptor, readFileSync } from 'fs'
import { environmentVerifier, ERRORS, runChecks } from './environment-verifier'

jest.mock('fs')

describe('environmentVerifier', () => {
  const mockExistsSync = existsSync as jest.MockedFunction<typeof existsSync>
  const mockReadFileSync = readFileSync as jest.MockedFunction<typeof readFileSync>
  const mockLog = jest.fn()

  // Valid file contents for a passing environment
  const validFileContents = {
    npmrc: 'registry=https://registry.npmjs.org\nignore-scripts=true\n',
    dockerfile: 'FROM node:18\nCOPY .npmrc .\nCOPY .allowed-scripts.mjs .\nRUN npm install\n',
    dockerignore: 'node_modules/\n!.npmrc\n!.allowed-scripts.mjs\n',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    delete process.env.NPM_SCRIPT_ALLOWLIST_VERIFICATION_DISABLED
    mockExistsSync.mockReturnValue(false)
    mockReadFileSync.mockReturnValue('')
  })

  /**
   * Sets up mocks for a valid environment with all checks passing.
   * Can be customized by providing overrides for specific file contents and existence.
   */
  const setupValidEnvironment = (overrides?: {
    npmrcExists?: boolean
    dockerfileExists?: boolean
    dockerignoreExists?: boolean
    npmrcContent?: string
    dockerfileContent?: string
    dockerignoreContent?: string
  }) => {
    const fileContents = {
      npmrc: overrides?.npmrcContent ?? validFileContents.npmrc,
      dockerfile: overrides?.dockerfileContent ?? validFileContents.dockerfile,
      dockerignore: overrides?.dockerignoreContent ?? validFileContents.dockerignore,
    }

    mockExistsSync.mockImplementation((path: PathLike) => {
      const pathStr = path.toString()
      if (pathStr.includes('.npmrc')) return overrides?.npmrcExists ?? true
      if (pathStr.includes('Dockerfile')) return overrides?.dockerfileExists ?? true
      if (pathStr.includes('.dockerignore')) return overrides?.dockerignoreExists ?? true
      return false
    })

    mockReadFileSync.mockImplementation((path: PathOrFileDescriptor) => {
      const pathStr = path.toString()
      if (pathStr.includes('.npmrc')) return fileContents.npmrc
      if (pathStr.includes('Dockerfile')) return fileContents.dockerfile
      if (pathStr.includes('.dockerignore')) return fileContents.dockerignore
      return ''
    })
  }

  describe('when verification is disabled', () => {
    it('should skip verification when NPM_SCRIPT_ALLOWLIST_VERIFICATION_DISABLED is true', () => {
      process.env.NPM_SCRIPT_ALLOWLIST_VERIFICATION_DISABLED = 'true'
      mockExistsSync.mockReturnValue(false)

      expect(() => environmentVerifier(mockLog)).not.toThrow()
      expect(mockLog).toHaveBeenCalledWith('Environment verification is disabled.')
    })

    it('should not call any file checks when verification is disabled', () => {
      process.env.NPM_SCRIPT_ALLOWLIST_VERIFICATION_DISABLED = 'true'

      environmentVerifier(mockLog)

      expect(mockExistsSync).not.toHaveBeenCalled()
      expect(mockReadFileSync).not.toHaveBeenCalled()
    })
  })

  describe('.npmrc file checks', () => {
    describe('checkNpmrcFileExists', () => {
      it('should return no error when .npmrc file does not exist', () => {
        setupValidEnvironment({ npmrcExists: true })

        expect(runChecks()).toStrictEqual([])
      })
      it('should return NPMRC_NOT_FOUND when .npmrc file does not exist', () => {
        setupValidEnvironment({ npmrcExists: false })

        expect(runChecks()).toStrictEqual([ERRORS.NPMRC_NOT_FOUND])
      })
    })

    describe('checkIgnoreScriptsSet', () => {
      it('should return no errors when ignore-scripts=true is among other configuration', () => {
        setupValidEnvironment({
          npmrcContent: 'registry=https://registry.npmjs.org\nignore-scripts=true\nother-config=value\n',
        })

        expect(runChecks()).toStrictEqual([])
      })

      it('should return NPMRC_IGNORE_SCRIPTS_NOT_SET when ignore-scripts is not set', () => {
        setupValidEnvironment({ npmrcContent: 'registry=https://registry.npmjs.org\nother-config=value\n' })

        expect(runChecks()).toStrictEqual([ERRORS.NPMRC_IGNORE_SCRIPTS_NOT_SET])
      })

      it('should return NPMRC_IGNORE_SCRIPTS_NOT_SET when ignore-scripts is set to false', () => {
        setupValidEnvironment({ npmrcContent: 'ignore-scripts=false\n' })

        expect(runChecks()).toStrictEqual([ERRORS.NPMRC_IGNORE_SCRIPTS_NOT_SET])
      })
    })
  })

  describe('Dockerfile checks', () => {
    it('should return no Dockerfile errors when Dockerfile does not exist', () => {
      setupValidEnvironment({ dockerfileExists: false })

      const errors = runChecks()
      expect(errors).toStrictEqual([])
    })

    it('should return no Dockerfile errors when Dockerfile references both files', () => {
      setupValidEnvironment({
        dockerfileContent: 'FROM node:18\nCOPY .npmrc .\nCOPY .allowed-scripts.mjs .\nRUN npm install\n',
      })

      const errors = runChecks()
      expect(errors).toStrictEqual([])
    })

    it('should return DOCKERFILE_MISSING_NPMRC when Dockerfile does not reference .npmrc', () => {
      setupValidEnvironment({ dockerfileContent: 'FROM node:18\nCOPY .allowed-scripts.mjs .\n' })

      expect(runChecks()).toStrictEqual([ERRORS.DOCKERFILE_MISSING_NPMRC])
    })

    it('should return DOCKERFILE_MISSING_ALLOWED_SCRIPTS when Dockerfile does not reference .allowed-scripts.mjs', () => {
      setupValidEnvironment({ dockerfileContent: 'FROM node:18\nCOPY .npmrc .\n' })

      expect(runChecks()).toStrictEqual([ERRORS.DOCKERFILE_MISSING_ALLOWED_SCRIPTS])
    })

    it('should return both Dockerfile errors when neither file is referenced', () => {
      setupValidEnvironment({ dockerfileContent: 'FROM node:18\nRUN npm install\n' })

      const errors = runChecks()
      expect(errors).toStrictEqual([ERRORS.DOCKERFILE_MISSING_NPMRC, ERRORS.DOCKERFILE_MISSING_ALLOWED_SCRIPTS])
    })
  })

  describe('.dockerignore checks', () => {
    it('should return no dockerignore errors when file does not exist', () => {
      setupValidEnvironment({ dockerignoreExists: false })

      const errors = runChecks()
      expect(errors).toStrictEqual([])
    })

    it('should return no dockerignore errors when both exceptions are present', () => {
      setupValidEnvironment({ dockerignoreContent: 'node_modules/\n!.npmrc\n!.allowed-scripts.mjs\n' })

      const errors = runChecks()
      expect(errors).toStrictEqual([])
    })

    it('should return no dockerignore errors when exceptions have leading/trailing whitespace', () => {
      setupValidEnvironment({ dockerignoreContent: '  !  .npmrc  \n  !  .allowed-scripts.mjs  \n' })

      const errors = runChecks()
      expect(errors).toStrictEqual([])
    })

    it('should return DOCKERIGNORE_MISSING_NPMRC when !.npmrc exception is missing', () => {
      setupValidEnvironment({ dockerignoreContent: 'node_modules/\n!.allowed-scripts.mjs\n' })

      expect(runChecks()).toStrictEqual([ERRORS.DOCKERIGNORE_MISSING_NPMRC])
    })

    it('should return DOCKERIGNORE_MISSING_ALLOWED_SCRIPTS when !.allowed-scripts.mjs exception is missing', () => {
      setupValidEnvironment({ dockerignoreContent: 'node_modules/\n!.npmrc\n' })

      expect(runChecks()).toStrictEqual([ERRORS.DOCKERIGNORE_MISSING_ALLOWED_SCRIPTS])
    })

    it('should return both dockerignore errors when neither exception exists', () => {
      setupValidEnvironment({ dockerignoreContent: 'node_modules/\n*.log\n' })

      const errors = runChecks()
      expect(errors).toStrictEqual([ERRORS.DOCKERIGNORE_MISSING_NPMRC, ERRORS.DOCKERIGNORE_MISSING_ALLOWED_SCRIPTS])
    })
  })

  describe('error aggregation', () => {
    it('should return all applicable errors when everything fails', () => {
      setupValidEnvironment({
        npmrcExists: false,
        dockerfileContent: 'FROM node:18\n',
        dockerignoreContent: 'node_modules/\n',
      })

      const errors = runChecks()
      expect(errors).toContain(ERRORS.NPMRC_NOT_FOUND)
      expect(errors).toContain(ERRORS.DOCKERFILE_MISSING_NPMRC)
      expect(errors).toContain(ERRORS.DOCKERFILE_MISSING_ALLOWED_SCRIPTS)
      expect(errors).toContain(ERRORS.DOCKERIGNORE_MISSING_NPMRC)
      expect(errors).toContain(ERRORS.DOCKERIGNORE_MISSING_ALLOWED_SCRIPTS)
    })

    it('should return only relevant errors when npmrc exists but content is invalid', () => {
      setupValidEnvironment({
        npmrcContent: 'some invalid content',
        dockerfileContent: 'some invalid content',
        dockerignoreContent: 'some invalid content',
      })

      const errors = runChecks()
      expect(errors).not.toContain(ERRORS.NPMRC_NOT_FOUND)
      expect(errors).toContain(ERRORS.NPMRC_IGNORE_SCRIPTS_NOT_SET)
      expect(errors).toContain(ERRORS.DOCKERFILE_MISSING_NPMRC)
      expect(errors).toContain(ERRORS.DOCKERFILE_MISSING_ALLOWED_SCRIPTS)
      expect(errors).toContain(ERRORS.DOCKERIGNORE_MISSING_NPMRC)
      expect(errors).toContain(ERRORS.DOCKERIGNORE_MISSING_ALLOWED_SCRIPTS)
    })

    it('should return empty array when all checks pass', () => {
      setupValidEnvironment()

      expect(runChecks()).toEqual([])
    })
  })

  describe('environmentVerifier throws aggregated errors', () => {
    it('should throw when runChecks returns errors', () => {
      setupValidEnvironment({ npmrcExists: false })

      expect(() => environmentVerifier(mockLog)).toThrow(/Environment verification failed/)
    })

    it('should not throw when runChecks returns no errors', () => {
      setupValidEnvironment()

      expect(() => environmentVerifier(mockLog)).not.toThrow()
    })

    it('should include all error messages in thrown error', () => {
      setupValidEnvironment({ dockerfileContent: 'FROM node:18\n', dockerignoreContent: 'node_modules/\n' })

      expect(() => environmentVerifier(mockLog)).toThrow(ERRORS.DOCKERFILE_MISSING_NPMRC)
    })
  })
})
