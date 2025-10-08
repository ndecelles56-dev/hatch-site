import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'

import { CalendarService } from './calendar.service'
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto'
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto'

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendar: CalendarService) {}

  @Get()
  async list(
    @Query('tenantId') tenantId: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('assignedAgentId') assignedAgentId?: string
  ) {
    if (!tenantId) {
      throw new BadRequestException('tenantId is required')
    }

    const startDate = start ? new Date(start) : undefined
    const endDate = end ? new Date(end) : undefined

    return this.calendar.list(tenantId, startDate, endDate, assignedAgentId)
  }

  @Post()
  create(@Body() dto: CreateCalendarEventDto) {
    if (!dto.tenantId) {
      throw new BadRequestException('tenantId is required')
    }
    return this.calendar.create(dto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCalendarEventDto) {
    return this.calendar.update(id, dto)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.calendar.remove(id)
    return { id }
  }
}
