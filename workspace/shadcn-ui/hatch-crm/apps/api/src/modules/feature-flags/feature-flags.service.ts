import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../prisma/prisma.service';

export type FeatureFlagName = 'dealDeskCommission';

@Injectable()
export class FeatureFlagsService {
  constructor(private readonly config: ConfigService, private readonly prisma: PrismaService) {}

  private getGlobalFlags(): Record<string, boolean> {
    return this.config.get<Record<string, boolean>>('features') ?? {};
  }

  private async getTenantFlags(tenantId: string): Promise<string[]> {
    if (!tenantId) {
      return [];
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { featureFlags: true }
    });

    return tenant?.featureFlags ?? [];
  }

  async listEnabled(tenantId?: string | null): Promise<FeatureFlagName[]> {
    const entries = Object.entries(this.getGlobalFlags())
      .filter(([, enabled]) => Boolean(enabled))
      .map(([name]) => name as FeatureFlagName);

    const result = new Set<FeatureFlagName>(entries);

    if (tenantId) {
      const tenantFlags = await this.getTenantFlags(tenantId);
      tenantFlags.forEach((flag) => result.add(flag as FeatureFlagName));
    }

    return Array.from(result).sort();
  }

  async isEnabled(flag: string, tenantId?: string | null): Promise<boolean> {
    const globalFlags = this.getGlobalFlags();
    if (globalFlags[flag]) {
      return true;
    }

    if (!tenantId) {
      return false;
    }

    const tenantFlags = await this.getTenantFlags(tenantId);
    return tenantFlags.includes(flag);
  }
}
