import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

import { CommissionPlanType } from '@hatch/db';

class PostCapFeeDto {
  @IsString()
  type!: 'FLAT' | 'PERCENTAGE';

  @Type(() => Number)
  amount!: number;
}

export class CreateCommissionPlanDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(CommissionPlanType)
  type!: CommissionPlanType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  definition!: Record<string, unknown>;

  @IsOptional()
  @ValidateNested()
  @Type(() => PostCapFeeDto)
  postCapFee?: PostCapFeeDto;

  @IsOptional()
  @IsObject()
  bonusRules?: unknown;

  @IsOptional()
  @IsBoolean()
  archived?: boolean;
}
