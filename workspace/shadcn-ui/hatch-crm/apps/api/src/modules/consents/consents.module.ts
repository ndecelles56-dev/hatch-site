import { Module } from '@nestjs/common';

import { OutboxModule } from '../outbox/outbox.module';
import { ConsentsController } from './consents.controller';
import { ConsentsService } from './consents.service';

@Module({
  imports: [OutboxModule],
  controllers: [ConsentsController],
  providers: [ConsentsService]
})
export class ConsentsModule {}
