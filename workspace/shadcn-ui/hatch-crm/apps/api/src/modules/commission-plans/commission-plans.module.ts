import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { CommissionPlansController } from './commission-plans.controller';
import { CommissionPlansService } from './commission-plans.service';
import { PlanAssignmentService } from './plan-assignment.service';
import { CapLedgerService } from './cap-ledger.service';

@Module({
  imports: [PrismaModule],
  controllers: [CommissionPlansController],
  providers: [CommissionPlansService, PlanAssignmentService, CapLedgerService],
  exports: [CommissionPlansService, PlanAssignmentService, CapLedgerService]
})
export class CommissionPlansModule {}
