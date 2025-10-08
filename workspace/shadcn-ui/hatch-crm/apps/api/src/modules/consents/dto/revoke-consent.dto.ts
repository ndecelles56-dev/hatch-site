import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

import { ConsentChannel } from '@hatch/db';

export class RevokeConsentDto {
  @IsUUID()
  tenantId!: string;

  @IsUUID()
  personId!: string;

  @IsEnum(ConsentChannel)
  channel!: ConsentChannel;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsUUID()
  actorUserId?: string;
}
