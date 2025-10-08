import { Injectable, NotFoundException } from '@nestjs/common';
import { SimulationResult, simulateJourney } from '@hatch/shared';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JourneysService {
  constructor(private readonly prisma: PrismaService) {}

  async simulate(
    journeyId: string,
    tenantId: string,
    context: Record<string, unknown>
  ): Promise<SimulationResult> {
    const journey = await this.prisma.journey.findFirst({
      where: { id: journeyId, tenantId }
    });

    if (!journey) {
      throw new NotFoundException('Journey not found');
    }

    return simulateJourney(journey as any, {
      trigger: journey.trigger as any,
      context
    });
  }
}
