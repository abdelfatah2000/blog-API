import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { ConfigService } from '@nestjs/config';
import { SigninDto, SignupDto } from 'src/auth/dto';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    const configService = app.get(ConfigService);

    await app.init();
    await app.listen(configService.get('PORT'));

    pactum.request.setBaseUrl(`http://localhost:${configService.get('PORT')}`);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    describe('Signup', () => {
      const dto: SignupDto = {
        name: '7oda',
        email: '7oda@gmail.com',
        phone: 1200447463,
        password: '123456',
      };
      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(202);
      });
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            name: dto.name,
            password: dto.password,
            phone: dto.phone,
          })
          .expectStatus(400);
      });
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
          })
          .expectStatus(400);
      });
      it('should throw if name empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
            password: dto.password,
            phone: dto.phone,
          })
          .expectStatus(400);
      });
      it('should throw if email invalid', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: '7oda',
            name: dto.name,
            password: dto.password,
            phone: dto.phone,
          })
          .expectStatus(400);
      });
    });
    describe('Signin', () => {
      const dto: SigninDto = {
        email: '7oda@gmail.com',
        password: '123456',
      };
      it('should signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200);
      });
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ password: dto.password })
          .expectStatus(400);
      });
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ email: dto.email })
          .expectStatus(400);
      });
      it('should throw if email invalid', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ password: dto.password, email: '7oda77@gmail.com' })
          .expectStatus(400);
      });
      it('should throw if password invalid', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ password: '159357', email: dto.email })
          .expectStatus(400);
      });
    });
  });
  // describe('User', () => {});
  // describe('Article', () => {});
});
