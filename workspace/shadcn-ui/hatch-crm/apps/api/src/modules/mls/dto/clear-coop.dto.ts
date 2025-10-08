import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class ClearCooperationEventDto {
  @IsUUID()
  tenantId!: string;

  @IsOptional()
  @IsUUID()
  listingId?: string;

  @IsString()
  eventType!: string;

  @IsOptional()
  @IsDateString()
  occurredAt?: string;
}
