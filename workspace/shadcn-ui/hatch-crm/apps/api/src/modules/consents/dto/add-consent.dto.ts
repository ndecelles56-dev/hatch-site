import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  MaxLength
} from 'class-validator';

import { ConsentChannel, ConsentScope } from '@hatch/db';

export class AddConsentDto {
  @IsUUID()
  tenantId!: string;

  @IsUUID()
  personId!: string;

  @IsEnum(ConsentChannel)
  channel!: ConsentChannel;

  @IsEnum(ConsentScope)
  scope!: ConsentScope;

  @IsString()
  @MaxLength(2048)
  verbatimText!: string;

  @IsString()
  source!: string;

  @IsOptional()
  @IsString()
  ip?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsUrl()
  evidenceUri?: string;

  @IsOptional()
  capturedAt?: Date;

  @IsOptional()
  @IsUUID()
  actorUserId?: string;
}
