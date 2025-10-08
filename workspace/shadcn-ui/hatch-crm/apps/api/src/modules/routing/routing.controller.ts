import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

import { resolveRequestContext } from '../common/request-context';
import { CreateRoutingRuleDto } from './dto/create-routing-rule.dto';
import { UpdateRoutingRuleDto } from './dto/update-routing-rule.dto';
import { RoutingService } from './routing.service';

const parseMaybeJson = (value: unknown) => {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      throw new BadRequestException('Invalid JSON payload');
    }
  }
  return value;
};

@Controller('routing')
export class RoutingController {
  constructor(private readonly routing: RoutingService) {}

  @Get('rules')
  async listRules(@Query('tenantId') tenantId: string | undefined, @Req() req: FastifyRequest) {
    const ctx = resolveRequestContext(req);
    const scopedTenantId = this.resolveTenantId(ctx, tenantId);
    return this.routing.listRules(scopedTenantId);
  }

  @Post('rules')
  async createRule(
    @Body() dto: CreateRoutingRuleDto,
    @Query('tenantId') tenantId: string | undefined,
    @Req() req: FastifyRequest
  ) {
    const ctx = resolveRequestContext(req);
    const scopedTenantId = this.resolveTenantId(ctx, tenantId);
    const payload = {
      name: dto.name,
      priority: dto.priority,
      mode: dto.mode,
      enabled: dto.enabled,
      conditions: parseMaybeJson(dto.conditions),
      targets: parseMaybeJson(dto.targets),
      fallback: parseMaybeJson(dto.fallback),
      slaFirstTouchMinutes: dto.slaFirstTouchMinutes,
      slaKeptAppointmentMinutes: dto.slaKeptAppointmentMinutes
    };
    return this.routing.createRule(scopedTenantId, ctx.userId, payload);
  }

  @Patch('rules/:id')
  async updateRule(
    @Param('id') id: string,
    @Body() dto: UpdateRoutingRuleDto,
    @Query('tenantId') tenantId: string | undefined,
    @Req() req: FastifyRequest
  ) {
    const ctx = resolveRequestContext(req);
    const scopedTenantId = this.resolveTenantId(ctx, tenantId);
    const payload = {
      name: dto.name,
      priority: dto.priority,
      mode: dto.mode,
      enabled: dto.enabled,
      conditions: dto.conditions ? parseMaybeJson(dto.conditions) : undefined,
      targets: dto.targets ? parseMaybeJson(dto.targets) : undefined,
      fallback: dto.fallback ? parseMaybeJson(dto.fallback) : undefined,
      slaFirstTouchMinutes: dto.slaFirstTouchMinutes,
      slaKeptAppointmentMinutes: dto.slaKeptAppointmentMinutes
    };
    return this.routing.updateRule(id, scopedTenantId, payload);
  }

  @Delete('rules/:id')
  async deleteRule(@Param('id') id: string, @Query('tenantId') tenantId: string | undefined, @Req() req: FastifyRequest) {
    const ctx = resolveRequestContext(req);
    const scopedTenantId = this.resolveTenantId(ctx, tenantId);
    return this.routing.deleteRule(id, scopedTenantId);
  }

  @Get('capacity')
  async capacity(@Query('tenantId') tenantId: string | undefined, @Req() req: FastifyRequest) {
    const ctx = resolveRequestContext(req);
    const scopedTenantId = this.resolveTenantId(ctx, tenantId);
    return this.routing.getCapacityView(scopedTenantId);
  }

  @Get('events')
  async events(
    @Query('limit') limit: string,
    @Query('cursor') cursor: string | undefined,
    @Query('tenantId') tenantId: string | undefined,
    @Req() req: FastifyRequest
  ) {
    const ctx = resolveRequestContext(req);
    const scopedTenantId = this.resolveTenantId(ctx, tenantId);
    const parsedLimit = limit ? Number.parseInt(limit, 10) : undefined;
    return this.routing.listRouteEvents(scopedTenantId, {
      limit: Number.isNaN(parsedLimit ?? NaN) ? undefined : parsedLimit,
      cursor
    });
  }

  @Get('sla')
  async slaDashboard(@Query('tenantId') tenantId: string | undefined, @Req() req: FastifyRequest) {
    const ctx = resolveRequestContext(req);
    const scopedTenantId = this.resolveTenantId(ctx, tenantId);
    return this.routing.getSlaDashboard(scopedTenantId);
  }

  @Post('sla/process')
  async processSla(@Query('tenantId') tenantId: string | undefined, @Req() req: FastifyRequest) {
    const ctx = resolveRequestContext(req);
    return this.routing.processSlaTimers(tenantId ?? ctx.tenantId);
  }

  @Get('metrics')
  async metrics(@Query('tenantId') tenantId: string | undefined, @Req() req: FastifyRequest) {
    const ctx = resolveRequestContext(req);
    const scopedTenantId = this.resolveTenantId(ctx, tenantId);
    return this.routing.getMetrics(scopedTenantId);
  }

  private resolveTenantId(ctx: ReturnType<typeof resolveRequestContext>, tenantId?: string) {
    const resolved = tenantId ?? ctx.tenantId;
    if (!resolved) {
      throw new BadRequestException('tenantId is required');
    }
    return resolved;
  }
}
