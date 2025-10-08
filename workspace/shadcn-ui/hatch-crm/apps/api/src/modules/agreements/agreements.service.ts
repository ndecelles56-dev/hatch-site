import { Injectable, NotFoundException } from '@nestjs/common';
import { Agreement, AgreementStatus, Prisma } from '@hatch/db';

import { OutboxService } from '../outbox/outbox.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgreementDto } from './dto/create-agreement.dto';
import { SignAgreementDto } from './dto/sign-agreement.dto';

@Injectable()
export class AgreementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService
  ) {}

  async create(dto: CreateAgreementDto): Promise<Agreement> {
    const agreement = await this.prisma.agreement.create({
      data: {
        tenantId: dto.tenantId,
        personId: dto.personId,
        type: dto.type,
        documentUri: dto.documentUri,
        effectiveDate: dto.effectiveDate ? new Date(dto.effectiveDate) : undefined,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
        version: dto.versionNote ? 2 : 1,
        status: AgreementStatus.DRAFT
      }
    });

    return agreement;
  }

  async sign(agreementId: string, dto: SignAgreementDto): Promise<Agreement> {
    const agreement = await this.prisma.agreement.findFirst({
      where: { id: agreementId, tenantId: dto.tenantId }
    });

    if (!agreement) {
      throw new NotFoundException('Agreement not found');
    }

    const updated = await this.prisma.agreement.update({
      where: { id: agreementId },
      data: {
        status: AgreementStatus.SIGNED,
        signedAt: new Date(),
        overrideReason: dto.overrideReason,
        overrideUserId: dto.overrideReason ? dto.actorUserId : undefined,
        signatureLog: dto.signatureLog ?? ({} as Prisma.JsonObject)
      }
    });

    await this.prisma.activity.create({
      data: {
        tenantId: dto.tenantId,
        personId: updated.personId,
        agreementId: updated.id,
        userId: dto.actorUserId,
        type: 'AGREEMENT_SIGNED',
        payload: {
          agreementId: updated.id,
          overrideReason: dto.overrideReason
        }
      }
    });

    await this.outbox.enqueue({
      tenantId: dto.tenantId,
      eventType: 'agreement.signed',
      occurredAt: new Date().toISOString(),
      resource: {
        id: updated.id,
        type: 'agreement'
      },
      data: {
        agreementId: updated.id,
        personId: updated.personId,
        overrideReason: dto.overrideReason
      }
    });

    return updated;
  }
}
