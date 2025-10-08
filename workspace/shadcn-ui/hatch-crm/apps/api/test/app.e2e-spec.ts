import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Hatch CRM API (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    prisma = app.get(PrismaService);
    await prisma.$transaction([
      prisma.message.deleteMany(),
      prisma.assignmentReason.deleteMany(),
      prisma.assignment.deleteMany(),
      prisma.activity.deleteMany(),
      prisma.tour.deleteMany(),
      prisma.agreement.deleteMany(),
      prisma.consent.deleteMany(),
      prisma.person.deleteMany(),
      prisma.user.deleteMany(),
      prisma.mLSProfile.deleteMany(),
      prisma.tenant.deleteMany(),
      prisma.organization.deleteMany()
    ]);

    await import('../../packages/db/src/seed');
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates a contact successfully', async () => {
    const tenant = await prisma.tenant.findFirstOrThrow();
    const organization = await prisma.organization.findFirstOrThrow();

    const response = await request(app.getHttpServer())
      .post('/contacts')
      .send({
        tenantId: tenant.id,
        organizationId: organization.id,
        firstName: 'Test',
        lastName: 'User',
        primaryEmail: 'test.user@example.com'
      })
      .expect(201);

    expect(response.body.id).toBeDefined();
  });

  it('blocks SMS send without consent', async () => {
    const tenant = await prisma.tenant.findFirstOrThrow();
    const person = await prisma.person.findUniqueOrThrow({ where: { id: 'contact-no-consent' } });
    const agent = await prisma.user.findFirstOrThrow({ where: { role: 'AGENT' } });

    const response = await request(app.getHttpServer())
      .post('/messages/sms')
      .send({
        tenantId: tenant.id,
        personId: person.id,
        userId: agent.id,
        from: '+14150000000',
        to: person.primaryPhone,
        body: 'Hello without consent',
        scope: 'PROMOTIONAL'
      });

    expect(response.status).toBe(403);
  });

  it('allows SMS send after capturing consent', async () => {
    const tenant = await prisma.tenant.findFirstOrThrow();
    const person = await prisma.person.findUniqueOrThrow({ where: { id: 'contact-no-consent' } });
    const agent = await prisma.user.findFirstOrThrow({ where: { role: 'AGENT' } });

    await request(app.getHttpServer())
      .post(`/contacts/${person.id}/consents`)
      .send({
        tenantId: tenant.id,
        personId: person.id,
        channel: 'SMS',
        scope: 'PROMOTIONAL',
        verbatimText: 'Opt in',
        source: 'test'
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/messages/sms')
      .send({
        tenantId: tenant.id,
        personId: person.id,
        userId: agent.id,
        from: '+14150000000',
        to: person.primaryPhone,
        body: 'Hello with consent',
        scope: 'PROMOTIONAL'
      });

    expect(response.status).toBe(201);
  });

  it('requires BBA before booking tour', async () => {
    const tenant = await prisma.tenant.findFirstOrThrow();
    const listing = await prisma.listing.findFirstOrThrow();

    const response = await request(app.getHttpServer())
      .post('/tours')
      .send({
        tenantId: tenant.id,
        personId: 'contact-no-consent',
        listingId: listing.id,
        startAt: new Date().toISOString(),
        endAt: new Date(Date.now() + 3600000).toISOString()
      });

    expect(response.status).toBe(409);
    expect(response.body.buyerRepRequired).toBe(true);
  });

  it('confirms tour after signing BBA', async () => {
    const tenant = await prisma.tenant.findFirstOrThrow();
    const listing = await prisma.listing.findFirstOrThrow();
    const contact = await prisma.person.findUniqueOrThrow({ where: { id: 'contact-no-consent' } });

    const agreement = await request(app.getHttpServer())
      .post('/agreements')
      .send({
        tenantId: tenant.id,
        personId: contact.id,
        type: 'BUYER_REP'
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/agreements/${agreement.body.id}/sign`)
      .send({
        tenantId: tenant.id,
        actorUserId: (await prisma.user.findFirstOrThrow({ where: { role: 'BROKER' } })).id
      })
      .expect(201);

    const tourResponse = await request(app.getHttpServer())
      .post('/tours')
      .send({
        tenantId: tenant.id,
        personId: contact.id,
        listingId: listing.id,
        startAt: new Date().toISOString(),
        endAt: new Date(Date.now() + 3600000).toISOString()
      })
      .expect(201);

    expect(tourResponse.body.status).toBe('CONFIRMED');
  });

  it('fails MLS preflight before profile configured then passes after', async () => {
    const tenant = await prisma.tenant.findFirstOrThrow();
    const profile = await prisma.mLSProfile.findFirstOrThrow();

    const failResponse = await request(app.getHttpServer())
      .post('/mls/preflight')
      .send({
        tenantId: tenant.id,
        mlsProfileId: profile.id,
        contentType: 'flyer',
        fieldsJson: '{}'
      })
      .expect(201);

    expect(failResponse.body.pass).toBe(false);

    const passResponse = await request(app.getHttpServer())
      .post('/mls/preflight')
      .send({
        tenantId: tenant.id,
        mlsProfileId: profile.id,
        contentType: 'flyer',
        fieldsJson: '{}',
        displayedDisclaimer: profile.disclaimerText
      })
      .expect(201);

    expect(passResponse.body.pass).toBe(true);
  });
});
