module.exports = {
  projects: [
    {
      displayName: 'main',
      preset: 'ts-jest',
      testEnvironment: 'node',
      roots: ['<rootDir>/src/main'],
      testMatch: ['**/__tests__/**/*.test.ts'],
      moduleFileExtensions: ['ts', 'js', 'json'],
      collectCoverageFrom: [
        'src/main/**/*.ts',
        '!src/main/**/*.d.ts',
        '!src/main/**/__tests__/**'
      ],
      transform: {
        '^.+\\.ts$': ['ts-jest', {
          tsconfig: {
            module: 'commonjs',
            esModuleInterop: true
          }
        }]
      }
    },
    {
      displayName: 'renderer',
      testEnvironment: 'jsdom',
      roots: ['<rootDir>/src/renderer'],
      testMatch: ['**/__tests__/**/*.test.js'],
      moduleFileExtensions: ['js', 'json']
    }
  ]
};
