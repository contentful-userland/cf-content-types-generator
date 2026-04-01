/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  coveragePathIgnorePatterns: ['/node_modules/', '/lib/'],
  preset: 'ts-jest',
  testEnvironment: 'node',
};
