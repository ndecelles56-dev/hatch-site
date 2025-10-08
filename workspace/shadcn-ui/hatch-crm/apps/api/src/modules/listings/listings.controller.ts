import { Controller, Get, Query } from '@nestjs/common';
import type { Listing } from '@hatch/db';

import { ListingsService } from './listings.service';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listings: ListingsService) {}

  @Get()
  async list(@Query('tenantId') tenantId: string): Promise<Listing[]> {
    return this.listings.list(tenantId);
  }
}
