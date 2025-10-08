import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ActivityType, Prisma } from '@hatch/db';
import type { CommissionPlanDefinition } from './validators/plan-definition.schema';

import { PrismaService } from '../prisma/prisma.service';
import { RequestContext } from '../common/request-context';
import { commissionPlanDefinitionSchema } from './validators/plan-definition.schema';
import { CreateCommissionPlanDto } from './dto/create-plan.dto';
import { UpdateCommissionPlanDto } from './dto/update-plan.dto';

const requireTenant = (ctx: RequestContext) => {
  if (!ctx.tenantId) {
    throw new ForbiddenException('tenantId is required');
  }
  return ctx.tenantId;
};

@Injectable()
export class CommissionPlansService {
  constructor(private readonly prisma: PrismaService) {}

  async listPlans(ctx: RequestContext) {
    const tenantId = requireTenant(ctx);
    const plans = await this.prisma.commissionPlan.findMany({
      where: { tenantId },
      orderBy: [{ isArchived: 'asc' }, { name: 'asc' }]
    });
    return plans;
  }

  async getPlanOrThrow(id: string, ctx: RequestContext) {
    const tenantId = requireTenant(ctx);
    const plan = await this.prisma.commissionPlan.findFirst({ where: { id, tenantId } });
    if (!plan) {
      throw new NotFoundException('Commission plan not found');
    }
    return plan;
  }

  async createPlan(dto: CreateCommissionPlanDto, ctx: RequestContext) {
    const tenantId = requireTenant(ctx);
    const definition = commissionPlanDefinitionSchema.parse(dto.definition) as CommissionPlanDefinition;

    const data: Prisma.CommissionPlanCreateInput = {
      tenant: { connect: { id: tenantId } },
      name: dto.name,
      type: dto.type,
      description: dto.description,
      definition: definition as Prisma.InputJsonValue,
      postCapFee: dto.postCapFee ? (dto.postCapFee as unknown as Prisma.InputJsonValue) : null,
      bonusRules: dto.bonusRules ? (dto.bonusRules as Prisma.InputJsonValue) : null,
      isArchived: dto.archived ?? false,
      version: 1,
      createdBy: ctx.userId ? { connect: { id: ctx.userId } } : undefined
    };

    const result = await this.prisma.$transaction(async (tx) => {
      const plan = await tx.commissionPlan.create({ data });
      await tx.planSnapshot.create({
        data: {
          tenantId,
          planId: plan.id,
          version: plan.version,
          payload: plan.definition as Prisma.InputJsonValue,
          createdById: ctx.userId ?? null
        }
      });
      await this.logActivity(tx, tenantId, ctx.userId, ActivityType.COMMISSION_PLAN_CREATED, {
        planId: plan.id,
        version: plan.version,
        name: plan.name,
        type: plan.type
      });
      return plan;
    });

    return result;
  }

  async updatePlan(id: string, dto: UpdateCommissionPlanDto, ctx: RequestContext) {
    const tenantId = requireTenant(ctx);
    const existing = await this.prisma.commissionPlan.findFirst({ where: { id, tenantId } });
    if (!existing) {
      throw new NotFoundException('Commission plan not found');
    }

    const definition = dto.definition
      ? (commissionPlanDefinitionSchema.parse(dto.definition) as CommissionPlanDefinition)
      : (existing.definition as CommissionPlanDefinition);

    const nextVersion = existing.version + 1;

    const updated = await this.prisma.$transaction(async (tx) => {
      const plan = await tx.commissionPlan.update({
        where: { id },
        data: {
          name: dto.name ?? existing.name,
          type: dto.type ?? existing.type,
          description: dto.description ?? existing.description,
          definition: definition as Prisma.InputJsonValue,
          postCapFee: dto.postCapFee
            ? (dto.postCapFee as unknown as Prisma.InputJsonValue)
            : (existing.postCapFee as Prisma.InputJsonValue | null),
          bonusRules: dto.bonusRules
            ? (dto.bonusRules as Prisma.InputJsonValue)
            : (existing.bonusRules as Prisma.InputJsonValue | null),
          isArchived: dto.archived ?? existing.isArchived,
          version: nextVersion
        }
      });

      await tx.planSnapshot.create({
        data: {
          tenantId,
          planId: plan.id,
          version: plan.version,
          payload: plan.definition as Prisma.InputJsonValue,
          createdById: ctx.userId ?? null
        }
      });

      await this.logActivity(tx, tenantId, ctx.userId, ActivityType.COMMISSION_PLAN_UPDATED, {
        planId: plan.id,
        version: plan.version,
        changedFields: Object.keys(dto)
      });

      return plan;
    });

    return updated;
  }

  async archivePlan(id: string, ctx: RequestContext) {
    const tenantId = requireTenant(ctx);
    const plan = await this.prisma.commissionPlan.updateMany({
      where: { id, tenantId, isArchived: false },
      data: { isArchived: true }
    });
    if (plan.count === 0) {
      throw new NotFoundException('Commission plan not found');
    }
    await this.prisma.activity.create({
      data: {
        tenantId,
        userId: ctx.userId ?? null,
        type: ActivityType.COMMISSION_PLAN_ARCHIVED,
        payload: { planId: id } as Prisma.InputJsonValue
      }
    });
    return { id };
  }

  private async logActivity(
    tx: Prisma.TransactionClient,
    tenantId: string,
    userId: string | undefined,
    type: ActivityType,
    payload: Record<string, unknown>
  ) {
    await tx.activity.create({
      data: {
        tenantId,
        userId: userId ?? null,
        type,
        payload: payload as Prisma.InputJsonValue
      }
    });
  }
}
