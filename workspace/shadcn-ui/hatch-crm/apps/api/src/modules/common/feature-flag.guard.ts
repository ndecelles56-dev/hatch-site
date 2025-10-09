import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';

import { FeatureFlagsService } from '../feature-flags/feature-flags.service';
import { FEATURE_FLAG_KEY } from './feature-flag.decorator';

@Injectable()
export class FeatureFlagGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly featureFlags: FeatureFlagsService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const flagName = this.reflector.getAllAndOverride<string>(FEATURE_FLAG_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (!flagName) {
      return true;
    }

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const rawTenantId = request?.headers?.['x-tenant-id'];
    const tenantId = Array.isArray(rawTenantId) ? rawTenantId[0] : rawTenantId;

    const enabled = await this.featureFlags.isEnabled(flagName, tenantId);
    if (!enabled) {
      throw new ForbiddenException(`Feature "${flagName}" is disabled`);
    }

    return true;
  }
}
