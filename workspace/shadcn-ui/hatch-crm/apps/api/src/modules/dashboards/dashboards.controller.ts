import { Controller, Get, Query } from '@nestjs/common';

import { DashboardsService, type BrokerDashboardSummary } from './dashboards.service';

@Controller('dashboards')
export class DashboardsController {
  constructor(private readonly dashboards: DashboardsService) {}

  @Get('broker')
  async broker(@Query('tenantId') tenantId: string): Promise<BrokerDashboardSummary> {
    return this.dashboards.brokerSummary(tenantId);
  }
}
