import { IsBoolean, IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class PublishingPreflightDto {
  @IsUUID()
  tenantId!: string;

  @IsUUID()
  mlsProfileId!: string;

  @IsString()
  contentType!: 'flyer' | 'email' | 'page';

  @IsString()
  fieldsJson!: string;

  @IsOptional()
  @IsString()
  displayedDisclaimer?: string;

  @IsOptional()
  @IsBoolean()
  showsCompensation?: boolean;

  @IsOptional()
  @IsString()
  compensationValue?: string;

  @IsOptional()
  @IsDateString()
  marketingStart?: string;

  @IsOptional()
  @IsUUID()
  listingId?: string;
}
