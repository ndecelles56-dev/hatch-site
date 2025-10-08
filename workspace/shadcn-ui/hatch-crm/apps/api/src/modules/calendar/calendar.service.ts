import { Injectable, NotFoundException } from '@nestjs/common'
import { CalendarEventPriority, CalendarEventStatus, CalendarEventType } from '@hatch/db'

import { PrismaService } from '../prisma/prisma.service'
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto'
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto'

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  list(tenantId: string, start?: Date, end?: Date, agentId?: string) {
    return this.prisma.calendarEvent.findMany({
      where: {
        tenantId,
        assignedAgentId: agentId,
        ...(start || end
          ? {
              startAt: start ? { gte: start } : undefined,
              endAt: end ? { lte: end } : undefined
            }
          : undefined)
      },
      orderBy: { startAt: 'asc' }
    })
  }

  async create(dto: CreateCalendarEventDto) {
    const event = await this.prisma.calendarEvent.create({
      data: {
        tenantId: dto.tenantId,
        title: dto.title,
        description: dto.description,
        startAt: new Date(dto.startAt),
        endAt: new Date(dto.endAt),
        eventType: dto.eventType ?? CalendarEventType.OTHER,
        status: dto.status ?? CalendarEventStatus.PENDING,
        priority: dto.priority ?? CalendarEventPriority.MEDIUM,
        location: dto.location,
        notes: dto.notes,
        assignedAgentId: dto.assignedAgentId,
        personId: dto.personId,
        listingId: dto.listingId
      }
    })

    return event
  }

  async update(eventId: string, dto: UpdateCalendarEventDto) {
    const existing = await this.prisma.calendarEvent.findUnique({ where: { id: eventId } })

    if (!existing) {
      throw new NotFoundException('Calendar event not found')
    }

    const updated = await this.prisma.calendarEvent.update({
      where: { id: eventId },
      data: {
        title: dto.title,
        description: dto.description,
        startAt: dto.startAt ? new Date(dto.startAt) : undefined,
        endAt: dto.endAt ? new Date(dto.endAt) : undefined,
        eventType: dto.eventType,
        status: dto.status,
        priority: dto.priority,
        location: dto.location,
        notes: dto.notes,
        assignedAgentId: dto.assignedAgentId,
        personId: dto.personId,
        listingId: dto.listingId
      }
    })

    return updated
  }

  async remove(eventId: string) {
    const existing = await this.prisma.calendarEvent.findUnique({ where: { id: eventId } })
    if (!existing) {
      throw new NotFoundException('Calendar event not found')
    }
    await this.prisma.calendarEvent.delete({ where: { id: eventId } })
  }
}
