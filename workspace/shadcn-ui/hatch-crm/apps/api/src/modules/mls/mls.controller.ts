import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import type { MLSProfile } from '@hatch/db';
import type { PreflightResult } from '@hatch/shared';

import { ClearCooperationEventDto } from './dto/clear-coop.dto';
import { PublishingPreflightDto } from './dto/preflight.dto';
import {
  ClearCooperationDashboardEntry,
  MlsService,
  RecordClearCooperationResponse
} from './mls.service';

@Controller('mls')
export class MlsController {
  constructor(private readonly mls: MlsService) {}

  @Post('preflight')
  async preflight(@Body() dto: PublishingPreflightDto): Promise<PreflightResult> {
    return this.mls.preflight(dto);
  }

  @Post('clear-cooperation')
  async record(@Body() dto: ClearCooperationEventDto): Promise<RecordClearCooperationResponse> {
    return this.mls.recordClearCooperation(dto);
  }

  @Get('profiles')
  async profiles(@Query('tenantId') tenantId: string): Promise<MLSProfile[]> {
    return this.mls.listProfiles(tenantId);
  }

  @Get('dashboard')
  async dashboard(@Query('tenantId') tenantId: string): Promise<ClearCooperationDashboardEntry[]> {
    return this.mls.getDashboard(tenantId);
  }
}
