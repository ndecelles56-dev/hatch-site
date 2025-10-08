import { IsEnum, IsISO8601, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import {
  CalendarEventPriority,
  CalendarEventStatus,
  CalendarEventType
} from '@hatch/db'

export class CreateCalendarEventDto {
  @IsString()
  @IsNotEmpty()
  tenantId!: string

  @IsString()
  @MaxLength(200)
  title!: string

  @IsOptional()
  @IsString()
  description?: string

  @IsISO8601()
  startAt!: string

  @IsISO8601()
  endAt!: string

  @IsOptional()
  @IsEnum(CalendarEventType)
  eventType?: CalendarEventType

  @IsOptional()
  @IsEnum(CalendarEventStatus)
  status?: CalendarEventStatus

  @IsOptional()
  @IsEnum(CalendarEventPriority)
  priority?: CalendarEventPriority

  @IsOptional()
  @IsString()
  location?: string

  @IsOptional()
  @IsString()
  notes?: string

  @IsOptional()
  @IsString()
  assignedAgentId?: string

  @IsOptional()
  @IsString()
  personId?: string

  @IsOptional()
  @IsString()
  listingId?: string
}
