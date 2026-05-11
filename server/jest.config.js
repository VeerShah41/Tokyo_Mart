/** @type {import('jest').Config} */
module.exports = {
  // Use ts-jest to handle TypeScript files
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Transform both .ts and .js test/source files
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        // Relax for tests (same as tsconfig.json)
        strict: false,
        noImplicitAny: false,
        moduleDetection: 'force',
      },
    }],
  },

  // Find test files in tests/ directory
  testMatch: ['**/tests/**/*.test.[jt]s', '**/?(*.)spec.[jt]s'],

  // Ignore compiled output and node_modules
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],

  // Allow require() in test files (CommonJS)
  moduleFileExtensions: ['ts', 'js', 'json'],
};
