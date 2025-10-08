import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

import { AgreementType } from '@hatch/db';

export class CreateAgreementDto {
  @IsUUID()
  tenantId!: string;

  @IsUUID()
  personId!: string;

  @IsEnum(AgreementType)
  type!: AgreementType;

  @IsOptional()
  @IsString()
  documentUri?: string;

  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  versionNote?: string;
}
