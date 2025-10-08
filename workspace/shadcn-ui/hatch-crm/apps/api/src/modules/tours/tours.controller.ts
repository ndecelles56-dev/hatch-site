import { BadRequestException, Body, Controller, Param, Post, Req } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

import { resolveRequestContext } from '../common/request-context';
import { RequestTourDto } from './dto/request-tour.dto';
import { ToursService } from './tours.service';

@Controller('tours')
export class ToursController {
  constructor(private readonly tours: ToursService) {}

  @Post()
  async requestTour(@Body() dto: RequestTourDto) {
    return this.tours.requestTour(dto);
  }

  @Post(':id/kept')
  async markKept(@Param('id') id: string, @Req() req: FastifyRequest) {
    const ctx = resolveRequestContext(req);
    const tenantId = ctx.tenantId;
    if (!tenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.tours.markKept({
      tourId: id,
      tenantId,
      actorUserId: ctx.userId
    });
  }
}
