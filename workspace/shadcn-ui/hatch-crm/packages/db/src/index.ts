import { PrismaClient } from '@prisma/client';

export * from '@prisma/client';

class ExtendedPrismaClient extends PrismaClient {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
    });
  }
}

export const prisma = new ExtendedPrismaClient();

export const connectPrisma = async () => {
  if (!prisma) return;
  await prisma.$connect();
};

export const disconnectPrisma = async () => {
  await prisma.$disconnect();
};
