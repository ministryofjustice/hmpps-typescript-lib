import { batches, runCommand, formatDate } from './utils'

// Mock execAsync for runCommand
jest.mock('util', () => {
  const originalUtil = jest.requireActual('util')
  return {
    ...originalUtil,
    promisify: jest.fn(() => jest.fn((cmd: string) => Promise.resolve({ stdout: `Executed: ${cmd}` }))),
  }
})

describe('batches', () => {
  it('should split array into batches of given size', () => {
    const input = [1, 2, 3, 4, 5]
    const result = batches(input, 2)
    expect(result).toEqual([[1, 2], [3, 4], [5]])
  })

  it('should return empty array when input is empty', () => {
    expect(batches([], 3)).toEqual([])
  })

  it('should handle batch size larger than array', () => {
    expect(batches([1, 2], 5)).toEqual([[1, 2]])
  })
})

describe('runCommand', () => {
  it('should return stdout from command', async () => {
    const result = await runCommand('echo Hello')
    expect(result).toBe('Executed: echo Hello')
  })
})

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2023-05-04T09:07:00')
    const formatted = formatDate(date)
    expect(formatted).toBe('2023-05-04 09:07')
  })

  it('should pad single-digit values', () => {
    const date = new Date(2023, 0, 1, 1, 1)
    const formatted = formatDate(date)
    expect(formatted).toBe('2023-01-01 01:01')
  })
})
