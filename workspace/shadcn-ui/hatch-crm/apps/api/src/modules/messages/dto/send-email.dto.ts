import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

import { ConsentScope } from '@hatch/db';

export class SendEmailDto {
  @IsUUID()
  tenantId!: string;

  @IsUUID()
  personId!: string;

  @IsUUID()
  userId!: string;

  @IsEmail()
  from!: string;

  @IsEmail()
  to!: string;

  @IsString()
  subject!: string;

  @IsString()
  body!: string;

  @IsEnum(ConsentScope)
  scope!: ConsentScope;

  @IsOptional()
  @IsBoolean()
  includeUnsubscribe?: boolean;
}
