import { Injectable } from '@nestjs/common';
import { ConsentStatus } from '@hatch/db';

import { OutboxService } from '../outbox/outbox.service';
import { PrismaService } from '../prisma/prisma.service';
import { AddConsentDto } from './dto/add-consent.dto';
import { RevokeConsentDto } from './dto/revoke-consent.dto';

@Injectable()
export class ConsentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService
  ) {}

  async addConsent(dto: AddConsentDto) {
    const consent = await this.prisma.consent.create({
      data: {
        tenantId: dto.tenantId,
        personId: dto.personId,
        channel: dto.channel,
        scope: dto.scope,
        status: ConsentStatus.GRANTED,
        verbatimText: dto.verbatimText,
        source: dto.source,
        ipAddress: dto.ip,
        userAgent: dto.userAgent,
        evidenceUri: dto.evidenceUri,
        capturedAt: dto.capturedAt ?? new Date(),
        actorUserId: dto.actorUserId
      }
    });

    await this.prisma.communicationBlock.deleteMany({
      where: {
        tenantId: dto.tenantId,
        personId: dto.personId,
        channel: dto.channel
      }
    });

    await this.prisma.activity.create({
      data: {
        tenantId: dto.tenantId,
        personId: dto.personId,
        userId: dto.actorUserId,
        type: 'CONSENT_CAPTURED',
        payload: {
          channel: dto.channel,
          scope: dto.scope,
          source: dto.source
        }
      }
    });

    await this.outbox.enqueue({
      tenantId: dto.tenantId,
      eventType: 'consent.captured',
      occurredAt: new Date().toISOString(),
      resource: {
        id: consent.id,
        type: 'consent'
      },
      data: {
        personId: dto.personId,
        channel: dto.channel,
        scope: dto.scope
      }
    });

    return consent;
  }

  async revokeConsent(dto: RevokeConsentDto) {
    await this.prisma.$transaction(async (trx) => {
      await trx.consent.updateMany({
        where: {
          tenantId: dto.tenantId,
          personId: dto.personId,
          channel: dto.channel,
          status: ConsentStatus.GRANTED
        },
        data: {
          status: ConsentStatus.REVOKED,
          revokedAt: new Date()
        }
      });

      await trx.communicationBlock.create({
        data: {
          tenantId: dto.tenantId,
          personId: dto.personId,
          channel: dto.channel,
          reason: dto.reason ?? 'User requested stop'
        }
      });

      await trx.activity.create({
        data: {
          tenantId: dto.tenantId,
          personId: dto.personId,
          userId: dto.actorUserId,
          type: 'CONSENT_REVOKED',
          payload: {
            channel: dto.channel,
            reason: dto.reason ?? 'revoked'
          }
        }
      });
    });

    await this.outbox.enqueue({
      tenantId: dto.tenantId,
      eventType: 'consent.revoked',
      occurredAt: new Date().toISOString(),
      resource: {
        id: dto.personId,
        type: 'person'
      },
      data: {
        personId: dto.personId,
        channel: dto.channel
      }
    });

    return { status: 'revoked' };
  }
}
