import { PartialType } from '@nestjs/mapped-types';

import { CreateCommissionPlanDto } from './create-plan.dto';

export class UpdateCommissionPlanDto extends PartialType(CreateCommissionPlanDto) {}
