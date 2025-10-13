// Prefer the precompiled Nest app when available (used in Vercel builds)
// and fall back to the TypeScript source for local development.
let modulePath;

try {
  modulePath = require.resolve('../apps/api/dist/apps/api/src/main');
} catch {
  modulePath = require.resolve('../apps/api/src/main');
}

const imported = require(modulePath);
const handler = imported.default ?? imported;

module.exports = handler;
module.exports.default = handler;
