import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardsService {
  constructor(private readonly prisma: PrismaService) {}

  async brokerSummary(tenantId: string): Promise<BrokerDashboardSummary> {
    const [leadCount, keptTours, totalTours, toursWithBba, deliverability, deals, coopTimers] =
      await Promise.all([
        this.prisma.person.count({ where: { tenantId } }),
        this.prisma.tour.count({ where: { tenantId, status: 'KEPT' } }),
        this.prisma.tour.count({ where: { tenantId } }),
        this.prisma.tour.count({
          where: {
            tenantId,
            person: {
              agreements: {
                some: {
                  type: 'BUYER_REP',
                  status: 'SIGNED',
                  OR: [{ expiryDate: null }, { expiryDate: { gte: new Date() } }]
                }
              }
            }
          }
        }),
        this.prisma.deliverabilityMetric.groupBy({
          by: ['channel'],
          where: { tenantId },
          _sum: {
            accepted: true,
            delivered: true,
            bounced: true,
            optOuts: true
          }
        }),
        this.prisma.deal.groupBy({
          by: ['stage'],
          where: { tenantId },
          _sum: {
            forecastGci: true,
            actualGci: true
          }
        }),
        this.prisma.clearCooperationTimer.findMany({ where: { tenantId } })
      ]);

    const leadToKeptRate = leadCount === 0 ? 0 : keptTours / leadCount;
    const toursWithBbaRate = totalTours === 0 ? 0 : toursWithBba / totalTours;

    const deliverabilitySummary = deliverability.map((row) => ({
      channel: row.channel,
      accepted: row._sum.accepted ?? 0,
      delivered: row._sum.delivered ?? 0,
      bounced: row._sum.bounced ?? 0,
      optOuts: row._sum.optOuts ?? 0
    }));

    const dealSummary = deals.map((row) => ({
      stage: row.stage,
      forecastGci: Number(row._sum.forecastGci ?? 0),
      actualGci: Number(row._sum.actualGci ?? 0)
    }));

    const clearCooperation = coopTimers.map((timer) => ({
      timerId: timer.id,
      status: timer.status,
      startedAt: timer.startedAt,
      deadlineAt: timer.deadlineAt
    }));

    return {
      leadToKeptRate,
      toursWithBbaRate,
      deliverability: deliverabilitySummary,
      deals: dealSummary,
      clearCooperation
    };
  }
}

export interface BrokerDashboardSummary {
  leadToKeptRate: number;
  toursWithBbaRate: number;
  deliverability: Array<{
    channel: string;
    accepted: number;
    delivered: number;
    bounced: number;
    optOuts: number;
  }>;
  deals: Array<{
    stage: string;
    forecastGci: number;
    actualGci: number;
  }>;
  clearCooperation: Array<{
    timerId: string;
    status: string;
    startedAt: Date;
    deadlineAt: Date | null;
  }>;
}
