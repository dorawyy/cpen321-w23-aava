/** @type {import('jest').Config} */
const config = {
  verbose: true,
  collectCoverageFrom: [
    "**/*.{js,jsx}",
    "!**/__tests__/**",
    "!**/node_modules/**",
    "!**/.gitignore",
    "!**/package.json",
    "!**/package-lock.json",
  ],
};

module.exports = config;
