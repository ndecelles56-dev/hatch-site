import { Prisma } from '@hatch/db';
import { IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class SignAgreementDto {
  @IsUUID()
  tenantId!: string;

  @IsUUID()
  actorUserId!: string;

  @IsOptional()
  @IsString()
  overrideReason?: string;

  @IsOptional()
  @IsObject()
  signatureLog?: Prisma.JsonObject;
}
