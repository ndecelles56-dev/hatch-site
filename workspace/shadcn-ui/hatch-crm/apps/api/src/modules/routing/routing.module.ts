import { Module } from '@nestjs/common';

import { OutboxModule } from '../outbox/outbox.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RoutingController } from './routing.controller';
import { RoutingService } from './routing.service';

@Module({
  imports: [PrismaModule, OutboxModule],
  controllers: [RoutingController],
  providers: [RoutingService],
  exports: [RoutingService]
})
export class RoutingModule {}
