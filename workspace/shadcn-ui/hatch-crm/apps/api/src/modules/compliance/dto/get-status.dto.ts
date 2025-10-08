import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class GetComplianceStatusDto {
  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsOptional()
  @IsString()
  start?: string;

  @IsOptional()
  @IsString()
  end?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return String(value)
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  })
  @IsArray()
  agentIds?: string[];

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return String(value)
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  })
  @IsArray()
  teamIds?: string[];

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return String(value)
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  })
  @IsArray()
  mlsIds?: string[];
}
