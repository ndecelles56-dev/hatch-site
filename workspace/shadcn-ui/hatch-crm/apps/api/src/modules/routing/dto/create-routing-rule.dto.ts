import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

import { RoutingMode } from '@hatch/db';

export class CreateRoutingRuleDto {
  @IsString()
  name!: string;

  @IsInt()
  priority!: number;

  @IsEnum(RoutingMode)
  mode!: RoutingMode;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  conditions!: unknown;

  targets!: unknown;

  @IsOptional()
  fallback?: unknown;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1440)
  slaFirstTouchMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(10080)
  slaKeptAppointmentMinutes?: number;
}
