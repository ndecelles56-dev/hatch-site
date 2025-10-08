import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@hatch/db';

import { PrismaService } from '../prisma/prisma.service';
import { RequestContext } from '../common/request-context';
import { CapProgressQueryDto } from './dto/cap-progress.dto';

const requireTenant = (ctx: RequestContext) => {
  if (!ctx.tenantId) {
    throw new ForbiddenException('tenantId is required');
  }
  return ctx.tenantId;
};

@Injectable()
export class CapLedgerService {
  constructor(private readonly prisma: PrismaService) {}

  async getCapProgress(ctx: RequestContext, query: CapProgressQueryDto) {
    const tenantId = requireTenant(ctx);

    const where: Prisma.CapLedgerWhereInput = { tenantId };

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.periodStart || query.periodEnd) {
      where.AND = [];
      if (query.periodStart) {
        where.AND.push({ periodEnd: { gte: query.periodStart } });
      }
      if (query.periodEnd) {
        where.AND.push({ periodStart: { lte: query.periodEnd } });
      }
    }

    // Filter by team if provided
    if (query.teamId) {
      const teamMembers = await this.prisma.teamMembership.findMany({
        where: { teamId: query.teamId },
        select: { userId: true }
      });
      const userIds = teamMembers.map((member) => member.userId);
      if (userIds.length === 0) {
        return [];
      }
      where.userId = { in: userIds };
    }

    const ledgers = await this.prisma.capLedger.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        plan: { select: { id: true, name: true, type: true } }
      },
      orderBy: [{ periodStart: 'desc' }]
    });

    return ledgers.map((ledger) => {
      const capAmount = Number(ledger.capAmount);
      const companyDollar = Number(ledger.companyDollarYtd);
      const postCapFees = Number(ledger.postCapFeesYtd);
      const progressPct = capAmount > 0 ? Math.min(companyDollar / capAmount, 1) : 0;

      return {
        id: ledger.id,
        userId: ledger.userId,
        userName: `${ledger.user.firstName} ${ledger.user.lastName}`.trim(),
        plan: ledger.plan,
        capAmount,
        companyDollarYtd: companyDollar,
        postCapFeesYtd: postCapFees,
        progressPct,
        periodStart: ledger.periodStart,
        periodEnd: ledger.periodEnd,
        lastDealId: ledger.lastDealId
      };
    });
  }
}
