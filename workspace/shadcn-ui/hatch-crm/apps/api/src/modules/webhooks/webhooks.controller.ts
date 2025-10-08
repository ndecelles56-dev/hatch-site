import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { OutboxService } from '../outbox/outbox.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService
  ) {}

  @Get('subscriptions')
  async listSubscriptions() {
    return this.prisma.webhookSubscription.findMany();
  }

  @Post('outbox/flush')
  async flushOutbox(@Body('limit') limit?: number) {
    await this.outbox.processPending(limit ?? 5);
    return { status: 'ok' };
  }

  @Post('simulate/:eventType')
  async simulateDeliver(
    @Param('eventType') eventType: string,
    @Body() payload: Record<string, unknown>
  ) {
    await this.outbox.enqueue({
      eventType: eventType as any,
      occurredAt: new Date().toISOString(),
      tenantId: String(payload?.tenantId ?? ''),
      resource: {
        id: String(payload?.resourceId ?? 'resource'),
        type: String(payload?.resourceType ?? 'generic')
      },
      data: payload
    });
    await this.outbox.processPending(1);
    return { status: 'queued' };
  }
}
