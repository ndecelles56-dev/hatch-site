import { ArrayNotEmpty, IsArray, IsString, Matches } from 'class-validator';

export class AddParticipantsDto {
  @Matches(/^[a-zA-Z0-9-_]+$/)
  tenantId!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @Matches(/^[a-zA-Z0-9-_]+$/, { each: true })
  userIds!: string[];
}
