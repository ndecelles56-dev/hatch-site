import { Injectable } from '@nestjs/common';
import { ClearCooperationTimer, Listing, MLSProfile, Prisma } from '@hatch/db';
import {
  ClearCooperationRisk,
  PreflightResult,
  type MLSProfileShape,
  evaluateClearCooperation,
  runPublishingPreflight
} from '@hatch/shared';

import { OutboxService } from '../outbox/outbox.service';
import { PrismaService } from '../prisma/prisma.service';
import { ClearCooperationEventDto } from './dto/clear-coop.dto';
import { PublishingPreflightDto } from './dto/preflight.dto';

@Injectable()
export class MlsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService
  ) {}

  async preflight(dto: PublishingPreflightDto): Promise<PreflightResult> {
    const profile = await this.prisma.mLSProfile.findFirstOrThrow({
      where: { id: dto.mlsProfileId, tenantId: dto.tenantId }
    });

    const fields = JSON.parse(dto.fieldsJson ?? '{}');

    const profileShape: MLSProfileShape = {
      name: profile.name,
      disclaimerText: profile.disclaimerText,
      compensationDisplayRule: profile.compensationDisplayRule as MLSProfileShape['compensationDisplayRule'],
      clearCooperationRequired: profile.clearCooperationRequired,
      slaHours: profile.slaHours,
      lastReviewedAt: profile.lastReviewedAt ?? undefined
    };

    const result = runPublishingPreflight(
      {
        contentType: dto.contentType,
        fields,
        displayedDisclaimer: dto.displayedDisclaimer,
        showsCompensation: dto.showsCompensation,
        compensationValue: dto.compensationValue,
        marketingStart: dto.marketingStart ? new Date(dto.marketingStart) : undefined,
        listingId: dto.listingId
      },
      profileShape
    );

    await this.prisma.activity.create({
      data: {
        tenantId: dto.tenantId,
        type: result.pass ? 'LEAD_CREATED' : 'COMPLIANCE_VIOLATION',
        payload: {
          module: 'mls-preflight',
          result
        } as unknown as Prisma.JsonObject
      }
    });

    return result;
  }

  async recordClearCooperation(
    dto: ClearCooperationEventDto
  ): Promise<RecordClearCooperationResponse> {
    const profile = await this.prisma.mLSProfile.findFirst({
      where: { tenantId: dto.tenantId },
      orderBy: { updatedAt: 'desc' }
    });

    const startedAt = dto.occurredAt ? new Date(dto.occurredAt) : new Date();

    const timer = await this.prisma.clearCooperationTimer.upsert({
      where: {
        id: dto.listingId ? dto.listingId : `${dto.tenantId}-default`
      },
      create: {
        id: dto.listingId ? dto.listingId : `${dto.tenantId}-default`,
        tenantId: dto.tenantId,
        listingId: dto.listingId,
        startedAt,
        deadlineAt: profile ? new Date(startedAt.getTime() + profile.slaHours * 3600 * 1000) : null,
        status: 'GREEN'
      },
      update: {
        startedAt,
        lastEventAt: new Date(),
        deadlineAt: profile ? new Date(startedAt.getTime() + profile.slaHours * 3600 * 1000) : null
      }
    });

    const risk: ClearCooperationRisk = profile
      ? evaluateClearCooperation(timer.startedAt, profile.slaHours)
      : { status: 'GREEN', hoursElapsed: 0, hoursRemaining: 0 };

    await this.prisma.activity.create({
      data: {
        tenantId: dto.tenantId,
        listingId: dto.listingId ?? undefined,
        type: 'COMPLIANCE_VIOLATION',
        payload: {
          module: 'clear-cooperation',
          status: risk.status,
          eventType: dto.eventType
        }
      }
    });

    if (risk.status !== 'GREEN') {
      await this.outbox.enqueue({
        tenantId: dto.tenantId,
        eventType: 'compliance.violation_detected',
        occurredAt: new Date().toISOString(),
        resource: {
          id: timer.id,
          type: 'clear_cooperation'
        },
        data: {
          status: risk.status,
          listingId: dto.listingId,
          hoursRemaining: risk.hoursRemaining
        }
      });
    }

    return { timer, risk };
  }

  async getDashboard(tenantId: string): Promise<ClearCooperationDashboardEntry[]> {
    const timers = await this.prisma.clearCooperationTimer.findMany({
      where: { tenantId },
      include: { listing: true }
    });

    return timers.map((timer) => ({
      timerId: timer.id,
      listing: timer.listing,
      status: timer.status,
      startedAt: timer.startedAt,
      deadlineAt: timer.deadlineAt
    }));
  }

  async listProfiles(tenantId: string): Promise<MLSProfile[]> {
    return this.prisma.mLSProfile.findMany({ where: { tenantId } });
  }
}

export type RecordClearCooperationResponse = {
  timer: ClearCooperationTimer;
  risk: ClearCooperationRisk;
};

export type ClearCooperationDashboardEntry = {
  timerId: string;
  listing: Listing | null;
  status: string;
  startedAt: Date;
  deadlineAt: Date | null;
};
