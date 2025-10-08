import { Module } from '@nestjs/common';

import { OutboxModule } from '../outbox/outbox.module';
import { WebhooksController } from './webhooks.controller';

@Module({
  imports: [OutboxModule],
  controllers: [WebhooksController]
})
export class WebhooksModule {}
