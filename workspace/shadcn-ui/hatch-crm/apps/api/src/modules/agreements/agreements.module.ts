import { Module } from '@nestjs/common';

import { OutboxModule } from '../outbox/outbox.module';
import { AgreementsController } from './agreements.controller';
import { AgreementsService } from './agreements.service';

@Module({
  imports: [OutboxModule],
  controllers: [AgreementsController],
  providers: [AgreementsService]
})
export class AgreementsModule {}
