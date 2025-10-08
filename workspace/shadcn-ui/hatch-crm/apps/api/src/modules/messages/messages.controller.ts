import { Body, Controller, Post } from '@nestjs/common';
import type { Message } from '@hatch/db';

import { InboundMessageDto } from './dto/inbound-message.dto';
import { SendEmailDto } from './dto/send-email.dto';
import { SendSmsDto } from './dto/send-sms.dto';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messages: MessagesService) {}

  @Post('sms')
  async sendSms(@Body() dto: SendSmsDto): Promise<Message> {
    return this.messages.sendSms(dto);
  }

  @Post('email')
  async sendEmail(@Body() dto: SendEmailDto): Promise<Message> {
    return this.messages.sendEmail(dto);
  }

  @Post('inbound')
  async ingestInbound(@Body() dto: InboundMessageDto): Promise<Message> {
    return this.messages.ingestInbound(dto);
  }
}
