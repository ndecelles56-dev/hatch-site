import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

import { PlanAssigneeType } from '@hatch/db';

export class AssignCommissionPlanDto {
  @IsEnum(PlanAssigneeType)
  assigneeType!: PlanAssigneeType;

  @IsString()
  assigneeId!: string;

  @IsString()
  planId!: string;

  @Type(() => Date)
  @IsDate()
  effectiveFrom!: Date;

  @Type(() => Date)
  @IsOptional()
  @IsDate()
  effectiveTo?: Date;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priority?: number;
}
