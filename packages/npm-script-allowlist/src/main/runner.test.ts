import { Runner } from './runner'
import { Config } from './types/configuration-loading'

describe('run()', () => {
  const mockReadFile = jest.fn()
  const mockDynamicImport = jest.fn()
  const mockLog = jest.fn()
  const mockError = jest.fn()
  const mockExit = jest.fn(() => {
    throw new Error('exit')
  })
  const mockRunScript = jest.fn()
  const mockFetchPackages = jest.fn()
  const mockReadConfiguration = jest.fn()
  const mockVerifyEnvironment = jest.fn()

  const deps = {
    readFile: mockReadFile,
    dynamicImport: mockDynamicImport,
    log: mockLog,
    error: mockError,
    exit: mockExit,
    runScript: mockRunScript,
    fetchPackageInfo: mockFetchPackages,
    readConfiguration: mockReadConfiguration,
    verifyEnvironment: mockVerifyEnvironment,
  }

  const mockPackageLockJson = {
    packages: {
      'package-a': {
        version: '1.0.0',
        hasInstallScript: true,
      },
    },
  }

  const mockConfig: Config = {
    allowlist: {
      'package-a@1.0.0': 'ALLOW',
    },
    dependencyScriptsToRun: ['install'],
    localScriptsToRun: ['postinstall'],
  }

  const mockDerivedConfig = {
    configToPrint: {
      'package-a@1.0.0': 'ALLOW',
    },
    packages: {
      toRun: ['package-a'],
      toConfigure: [],
      toRemove: [],
      incorrectlyConfigured: false,
    },
    scripts: {
      dependencyScriptsToRun: ['install'],
      localScriptsToRun: ['postinstall'],
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()

    mockReadFile.mockReturnValue(JSON.stringify(mockPackageLockJson))
    mockDynamicImport.mockResolvedValue({ default: mockConfig })
    mockReadConfiguration.mockReturnValue(mockDerivedConfig)
  })

  it('should exit if env is not correct', async () => {
    mockVerifyEnvironment.mockImplementation(() => {
      throw new Error('exit')
    })

    await expect(new Runner(deps).run()).rejects.toThrow('exit')
    expect(mockVerifyEnvironment).toHaveBeenCalled()
  })

  it('should run scripts when configuration is correct', async () => {
    await expect(new Runner(deps).run()).resolves.not.toThrow()

    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('Running dependency scripts'))
    expect(mockRunScript).toHaveBeenCalledWith({ path: 'package-a', event: 'install' })

    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('Running local scripts'))
    expect(mockRunScript).toHaveBeenCalledWith({ path: '.', event: 'postinstall' })

    expect(mockLog).toHaveBeenCalledWith('FIN!')
  })

  // we know certain scripts will fail (e.g. postinstall scripts that expect to be run in the context of the package), but we don't want that to cause the whole process to fail.
  it('should not error when scripts fail to execute', async () => {
    await expect(new Runner(deps).run()).resolves.not.toThrow()

    mockRunScript.mockImplementation(() => {
      throw new Error('exit')
    })

    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('Running dependency scripts'))
    expect(mockRunScript).toHaveBeenCalledWith({ path: 'package-a', event: 'install' })

    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('Running local scripts'))
    expect(mockRunScript).toHaveBeenCalledWith({ path: '.', event: 'postinstall' })

    expect(mockLog).toHaveBeenCalledWith('FIN!')
  })

  it('should exit with error if packages are incorrectly configured', async () => {
    mockReadConfiguration.mockReturnValue({
      ...mockDerivedConfig,
      packages: {
        ...mockDerivedConfig.packages,
        incorrectlyConfigured: true,
      },
    })

    await expect(() => new Runner(deps).run()).rejects.toThrow('exit')
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('should exit with 0 if no scripts to run', async () => {
    mockReadConfiguration.mockReturnValue({
      ...mockDerivedConfig,
      packages: {
        ...mockDerivedConfig.packages,
        toRun: [],
      },
    })

    await expect(new Runner(deps).run()).rejects.toThrow('exit')
    expect(mockExit).toHaveBeenCalledWith(0)
    expect(mockLog).toHaveBeenCalledWith('No scripts to run')
  })
})
