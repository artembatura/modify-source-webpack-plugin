process.env.TS_JEST_DISABLE_VER_CHECKER = 'true';

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};
