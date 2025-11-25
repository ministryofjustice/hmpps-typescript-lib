import { fetchPackageInfo } from './fetch-package-info'
import * as utils from './utils'

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),

  batches: jest.fn().mockImplementation(arr => [arr]), // single batch,

  formatDate: jest.fn().mockImplementation(() => '2023-01-01 00:00'), // hardcoded date

  runCommand: jest.fn().mockImplementation(async (cmd: string) => {
    const pkg = cmd.match(/npm show (.+)@(.+) --json/)
    const version = pkg?.[2]
    return JSON.stringify({
      time: { [version!]: '2023-01-01T00:00:00.000Z' },
      scripts: {
        install: 'do install',
        test: 'do test',
      },
    })
  }),
}))

describe('fetchPackageInfo', () => {
  const mockRunCommand = utils.runCommand as jest.Mock
  const packages: [string, string][] = [
    ['package-a', '1.0.0'],
    ['package-b', '2.0.0'],
    ['package-b/node_modules/package-c', '3.0.0'],
    ['package-b/node_modules/package-c/node_modules/package-c', '4.0.0'],
  ]

  const allowedScripts = ['install', 'postinstall']

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch and format package info correctly', async () => {
    const result = await fetchPackageInfo(packages, allowedScripts)

    expect(result).toEqual({
      'node_modules/package-a': {
        published: '2023-01-01 00:00',
        scripts: {
          install: 'do install',
        },
      },
      'node_modules/package-b': {
        published: '2023-01-01 00:00',
        scripts: {
          install: 'do install',
        },
      },
      'node_modules/package-b/node_modules/package-c': {
        published: '2023-01-01 00:00',
        scripts: {
          install: 'do install',
        },
      },
      'node_modules/package-b/node_modules/package-c/node_modules/package-c': {
        published: '2023-01-01 00:00',
        scripts: {
          install: 'do install',
        },
      },
    })
  })

  it('should look up packages by real name including for nested packages', async () => {
    await fetchPackageInfo(packages, allowedScripts)

    expect(mockRunCommand).toHaveBeenCalledWith('npm show package-a@1.0.0 --json')
    expect(mockRunCommand).toHaveBeenCalledWith('npm show package-b@2.0.0 --json')
    expect(mockRunCommand).toHaveBeenCalledWith('npm show package-c@3.0.0 --json')
    expect(mockRunCommand).toHaveBeenCalledWith('npm show package-c@4.0.0 --json')
  })

  it('should filter out scripts not in allowed list', async () => {
    mockRunCommand.mockResolvedValueOnce(
      JSON.stringify({
        time: { '1.0.0': '2023-01-01T00:00:00.000Z' },
        scripts: {
          test: 'do test',
        },
      }),
    )

    const result = await fetchPackageInfo([['package-a', '1.0.0']], allowedScripts)

    expect(result).toEqual({
      'node_modules/package-a': {
        published: '2023-01-01 00:00',
        scripts: {},
      },
    })
  })
})
