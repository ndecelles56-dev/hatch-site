import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { TourStatus } from '@hatch/db';

import { OutboxService } from '../outbox/outbox.service';
import { PrismaService } from '../prisma/prisma.service';
import { RoutingService } from '../routing/routing.service';
import { RequestTourDto } from './dto/request-tour.dto';

@Injectable()
export class ToursService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
    private readonly routing: RoutingService
  ) {}

  async requestTour(dto: RequestTourDto) {
    const person = await this.prisma.person.findFirst({
      where: { id: dto.personId, tenantId: dto.tenantId }
    });

    if (!person) {
      throw new ConflictException('Person not found');
    }

    const activeBuyerRep = await this.prisma.agreement.findFirst({
      where: {
        tenantId: dto.tenantId,
        personId: dto.personId,
        type: 'BUYER_REP',
        status: 'SIGNED',
        OR: [{ expiryDate: null }, { expiryDate: { gte: new Date() } }]
      }
    });

    if (!activeBuyerRep && !dto.overrideBuyerRep) {
      throw new ConflictException({
        buyerRepRequired: true,
        message: 'Signed buyer-rep agreement required before booking tour.',
        action: {
          type: 'SIGN_AGREEMENT',
          url: `/agreements/buyer-rep?personId=${dto.personId}`
        }
      });
    }

    const tour = await this.prisma.tour.create({
      data: {
        tenantId: dto.tenantId,
        personId: dto.personId,
        listingId: dto.listingId,
        status: TourStatus.REQUESTED,
        startAt: new Date(dto.startAt),
        endAt: new Date(dto.endAt),
        source: dto.source,
        agentId: dto.overrideBuyerRep ? dto.overrideUserId : undefined
      }
    });

    const listing = await this.prisma.listing.findUnique({ where: { id: dto.listingId } });

    const routingResult = await this.routing.assign({
      tenantId: dto.tenantId,
      person,
      listing: listing
        ? {
            id: listing.id,
            price: listing.price ? Number(listing.price) : null,
            city: listing.city,
            state: listing.state,
            postalCode: listing.postalCode
          }
        : undefined
    });

    const assignedAgent = routingResult.selectedAgents[0];

    if (assignedAgent) {
      await this.prisma.tour.update({
        where: { id: tour.id },
        data: {
          status: TourStatus.CONFIRMED,
          agentId: assignedAgent.userId,
          routingScore: assignedAgent.score
        }
      });
    }

    await this.prisma.activity.create({
      data: {
        tenantId: dto.tenantId,
        personId: dto.personId,
        tourId: tour.id,
        type: assignedAgent ? 'TOUR_CONFIRMED' : 'TOUR_REQUESTED',
        payload: {
          tourId: tour.id,
          assignedAgent: assignedAgent?.userId,
          overrideReason: dto.overrideReason
        }
      }
    });

    await this.outbox.enqueue({
      tenantId: dto.tenantId,
      eventType: assignedAgent ? 'tour.confirmed' : 'tour.requested',
      occurredAt: new Date().toISOString(),
      resource: {
        id: tour.id,
        type: 'tour'
      },
      data: {
        tourId: tour.id,
        personId: dto.personId,
        agentId: assignedAgent?.userId,
        override: dto.overrideBuyerRep
      }
    });

    return {
      tourId: tour.id,
      status: assignedAgent ? 'CONFIRMED' : 'REQUESTED',
      assignedAgent,
      routingResult
    };
  }

  async markKept(params: { tenantId: string; tourId: string; actorUserId?: string }) {
    const tour = await this.prisma.tour.findFirst({
      where: { id: params.tourId, tenantId: params.tenantId }
    });

    if (!tour) {
      throw new NotFoundException('Tour not found');
    }

    if (tour.status === TourStatus.KEPT) {
      return { tourId: tour.id, status: 'KEPT' };
    }

    const updated = await this.prisma.tour.update({
      where: { id: tour.id },
      data: { status: TourStatus.KEPT }
    });

    await this.prisma.activity.create({
      data: {
        tenantId: params.tenantId,
        personId: tour.personId,
        tourId: tour.id,
        userId: params.actorUserId,
        type: 'TOUR_KEPT',
        payload: {
          tourId: tour.id,
          status: 'KEPT'
        }
      }
    });

    await this.outbox.enqueue({
      tenantId: params.tenantId,
      eventType: 'tour.kept',
      occurredAt: new Date().toISOString(),
      resource: {
        id: tour.id,
        type: 'tour'
      },
      data: {
        tourId: tour.id,
        personId: tour.personId,
        agentId: tour.agentId
      }
    });

    if (tour.personId) {
      await this.routing.recordKeptAppointment({
        tenantId: params.tenantId,
        leadId: tour.personId,
        actorUserId: params.actorUserId,
        occurredAt: new Date()
      });
    }

    return { tourId: updated.id, status: 'KEPT' };
  }
}
