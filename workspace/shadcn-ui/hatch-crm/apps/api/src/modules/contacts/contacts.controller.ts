import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

import { SavedView } from '@hatch/db';

import { resolveRequestContext } from '../common/request-context';
import {
  ContactsService,
  type ContactDetails,
  type ContactListResponse,
  type CreateContactResult
} from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { ListContactsQueryDto } from './dto/list-contacts.dto';
import { SaveViewDto } from './dto/save-view.dto';
import { AssignOwnerDto } from './dto/assign-owner.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contacts: ContactsService) {}

  @Get()
  async listContacts(
    @Query() query: ListContactsQueryDto,
    @Req() req: FastifyRequest
  ): Promise<ContactListResponse> {
    const ctx = resolveRequestContext(req);
    return this.contacts.list(query, ctx);
  }

  @Post()
  async createContact(
    @Body() dto: CreateContactDto,
    @Req() req: FastifyRequest
  ): Promise<CreateContactResult> {
    const ctx = resolveRequestContext(req);
    if (!dto.ownerId) {
      dto.ownerId = ctx.userId;
    }
    return this.contacts.create(dto, ctx);
  }

  @Get('views')
  async listViews(@Query('tenantId') tenantId: string, @Req() req: FastifyRequest): Promise<SavedView[]> {
    const ctx = resolveRequestContext(req);
    const resolvedTenantId = tenantId ?? ctx.tenantId;
    if (!resolvedTenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.contacts.listViews(resolvedTenantId, ctx);
  }

  @Post('views')
  async saveView(@Body() dto: SaveViewDto, @Req() req: FastifyRequest): Promise<SavedView> {
    const ctx = resolveRequestContext(req);
    let filters: unknown = {};
    if (dto.filters) {
      try {
        filters = JSON.parse(dto.filters);
      } catch (error) {
        throw new BadRequestException('filters must be valid JSON');
      }
    }
    return this.contacts.saveView(dto.tenantId, ctx, {
      name: dto.name,
      filters,
      isDefault: dto.isDefault
    });
  }

  @Delete('views/:id')
  async deleteView(@Param('id') id: string, @Query('tenantId') tenantId: string, @Req() req: FastifyRequest) {
    const ctx = resolveRequestContext(req);
    const resolvedTenantId = tenantId ?? ctx.tenantId;
    if (!resolvedTenantId) {
      throw new BadRequestException('tenantId is required');
    }
    await this.contacts.deleteView(id, resolvedTenantId, ctx);
    return { id };
  }

  @Get(':id')
  async getContact(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
    @Req() req: FastifyRequest
  ): Promise<ContactDetails> {
    const ctx = resolveRequestContext(req);
    const resolvedTenantId = tenantId ?? ctx.tenantId;
    if (!resolvedTenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.contacts.getById(id, resolvedTenantId, ctx);
  }

  @Patch(':id')
  async updateContact(
    @Param('id') id: string,
    @Body() dto: UpdateContactDto,
    @Req() req: FastifyRequest
  ): Promise<ContactDetails> {
    const ctx = resolveRequestContext(req);
    const tenantId = dto.tenantId ?? ctx.tenantId;
    if (!tenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.contacts.update(id, tenantId, dto, ctx);
  }

  @Delete(':id')
  async deleteContact(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
    @Req() req: FastifyRequest
  ) {
    const ctx = resolveRequestContext(req);
    const resolvedTenantId = tenantId ?? ctx.tenantId;
    if (!resolvedTenantId) {
      throw new BadRequestException('tenantId is required');
    }
    await this.contacts.remove(id, resolvedTenantId, ctx);
    return { id };
  }

  @Post(':id/restore')
  async restoreContact(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
    @Req() req: FastifyRequest
  ): Promise<ContactDetails> {
    const ctx = resolveRequestContext(req);
    const resolvedTenantId = tenantId ?? ctx.tenantId;
    if (!resolvedTenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.contacts.restore(id, resolvedTenantId, ctx);
  }

  @Post(':id/assign')
  async assignOwner(
    @Param('id') id: string,
    @Body() dto: AssignOwnerDto,
    @Req() req: FastifyRequest
  ): Promise<ContactDetails> {
    const ctx = resolveRequestContext(req);
    const tenantId = dto.tenantId ?? ctx.tenantId;
    if (!tenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.contacts.assignOwner(id, tenantId, dto.ownerId, { notify: dto.notify ?? false, reason: dto.reason }, ctx);
  }

}
