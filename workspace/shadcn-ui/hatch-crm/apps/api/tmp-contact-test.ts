import { ContactsService } from './src/modules/contacts/contacts.service'
import { PrismaService } from './src/modules/prisma/prisma.service'
import { OutboxService } from './src/modules/outbox/outbox.service'
import { ConfigModule, ConfigService } from '@nestjs/config'

async function main() {
  ConfigModule.forRoot({
    isGlobal: true,
    load: [() => ({
      database: {
        url: process.env.DATABASE_URL,
      },
      outbox: {
        maxAttempts: 5,
      },
    })],
  })
  const config = new ConfigService({})
  const prisma = new PrismaService(config)
  await prisma.onModuleInit()
  const outbox = new OutboxService(prisma, config)
  const contacts = new ContactsService(prisma, outbox)
  const list = await contacts.list('tenant-hatch')
  console.log(list)
  await prisma.onModuleDestroy()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
