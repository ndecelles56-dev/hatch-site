const path = require('path');

const compiledEntry = path.join(__dirname, '..', 'apps', 'api', 'dist', 'apps', 'api', 'src', 'main.js');
const sourceEntry = path.join(__dirname, '..', 'apps', 'api', 'src', 'main.ts');

const preferCompiled = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

let cachedModule;
let cachedHandler;
let lastError;

function loadModule() {
  if (cachedModule) {
    return cachedModule;
  }

  const candidates = preferCompiled ? [compiledEntry, sourceEntry] : [sourceEntry, compiledEntry];

  for (const candidate of candidates) {
    try {
      cachedModule = require(candidate);
      return cachedModule;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error('Unable to load Nest API entry point.');
}

function resolveHandler() {
  if (cachedHandler) {
    return cachedHandler;
  }

  const imported = loadModule();
  const handler = imported.default ?? imported;

  if (typeof handler !== 'function') {
    throw new TypeError('Resolved Nest API entry does not export a callable handler.');
  }

  cachedHandler = handler;
  return cachedHandler;
}

module.exports = (...args) => resolveHandler()(...args);
module.exports.default = module.exports;
