import { ArrayMaxSize, IsArray, IsOptional, IsString, MaxLength, Matches } from 'class-validator';

export class PostMessageDto {
  @IsString()
  @Matches(/^[a-zA-Z0-9-_]+$/)
  tenantId!: string;

  @IsString()
  @MaxLength(4000)
  body!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  attachmentTokens?: string[];

  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9-_]+$/)
  replyToMessageId?: string;
}
