import { exec } from 'child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

export const batches = <T>(arr: T[], size: number): T[][] =>
  arr.length === 0 ? [] : [arr.slice(0, size), ...batches(arr.slice(size), size)]

export const runCommand = async (command: string) => {
  const { stdout } = await execAsync(command)
  return stdout
}

export const formatDate = (date: Date) => {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}`
}
