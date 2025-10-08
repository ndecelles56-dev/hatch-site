import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class CapProgressQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  teamId?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  periodStart?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  periodEnd?: Date;
}
