#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ensureDir = (dir) => {
  fs.mkdirSync(dir, { recursive: true });
};

const copyDir = (src, dest) => {
  if (!fs.existsSync(src)) {
    throw new Error(`Missing Prisma artifact at ${src}`);
  }

  fs.rmSync(dest, { recursive: true, force: true });
  ensureDir(path.dirname(dest));
  fs.cpSync(src, dest, { recursive: true });
};

const resolveFrom = (candidates, id) => {
  for (const base of candidates) {
    try {
      return require.resolve(id, { paths: [base] });
    } catch {
      // continue searching
    }
  }
  throw new Error(`Unable to resolve "${id}" from: ${candidates.join(', ')}`);
};

const main = () => {
  const scriptDir = __dirname;
  const workspaceRoot = path.resolve(scriptDir, '../../..');
  const dbPackageDir = path.resolve(workspaceRoot, 'packages/db');

  const prismaClientEntry = resolveFrom(
    [dbPackageDir, workspaceRoot, scriptDir],
    '@prisma/client'
  );

  const prismaClientDir = path.dirname(prismaClientEntry);
  const nodeModulesDir = path.resolve(prismaClientDir, '..', '..');
  const sourcePrismaDir = path.resolve(nodeModulesDir, '.prisma');
  const sourceVendorDir = path.resolve(nodeModulesDir, '@prisma');

  const apiNodeModules = path.resolve(workspaceRoot, 'apps/api/node_modules');
  const targetPrismaDir = path.join(apiNodeModules, '.prisma');
  const targetVendorDir = path.join(apiNodeModules, '@prisma');

  console.log('[sync-prisma-client] prismaClientEntry:', prismaClientEntry);
  console.log('[sync-prisma-client] sourcePrismaDir:', sourcePrismaDir);
  console.log('[sync-prisma-client] sourceVendorDir:', sourceVendorDir);
  console.log('[sync-prisma-client] targetPrismaDir:', targetPrismaDir);
  console.log('[sync-prisma-client] targetVendorDir:', targetVendorDir);

  copyDir(sourcePrismaDir, targetPrismaDir);
  copyDir(sourceVendorDir, targetVendorDir);
};

try {
  main();
} catch (error) {
  console.error('[sync-prisma-client] Failed to copy Prisma client artifacts:', error);
  process.exit(1);
}
