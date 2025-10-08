import { ArrayNotEmpty, IsArray, IsEnum, IsOptional, IsString, Matches } from 'class-validator';

import { ConversationType } from '@hatch/db';

export class CreateConversationDto {
  @IsString()
  @Matches(/^[a-zA-Z0-9-_]+$/)
  tenantId!: string;

  @IsEnum(ConversationType)
  type!: ConversationType;

  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9-_]+$/)
  personId?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @Matches(/^[a-zA-Z0-9-_]+$/, { each: true })
  participantUserIds?: string[];

  @IsOptional()
  @IsString()
  topic?: string;
}
