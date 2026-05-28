/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest/presets/default-esm', // <- Importante: preset para ESM
  testEnvironment: 'node',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1', // Remove o .js dos seus imports na hora de testar
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true, // Força o ts-jest a usar ESM
      },
    ],
  },
};
