import { Body, Controller, Param, Post } from '@nestjs/common';
import type { Agreement } from '@hatch/db';

import { AgreementsService } from './agreements.service';
import { CreateAgreementDto } from './dto/create-agreement.dto';
import { SignAgreementDto } from './dto/sign-agreement.dto';

@Controller('agreements')
export class AgreementsController {
  constructor(private readonly agreements: AgreementsService) {}

  @Post()
  async create(@Body() dto: CreateAgreementDto): Promise<Agreement> {
    return this.agreements.create(dto);
  }

  @Post(':id/sign')
  async sign(@Param('id') id: string, @Body() dto: SignAgreementDto): Promise<Agreement> {
    return this.agreements.sign(id, dto);
  }
}
