module.exports = {
  preset: 'ts-jest', // Use ts-jest for handling TypeScript files
  testEnvironment: 'node', // Test in a Node.js environment
  moduleFileExtensions: ['ts', 'tsx', 'js'], // File extensions for modules
  roots: ['<rootDir>/packages'], // Specify root directories where tests can be found
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'], // Pattern for test files
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  coveragePathIgnorePatterns: ['.*\\/test\\/.*'],
}
