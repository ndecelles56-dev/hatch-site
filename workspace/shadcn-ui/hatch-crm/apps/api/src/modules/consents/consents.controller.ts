import { Body, Controller, Param, Post } from '@nestjs/common';

import { ConsentsService } from './consents.service';
import { AddConsentDto } from './dto/add-consent.dto';
import { RevokeConsentDto } from './dto/revoke-consent.dto';

@Controller('contacts/:personId/consents')
export class ConsentsController {
  constructor(private readonly consents: ConsentsService) {}

  @Post()
  async addConsent(@Param('personId') personId: string, @Body() dto: AddConsentDto) {
    return this.consents.addConsent({ ...dto, personId });
  }

  @Post(':channel/revoke')
  async revokeConsent(
    @Param('personId') personId: string,
    @Param('channel') channel: string,
    @Body() dto: RevokeConsentDto
  ) {
    return this.consents.revokeConsent({ ...dto, personId, channel: channel.toUpperCase() as any });
  }
}
