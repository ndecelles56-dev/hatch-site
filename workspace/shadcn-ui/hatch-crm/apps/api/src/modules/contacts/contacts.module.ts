import { Module } from '@nestjs/common';

import { OutboxModule } from '../outbox/outbox.module';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';

@Module({
  imports: [OutboxModule],
  controllers: [ContactsController],
  providers: [ContactsService]
})
export class ContactsModule {}
