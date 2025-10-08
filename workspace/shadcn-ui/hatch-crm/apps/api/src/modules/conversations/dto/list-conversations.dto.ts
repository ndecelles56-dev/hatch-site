import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsPositive, IsString, Max, Min, Matches } from 'class-validator';

import { ConversationType } from '@hatch/db';

export class ListConversationsQueryDto {
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9-_]+$/)
  tenantId?: string;

  @IsOptional()
  @IsEnum(ConversationType)
  type?: ConversationType;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Max(100)
  pageSize?: number = 20;
}
