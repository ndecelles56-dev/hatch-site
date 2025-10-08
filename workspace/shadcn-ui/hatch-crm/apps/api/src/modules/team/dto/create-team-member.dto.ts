import { IsEmail, IsIn, IsInt, IsISO8601, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator'

const STATUS_VALUES = ['active', 'inactive', 'pending'] as const

export class CreateTeamMemberDto {
  @IsString()
  tenantId!: string

  @IsOptional()
  @IsUUID()
  orgId?: string

  @IsString()
  name!: string

  @IsEmail()
  email!: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsString()
  role!: string

  @IsOptional()
  @IsIn(STATUS_VALUES)
  status?: (typeof STATUS_VALUES)[number]

  @IsOptional()
  @IsInt()
  @Min(0)
  experienceYears?: number

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(5)
  rating?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  totalSales?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  dealsInProgress?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  openLeads?: number

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  responseTimeHours?: number

  @IsOptional()
  @IsString()
  notes?: string

  @IsOptional()
  @IsISO8601()
  joinedAt?: string

  @IsOptional()
  @IsISO8601()
  lastActiveAt?: string
}
