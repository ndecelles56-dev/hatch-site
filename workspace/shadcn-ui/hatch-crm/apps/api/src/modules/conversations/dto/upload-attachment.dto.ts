import { IsInt, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';

export class UploadAttachmentDto {
  @IsString()
  @Matches(/^[a-zA-Z0-9-_]+$/)
  tenantId!: string;

  @IsString()
  @MaxLength(255)
  filename!: string;

  @IsString()
  @MaxLength(255)
  mimeType!: string;

  @IsInt()
  @Min(1)
  size!: number;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  checksum?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9/_\\.-]*$/)
  storageKey?: string;
}
