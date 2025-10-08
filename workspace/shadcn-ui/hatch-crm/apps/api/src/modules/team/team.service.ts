import { Injectable, NotFoundException } from '@nestjs/common'
import { TeamMember } from '@hatch/db'

import { PrismaService } from '../prisma/prisma.service'
import { CreateTeamMemberDto } from './dto/create-team-member.dto'
import { UpdateTeamMemberDto } from './dto/update-team-member.dto'

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string): Promise<TeamMember[]> {
    try {
      return await this.prisma.teamMember.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'asc' }
      })
    } catch (error) {
      console.error('Failed to list team members', { tenantId, error })
      throw error
    }
  }

  create(dto: CreateTeamMemberDto): Promise<TeamMember> {
    return this.prisma.teamMember.create({
      data: {
        tenantId: dto.tenantId,
        orgId: dto.orgId ?? null,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        role: dto.role,
        status: dto.status ?? 'active',
        experienceYears: dto.experienceYears ?? 0,
        rating: dto.rating ?? 0,
        totalSales: dto.totalSales ?? 0,
        dealsInProgress: dto.dealsInProgress ?? 0,
        openLeads: dto.openLeads ?? 0,
        responseTimeHours: dto.responseTimeHours ?? 0,
        notes: dto.notes ?? null,
        joinedAt: dto.joinedAt ?? undefined,
        lastActiveAt: dto.lastActiveAt ?? undefined
      }
    })
  }

  async update(id: string, dto: UpdateTeamMemberDto): Promise<TeamMember> {
    const existing = await this.prisma.teamMember.findUnique({ where: { id } })
    if (!existing) {
      throw new NotFoundException('Team member not found')
    }

    return this.prisma.teamMember.update({
      where: { id },
      data: {
        tenantId: dto.tenantId ?? undefined,
        orgId: dto.orgId ?? undefined,
        name: dto.name ?? undefined,
        email: dto.email ?? undefined,
        phone: dto.phone ?? undefined,
        role: dto.role ?? undefined,
        status: dto.status ?? undefined,
        experienceYears: dto.experienceYears ?? undefined,
        rating: dto.rating ?? undefined,
        totalSales: dto.totalSales ?? undefined,
        dealsInProgress: dto.dealsInProgress ?? undefined,
        openLeads: dto.openLeads ?? undefined,
        responseTimeHours: dto.responseTimeHours ?? undefined,
        notes: dto.notes ?? undefined,
        lastActiveAt: dto.lastActiveAt ?? undefined,
        joinedAt: dto.joinedAt ?? undefined
      }
    })
  }

  async remove(id: string): Promise<{ id: string }> {
    const existing = await this.prisma.teamMember.findUnique({ where: { id } })
    if (!existing) {
      throw new NotFoundException('Team member not found')
    }
    await this.prisma.teamMember.delete({ where: { id } })
    return { id }
  }
}
