import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

import { ConsentScope } from '@hatch/db';

export class SendSmsDto {
  @IsUUID()
  tenantId!: string;

  @IsUUID()
  personId!: string;

  @IsUUID()
  userId!: string;

  @IsString()
  from!: string;

  @IsString()
  to!: string;

  @IsString()
  @MaxLength(1600)
  body!: string;

  @IsEnum(ConsentScope)
  scope!: ConsentScope;

  @IsOptional()
  @IsBoolean()
  overrideQuietHours?: boolean;

  @IsOptional()
  @IsBoolean()
  transactional?: boolean;
}
