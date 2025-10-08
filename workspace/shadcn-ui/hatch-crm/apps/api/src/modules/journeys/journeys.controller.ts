import { Body, Controller, Param, Post } from '@nestjs/common';

import { JourneysService } from './journeys.service';

@Controller('journeys')
export class JourneysController {
  constructor(private readonly journeys: JourneysService) {}

  @Post(':id/simulate')
  async simulate(
    @Param('id') id: string,
    @Body('tenantId') tenantId: string,
    @Body('context') context: Record<string, unknown>
  ) {
    return this.journeys.simulate(id, tenantId, context ?? {});
  }
}
