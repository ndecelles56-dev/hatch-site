import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'

import { TeamService } from './team.service'
import { CreateTeamMemberDto } from './dto/create-team-member.dto'
import { UpdateTeamMemberDto } from './dto/update-team-member.dto'

@Controller('team')
export class TeamController {
  constructor(private readonly team: TeamService) {}

  @Get()
  async list(@Query('tenantId') tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('tenantId is required')
    }
    return this.team.list(tenantId)
  }

  @Post()
  async create(@Body() dto: CreateTeamMemberDto) {
    if (!dto.tenantId) {
      throw new BadRequestException('tenantId is required')
    }
    return this.team.create(dto)
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTeamMemberDto) {
    return this.team.update(id, dto)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.team.remove(id)
  }
}
