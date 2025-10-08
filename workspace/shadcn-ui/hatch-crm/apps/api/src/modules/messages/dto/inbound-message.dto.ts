import { IsEnum, IsOptional, IsString } from 'class-validator';

import { MessageChannel } from '@hatch/db';

export class InboundMessageDto {
  @IsEnum(MessageChannel)
  channel!: MessageChannel;

  @IsString()
  providerId!: string;

  @IsString()
  from!: string;

  @IsString()
  to!: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsString()
  body!: string;

  @IsOptional()
  @IsString()
  tenantSlug?: string;
}
