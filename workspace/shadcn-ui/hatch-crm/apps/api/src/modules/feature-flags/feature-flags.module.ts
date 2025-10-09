import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { FeatureFlagsController } from './feature-flags.controller';
import { FeatureFlagsService } from './feature-flags.service';
import { FeatureFlagGuard } from '../common/feature-flag.guard';

@Module({
  imports: [PrismaModule],
  controllers: [FeatureFlagsController],
  providers: [FeatureFlagsService, FeatureFlagGuard],
  exports: [FeatureFlagsService, FeatureFlagGuard]
})
export class FeatureFlagsModule {}
