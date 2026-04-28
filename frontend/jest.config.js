module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["**/tests/**/*.test.ts", "**/tests/**/*.test.tsx"],
  testPathIgnorePatterns: ["/node_modules/", "/android/", "/dist/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};
