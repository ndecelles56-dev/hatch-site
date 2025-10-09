import { Controller, Get, Req } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

import { resolveRequestContext } from '../common/request-context';
import { FeatureFlagsService } from './feature-flags.service';

@Controller('feature-flags')
export class FeatureFlagsController {
  constructor(private readonly featureFlags: FeatureFlagsService) {}

  @Get()
  async list(@Req() req: FastifyRequest) {
    const ctx = resolveRequestContext(req);
    const features = await this.featureFlags.listEnabled(ctx.tenantId);
    return { features };
  }
}
