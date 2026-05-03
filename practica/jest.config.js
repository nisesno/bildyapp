export default {
  testEnvironment: 'node',
  transform: {},
  moduleFileExtensions: ['js'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/config/swagger.js',
  ],
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
  testTimeout: 30000,
  verbose: true,
};
