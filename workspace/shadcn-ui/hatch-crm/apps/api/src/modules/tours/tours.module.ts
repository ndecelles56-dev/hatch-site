import { Module } from '@nestjs/common';

import { OutboxModule } from '../outbox/outbox.module';
import { RoutingModule } from '../routing/routing.module';
import { ToursController } from './tours.controller';
import { ToursService } from './tours.service';

@Module({
  imports: [OutboxModule, RoutingModule],
  controllers: [ToursController],
  providers: [ToursService]
})
export class ToursModule {}
