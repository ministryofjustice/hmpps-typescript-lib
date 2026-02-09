import * as fs from 'node:fs'
import { globSync } from 'glob'

export default class LocaleFileLoader {
  /**
   * Validates that the user pattern contains both [lng] and [name] placeholders.
   * Throws an error if not.
   */
  private validatePattern(userPattern: string): void {
    if (!userPattern.includes('[lng]') || !userPattern.includes('[name]')) {
      throw new Error('Invalid pattern: the path must contain both [lng] and [name] placeholders.')
    }
  }

  /**
   * Converts a user pattern with placeholders `[lng]` and `[name]` into
   * a glob pattern. For example, replacing placeholders with `*`.
   */
  private patternToGlob(userPattern: string): string {
    return userPattern.replace(/\[lng]/g, '*').replace(/\[name]/g, '*')
  }

  /**
   * Loads all files matching the user's glob-style pattern (with [lng], [name] placeholders).
   * Then extracts [lng] and [name] from each matched path using a capturing regex.
   *
   * @param userPattern The file path pattern.
   * @param supportedLocales Array of supported locale codes.
   * @returns Translations organized by locale and file name.
   */
  public loadFiles(userPattern: string): Array<{ filePath: string; jsonData: any }> {
    this.validatePattern(userPattern)

    const globPattern = this.patternToGlob(userPattern)
    const matchedPaths = globSync(globPattern, { nodir: true })
    const normalizedPaths = matchedPaths.map(path => path.replace(/\\/g, '/'))

    return normalizedPaths.reduce(
      (results, filePath) => {
        try {
          const fileContent = fs.readFileSync(filePath, 'utf-8')
          const jsonData = JSON.parse(fileContent)
          results.push({ filePath, jsonData })
        } catch (error) {
          console.error(`Failed to load or parse locale file "${filePath}":`, error)
        }
        return results
      },
      [] as Array<{ filePath: string; jsonData: any }>,
    )
  }
}
