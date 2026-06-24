const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  testMatch: ["**/__tests__/**/*.test.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  // Évite OOM avec next/jest (workers parallèles + compilation Next.js)
  maxWorkers: 1,
  workerIdleMemoryLimit: "512MB",
};

module.exports = createJestConfig(customJestConfig);
