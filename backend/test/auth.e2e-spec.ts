import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/modules/auth/entities/user.entity';
import { AuthModule } from '../src/modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  const mockUserRepo = {
    findOne: jest.fn(),
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((user) => Promise.resolve({ id: 'user-id-123', ...user })),
    update: jest.fn().mockResolvedValue(null),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
        JwtModule.register({ secret: 'test-secret' }),
        AuthModule,
      ],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(mockUserRepo)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/auth/register (POST) - fails with invalid input', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        fullName: '',
        phone: 'invalid-phone',
        password: '123',
      })
      .expect(400);
  });
});
