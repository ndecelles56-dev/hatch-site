import { IsOptional, IsString, Matches } from 'class-validator';

export class MarkReadDto {
  @IsString()
  @Matches(/^[a-zA-Z0-9-_]+$/)
  tenantId!: string;

  @IsOptional()
  @Matches(/^[a-zA-Z0-9-_]+$/)
  upToMessageId?: string;
}
