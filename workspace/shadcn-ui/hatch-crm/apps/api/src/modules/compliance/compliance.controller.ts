import { BadRequestException, Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { resolveRequestContext } from '../common/request-context';
import { ComplianceService } from './compliance.service';
import { CreateOverrideDto } from './dto/create-override.dto';
import { GetComplianceStatusDto } from './dto/get-status.dto';

@Controller('compliance')
export class ComplianceController {
  constructor(private readonly compliance: ComplianceService) {}

  private resolveTenantId(query: GetComplianceStatusDto, req: FastifyRequest) {
    const ctx = resolveRequestContext(req);
    const tenantId = query.tenantId ?? ctx.tenantId;
    if (!tenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return tenantId;
  }

  @Get('status')
  async status(@Query() query: GetComplianceStatusDto, @Req() req: FastifyRequest) {
    const tenantId = this.resolveTenantId(query, req);
    return this.compliance.getStatus(tenantId, query);
  }

  @Get('agreements')
  async agreements(@Query() query: GetComplianceStatusDto, @Req() req: FastifyRequest) {
    const tenantId = this.resolveTenantId(query, req);
    return this.compliance.getAgreements(tenantId, query);
  }

  @Get('consents')
  async consents(@Query() query: GetComplianceStatusDto, @Req() req: FastifyRequest) {
    const tenantId = this.resolveTenantId(query, req);
    return this.compliance.getConsents(tenantId, query);
  }

  @Get('listings')
  async listings(@Query() query: GetComplianceStatusDto, @Req() req: FastifyRequest) {
    const tenantId = this.resolveTenantId(query, req);
    return this.compliance.getListings(tenantId, query);
  }

  @Get('disclaimers')
  async disclaimers(@Query() query: GetComplianceStatusDto, @Req() req: FastifyRequest) {
    const tenantId = this.resolveTenantId(query, req);
    return this.compliance.getDisclaimers(tenantId, query);
  }

  @Get('overrides')
  async overrides(
    @Query() query: GetComplianceStatusDto,
    @Req() req: FastifyRequest,
    @Query('context') context?: string
  ) {
    const tenantId = this.resolveTenantId(query, req);
    return this.compliance.getOverrides(tenantId, context);
  }

  @Post('overrides')
  async createOverride(@Body() body: CreateOverrideDto) {
    return this.compliance.createOverride(body);
  }

  @Post('export')
  async export(@Body() body: GetComplianceStatusDto, @Req() req: FastifyRequest, @Res() reply: FastifyReply) {
    const tenantId = this.resolveTenantId(body, req);
    const pdfBuffer = await this.compliance.exportStatus(tenantId, body);
    reply.header('Content-Type', 'application/pdf');
    reply.header('Content-Disposition', 'attachment; filename="compliance-status.pdf"');
    reply.send(pdfBuffer);
  }
}
