import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConsentScope, Message, MessageChannel } from '@hatch/db';

import { ComplianceService } from '../compliance/compliance.service';
import { OutboxService } from '../outbox/outbox.service';
import { PrismaService } from '../prisma/prisma.service';
import { RoutingService } from '../routing/routing.service';
import { InboundMessageDto } from './dto/inbound-message.dto';
import { SendEmailDto } from './dto/send-email.dto';
import { SendSmsDto } from './dto/send-sms.dto';

@Injectable()
export class MessagesService {
  private readonly emailSenderDomain: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly compliance: ComplianceService,
    private readonly outbox: OutboxService,
    private readonly routing: RoutingService,
    private readonly config: ConfigService
  ) {
    this.emailSenderDomain = this.config.get<string>('EMAIL_SENDER_DOMAIN') ?? 'example.hatchcrm.test';
  }

  async sendSms(dto: SendSmsDto): Promise<Message> {
    await this.compliance.enforceConsent({
      tenantId: dto.tenantId,
      personId: dto.personId,
      channel: 'SMS',
      scope: dto.scope,
      actorUserId: dto.userId,
      overrideQuietHours: dto.overrideQuietHours,
      isTransactional: dto.transactional
    });

    const message = await this.prisma.message.create({
      data: {
        tenantId: dto.tenantId,
        personId: dto.personId,
        userId: dto.userId,
        channel: MessageChannel.SMS,
        direction: 'OUTBOUND',
        body: dto.body,
        toAddress: dto.to,
        fromAddress: dto.from,
        status: 'SENT'
      }
    });

    await this.prisma.activity.create({
      data: {
        tenantId: dto.tenantId,
        personId: dto.personId,
        userId: dto.userId,
        type: 'MESSAGE_SENT',
        payload: {
          messageId: message.id,
          channel: 'SMS'
        }
      }
    });

    await this.updateDeliverability(dto.tenantId, dto.userId, MessageChannel.SMS, {
      accepted: 1,
      delivered: 1
    });

    await this.outbox.enqueue({
      tenantId: dto.tenantId,
      eventType: 'message.sent',
      occurredAt: new Date().toISOString(),
      resource: {
        id: message.id,
        type: 'message'
      },
      data: {
        messageId: message.id,
        personId: dto.personId,
        channel: 'SMS'
      }
    });

    await this.routing.recordFirstTouch({
      tenantId: dto.tenantId,
      leadId: dto.personId,
      actorUserId: dto.userId,
      occurredAt: new Date()
    });

    return message;
  }

  async sendEmail(dto: SendEmailDto): Promise<Message> {
    const domain = dto.from.split('@')[1];
    if (!domain || domain !== this.emailSenderDomain) {
      throw new BadRequestException('Sending domain is not authenticated');
    }

    if (dto.scope === ConsentScope.PROMOTIONAL && dto.includeUnsubscribe !== true) {
      throw new BadRequestException('Promotional email must include one-click unsubscribe');
    }

    await this.compliance.enforceConsent({
      tenantId: dto.tenantId,
      personId: dto.personId,
      channel: 'EMAIL',
      scope: dto.scope,
      actorUserId: dto.userId,
      isTransactional: dto.scope === ConsentScope.TRANSACTIONAL
    });

    const message = await this.prisma.message.create({
      data: {
        tenantId: dto.tenantId,
        personId: dto.personId,
        userId: dto.userId,
        channel: MessageChannel.EMAIL,
        direction: 'OUTBOUND',
        subject: dto.subject,
        body: dto.body,
        toAddress: dto.to,
        fromAddress: dto.from,
        status: 'SENT'
      }
    });

    await this.prisma.activity.create({
      data: {
        tenantId: dto.tenantId,
        personId: dto.personId,
        userId: dto.userId,
        type: 'MESSAGE_SENT',
        payload: {
          messageId: message.id,
          channel: 'EMAIL'
        }
      }
    });

    await this.updateDeliverability(dto.tenantId, dto.userId, MessageChannel.EMAIL, {
      accepted: 1,
      delivered: 1
    });

    await this.outbox.enqueue({
      tenantId: dto.tenantId,
      eventType: 'message.sent',
      occurredAt: new Date().toISOString(),
      resource: {
        id: message.id,
        type: 'message'
      },
      data: {
        messageId: message.id,
        personId: dto.personId,
        channel: 'EMAIL'
      }
    });

    await this.routing.recordFirstTouch({
      tenantId: dto.tenantId,
      leadId: dto.personId,
      actorUserId: dto.userId,
      occurredAt: new Date()
    });

    return message;
  }

  async ingestInbound(dto: InboundMessageDto): Promise<Message> {
    const tenant = dto.tenantSlug
      ? await this.prisma.tenant.findUnique({ where: { slug: dto.tenantSlug } })
      : await this.prisma.tenant.findFirst();

    if (!tenant) {
      throw new BadRequestException('Unknown tenant context');
    }

    const person = await this.prisma.person.findFirst({
      where: dto.channel === MessageChannel.SMS
        ? { tenantId: tenant.id, primaryPhone: dto.from }
        : {
            tenantId: tenant.id,
            OR: [{ primaryEmail: dto.from }, { primaryEmail: dto.to }]
          }
    });

    const message = await this.prisma.message.create({
      data: {
        tenantId: tenant.id,
        personId: person?.id,
        channel: dto.channel,
        direction: 'INBOUND',
        subject: dto.subject,
        body: dto.body,
        toAddress: dto.to,
        fromAddress: dto.from,
        status: 'DELIVERED',
        providerMessageId: dto.providerId
      }
    });

    if (person) {
      await this.prisma.activity.create({
        data: {
          tenantId: tenant.id,
          personId: person.id,
          type: 'MESSAGE_SENT',
          payload: {
            direction: 'INBOUND',
            channel: dto.channel,
            messageId: message.id
          }
        }
      });
    }

    await this.outbox.enqueue({
      tenantId: tenant.id,
      eventType: 'message.sent',
      occurredAt: new Date().toISOString(),
      resource: {
        id: message.id,
        type: 'message'
      },
      data: {
        messageId: message.id,
        direction: 'INBOUND',
        channel: dto.channel
      }
    });

    return message;
  }

  private async updateDeliverability(
    tenantId: string,
    agentId: string,
    channel: MessageChannel,
    delta: { accepted?: number; delivered?: number; bounced?: number; complaints?: number; optOuts?: number }
  ) {
    const periodStart = new Date();
    periodStart.setHours(0, 0, 0, 0);

    await this.prisma.deliverabilityMetric.upsert({
      where: {
        tenantId_agentId_channel_recordedAt: {
          tenantId,
          agentId,
          channel,
          recordedAt: periodStart
        }
      },
      update: {
        accepted: { increment: delta.accepted ?? 0 },
        delivered: { increment: delta.delivered ?? 0 },
        bounced: { increment: delta.bounced ?? 0 },
        complaints: { increment: delta.complaints ?? 0 },
        optOuts: { increment: delta.optOuts ?? 0 }
      },
      create: {
        tenantId,
        agentId,
        channel,
        recordedAt: periodStart,
        accepted: delta.accepted ?? 0,
        delivered: delta.delivered ?? 0,
        bounced: delta.bounced ?? 0,
        complaints: delta.complaints ?? 0,
        optOuts: delta.optOuts ?? 0
      }
    });
  }
}
