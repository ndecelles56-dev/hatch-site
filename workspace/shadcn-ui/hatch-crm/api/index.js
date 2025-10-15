// Prefer the precompiled Nest app when available (used in Vercel builds)
// and fall back to the TypeScript source for local development.
let modulePath;

const compiledEntry = '../apps/api/dist/apps/api/src/main';
const sourceEntry = '../apps/api/src/main';

const shouldForceCompiled = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

try {
  modulePath = require.resolve(compiledEntry);
} catch (error) {
  if (shouldForceCompiled) {
    throw error;
  }
}

if (!modulePath) {
  modulePath = require.resolve(sourceEntry);
}

const imported = require(modulePath);
const handler = imported.default ?? imported;

module.exports = handler;
module.exports.default = handler;
