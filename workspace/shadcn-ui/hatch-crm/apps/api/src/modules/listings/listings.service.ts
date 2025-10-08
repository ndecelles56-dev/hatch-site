import { Injectable } from '@nestjs/common';
import { Listing } from '@hatch/db';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string): Promise<Listing[]> {
    return this.prisma.listing.findMany({
      where: { tenantId },
      orderBy: { updatedAt: 'desc' },
      take: 50
    });
  }
}
