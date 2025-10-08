import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

import { UserRole } from '@hatch/db';

import { resolveRequestContext } from '../common/request-context';
import { CommissionPlansService } from './commission-plans.service';
import { PlanAssignmentService } from './plan-assignment.service';
import { CapLedgerService } from './cap-ledger.service';
import { CreateCommissionPlanDto } from './dto/create-plan.dto';
import { UpdateCommissionPlanDto } from './dto/update-plan.dto';
import { AssignCommissionPlanDto } from './dto/assign-plan.dto';
import { CapProgressQueryDto } from './dto/cap-progress.dto';

const ensureRole = (role: UserRole, allowed: UserRole[]) => {
  if (!allowed.includes(role)) {
    throw new ForbiddenException('Insufficient permissions');
  }
};

@Controller('commission-plans')
export class CommissionPlansController {
  constructor(
    private readonly plans: CommissionPlansService,
    private readonly assignments: PlanAssignmentService,
    private readonly capLedger: CapLedgerService
  ) {}

  @Get()
  async listPlans(@Req() req: FastifyRequest) {
    const ctx = resolveRequestContext(req);
    return this.plans.listPlans(ctx);
  }

  @Post()
  async createPlan(@Body() dto: CreateCommissionPlanDto, @Req() req: FastifyRequest) {
    const ctx = resolveRequestContext(req);
    ensureRole(ctx.role, [UserRole.BROKER]);
    return this.plans.createPlan(dto, ctx);
  }

  @Patch(':id')
  async updatePlan(@Param('id') id: string, @Body() dto: UpdateCommissionPlanDto, @Req() req: FastifyRequest) {
    const ctx = resolveRequestContext(req);
    ensureRole(ctx.role, [UserRole.BROKER]);
    return this.plans.updatePlan(id, dto, ctx);
  }

  @Post(':id/archive')
  async archivePlan(@Param('id') id: string, @Req() req: FastifyRequest) {
    const ctx = resolveRequestContext(req);
    ensureRole(ctx.role, [UserRole.BROKER]);
    return this.plans.archivePlan(id, ctx);
  }

  @Get(':id')
  async getPlan(@Param('id') id: string, @Req() req: FastifyRequest) {
    const ctx = resolveRequestContext(req);
    return this.plans.getPlanOrThrow(id, ctx);
  }

  @Get(':id/assignments')
  async listAssignments(@Param('id') id: string, @Req() req: FastifyRequest) {
    const ctx = resolveRequestContext(req);
    ensureRole(ctx.role, [UserRole.BROKER, UserRole.TEAM_LEAD]);
    return this.assignments.listAssignments(id, ctx);
  }

  @Post(':id/assignments')
  async assignPlan(
    @Param('id') id: string,
    @Body() dto: AssignCommissionPlanDto,
    @Req() req: FastifyRequest
  ) {
    const ctx = resolveRequestContext(req);
    ensureRole(ctx.role, [UserRole.BROKER]);
    return this.assignments.assignPlan(id, dto, ctx);
  }

  @Post('assignments/:assignmentId/end')
  async endAssignment(
    @Param('assignmentId') assignmentId: string,
    @Body('effectiveTo') effectiveTo: Date | null,
    @Req() req: FastifyRequest
  ) {
    const ctx = resolveRequestContext(req);
    ensureRole(ctx.role, [UserRole.BROKER]);
    return this.assignments.endAssignment(assignmentId, effectiveTo ? new Date(effectiveTo) : null, ctx);
  }

  @Get('cap-progress')
  async getCapProgress(@Query() query: CapProgressQueryDto, @Req() req: FastifyRequest) {
    const ctx = resolveRequestContext(req);
    ensureRole(ctx.role, [UserRole.BROKER, UserRole.TEAM_LEAD]);
    return this.capLedger.getCapProgress(ctx, query);
  }
}
