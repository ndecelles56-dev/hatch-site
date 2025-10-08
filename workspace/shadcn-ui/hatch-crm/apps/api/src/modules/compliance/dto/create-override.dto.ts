import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateOverrideDto {
  @IsUUID()
  tenantId!: string;

  @IsOptional()
  @IsUUID()
  actorUserId?: string;

  @IsString()
  context!: string;

  @IsOptional()
  @IsString()
  reasonText?: string;
}
