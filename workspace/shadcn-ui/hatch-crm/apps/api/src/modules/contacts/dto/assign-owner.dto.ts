import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class AssignOwnerDto {
  @IsString()
  tenantId!: string;

  @IsString()
  ownerId!: string;

  @IsOptional()
  @IsBoolean()
  notify?: boolean;

  @IsOptional()
  @IsString()
  reason?: string;
}
