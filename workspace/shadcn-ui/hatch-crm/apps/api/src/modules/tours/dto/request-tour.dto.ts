import { IsBoolean, IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class RequestTourDto {
  @IsUUID()
  tenantId!: string;

  @IsUUID()
  personId!: string;

  @IsUUID()
  listingId!: string;

  @IsDateString()
  startAt!: string;

  @IsDateString()
  endAt!: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsBoolean()
  overrideBuyerRep?: boolean;

  @IsOptional()
  @IsUUID()
  overrideUserId?: string;

  @IsOptional()
  @IsString()
  overrideReason?: string;
}
