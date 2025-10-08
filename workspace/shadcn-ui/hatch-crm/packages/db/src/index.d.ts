import { PrismaClient } from '@prisma/client';
export * from '@prisma/client';
declare class ExtendedPrismaClient extends PrismaClient {
    constructor();
}
export declare const prisma: ExtendedPrismaClient;
export declare const connectPrisma: () => Promise<void>;
export declare const disconnectPrisma: () => Promise<void>;
