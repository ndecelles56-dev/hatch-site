import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBooleanString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min
} from 'class-validator';

import { ConsentStatus, PersonStage } from '@hatch/db';

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

function toArray(value: unknown): string[] | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (Array.isArray(value)) {
    return value as string[];
  }
  if (typeof value === 'string') {
    return value.split(',').map((token) => token.trim()).filter(Boolean);
  }
  return undefined;
}

export class ListContactsQueryDto {
  @IsString()
  tenantId!: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => toArray(value))
  @IsEnum(PersonStage, { each: true })
  stage?: PersonStage[];

  @IsOptional()
  @Transform(({ value }) => toArray(value))
  @IsString({ each: true })
  ownerId?: string[];

  @IsOptional()
  @Transform(({ value }) => toArray(value))
  @IsString({ each: true })
  teamId?: string[];

  @IsOptional()
  @Transform(({ value }) => toArray(value))
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @Transform(({ value }) => toArray(value))
  @IsString({ each: true })
  source?: string[];

  @IsOptional()
  @IsString()
  createdFrom?: string;

  @IsOptional()
  @IsString()
  createdTo?: string;

  @IsOptional()
  @IsString()
  lastActivityFrom?: string;

  @IsOptional()
  @IsString()
  lastActivityTo?: string;

  @IsOptional()
  @Transform(({ value }) => toArray(value))
  @IsEnum(ConsentStatus, { each: true })
  emailConsent?: ConsentStatus[];

  @IsOptional()
  @Transform(({ value }) => toArray(value))
  @IsEnum(ConsentStatus, { each: true })
  smsConsent?: ConsentStatus[];

  @IsOptional()
  @IsString()
  buyerRepStatus?: string;

  @IsOptional()
  @IsBooleanString()
  hasOpenDeal?: string;

  @IsOptional()
  @IsBooleanString()
  doNotContact?: string;

  @IsOptional()
  @IsBooleanString()
  includeDeleted?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortDirection: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? 1 : parseInt(value, 10)))
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? DEFAULT_PAGE_SIZE : parseInt(value, 10)))
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  pageSize: number = DEFAULT_PAGE_SIZE;

  @IsOptional()
  @IsString()
  savedViewId?: string;
}
