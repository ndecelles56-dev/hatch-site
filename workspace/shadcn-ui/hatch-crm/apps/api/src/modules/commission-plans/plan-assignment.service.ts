import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ActivityType, Prisma } from '@hatch/db';

import { PrismaService } from '../prisma/prisma.service';
import { RequestContext } from '../common/request-context';
import { AssignCommissionPlanDto } from './dto/assign-plan.dto';

const requireTenant = (ctx: RequestContext) => {
  if (!ctx.tenantId) {
    throw new ForbiddenException('tenantId is required');
  }
  return ctx.tenantId;
};

@Injectable()
export class PlanAssignmentService {
  constructor(private readonly prisma: PrismaService) {}

  async listAssignments(planId: string, ctx: RequestContext) {
    const tenantId = requireTenant(ctx);
    const plan = await this.prisma.commissionPlan.findFirst({ where: { id: planId, tenantId } });
    if (!plan) {
      throw new NotFoundException('Commission plan not found');
    }
    return this.prisma.planAssignment.findMany({
      where: { tenantId, planId },
      orderBy: [{ effectiveFrom: 'desc' }]
    });
  }

  async assignPlan(planId: string, dto: AssignCommissionPlanDto, ctx: RequestContext) {
    const tenantId = requireTenant(ctx);

    const plan = await this.prisma.commissionPlan.findFirst({ where: { id: planId, tenantId } });
    if (!plan) {
      throw new NotFoundException('Commission plan not found');
    }

    const assignment = await this.prisma.planAssignment.create({
      data: {
        tenantId,
        planId,
        assigneeType: dto.assigneeType,
        assigneeId: dto.assigneeId,
        effectiveFrom: dto.effectiveFrom,
        effectiveTo: dto.effectiveTo ?? null,
        priority: dto.priority ?? 0,
        createdById: ctx.userId ?? null
      }
    });

    await this.prisma.activity.create({
      data: {
        tenantId,
        userId: ctx.userId ?? null,
        type: ActivityType.COMMISSION_PLAN_ASSIGNED,
        payload: {
          planId,
          assignmentId: assignment.id,
          assigneeType: assignment.assigneeType,
          assigneeId: assignment.assigneeId,
          effectiveFrom: assignment.effectiveFrom.toISOString(),
          effectiveTo: assignment.effectiveTo?.toISOString() ?? null
        } as Prisma.InputJsonValue
      }
    });

    return assignment;
  }

  async endAssignment(assignmentId: string, effectiveTo: Date | null, ctx: RequestContext) {
    const tenantId = requireTenant(ctx);
    const assignment = await this.prisma.planAssignment.findFirst({
      where: { id: assignmentId, tenantId }
    });
    if (!assignment) {
      throw new NotFoundException('Plan assignment not found');
    }

    const updated = await this.prisma.planAssignment.update({
      where: { id: assignmentId },
      data: { effectiveTo }
    });

    await this.prisma.activity.create({
      data: {
        tenantId,
        userId: ctx.userId ?? null,
        type: ActivityType.COMMISSION_PLAN_ASSIGNMENT_ENDED,
        payload: {
          assignmentId,
          planId: assignment.planId,
          effectiveTo: effectiveTo?.toISOString() ?? null
        } as Prisma.InputJsonValue
      }
    });

    return updated;
  }
}
