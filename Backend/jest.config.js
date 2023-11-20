/** @type {import('jest').Config} */
const config = {
  verbose: true,
  collectCoverageFrom: [
    "**/*.{js,jsx}",
    "!**/__tests__/**",
    "!**/coverage/**",
    "!**/node_modules/**",
    "!**/.gitignore",
    "!**/package.json",
    "!**/package-lock.json",
    "!**/jest.config.js",
  ],
  coverageDirectory: "coverage",
};

module.exports = config;
