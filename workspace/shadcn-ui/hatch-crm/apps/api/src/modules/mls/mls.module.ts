import { Module } from '@nestjs/common';

import { OutboxModule } from '../outbox/outbox.module';
import { MlsController } from './mls.controller';
import { MlsService } from './mls.service';

@Module({
  imports: [OutboxModule],
  controllers: [MlsController],
  providers: [MlsService]
})
export class MlsModule {}
