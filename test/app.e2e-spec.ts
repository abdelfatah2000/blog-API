import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { ConfigService } from '@nestjs/config';
import { SigninDto, SignupDto, UpdateDto } from 'src/auth/dto';
import { PrismaService } from '../src/prisma/prisma.service';
import { CreateArticleDto, EditArticleDto } from 'src/article/dto';

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

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    pactum.request.setBaseUrl(`http://localhost:${configService.get('PORT')}`);
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
      it('should throw if email already used', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
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
          .expectStatus(200)
          .stores('access_token', 'access_token')
          .stores('refresh_token', 'refresh_token');
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
    describe('Edit User', () => {
      const dto: UpdateDto = {
        email: '7oda596@gmail.com',
      };
      it('should edit user', () => {
        return pactum
          .spec()
          .put('/auth/update')
          .withHeaders({ Authorization: `Bearer $S{access_token}` })
          .withBody(dto)
          .expectStatus(202);
      });
      it('should throw if access token empty', () => {
        return pactum
          .spec()
          .put('/auth/update')
          .withBody(dto)
          .expectStatus(401)
          .expectBody({ message: 'Unauthorized', statusCode: 401 });
      });
    });
    describe('Get My Data', () => {
      it('should get my data', () => {
        return pactum
          .spec()
          .get('/auth/me')
          .withHeaders({ Authorization: 'Bearer $S{access_token}' })
          .expectStatus(200);
      });
      it('should throw if access token empty', () => {
        return pactum
          .spec()
          .get('/auth/me')
          .expectStatus(401)
          .expectBody({ message: 'Unauthorized', statusCode: 401 });
      });
    });
  });
  describe('Article', () => {
    describe('Create Article', () => {
      const dto: CreateArticleDto = {
        title: 'First Blog',
        describtion: 'A Blog',
        body: 'Hello',
      };
      it('should create article', () => {
        return pactum
          .spec()
          .post('/article/create')
          .withHeaders({ Authorization: 'Bearer $S{access_token}' })
          .withBody(dto)
          .expectStatus(202)
          .stores('articleId', 'id')
          .stores('authorId', 'authorId');
      });
      it('should throw if body empty', () => {
        return pactum
          .spec()
          .post('/article/create')
          .withHeaders({ Authorization: 'Bearer $S{access_token}' })
          .expectStatus(400);
      });
      it('should throw of access token empty', () => {
        return pactum
          .spec()
          .post('/article/create')
          .withBody(dto)
          .expectStatus(401)
          .expectBody({ message: 'Unauthorized', statusCode: 401 });
      });
    });
    describe('Get Author Articles', () => {
      it('should get author articles', () => {
        return pactum
          .spec()
          .get('/article/authorArticles/{id}')
          .withPathParams('id', '$S{authorId}')
          .withHeaders({ Authorization: 'Bearer $S{access_token}' })
          .expectStatus(200);
      });
    });
    describe('Edit Article', () => {
      const dto: EditArticleDto = {
        title: 'NestJs Article',
        body: 'Hello fron NestJS',
      };
      it('should edit article', () => {
        return pactum
          .spec()
          .put('/article/edit/{id}')
          .withPathParams('id', '$S{articleId}')
          .withBody(dto)
          .withHeaders({ Authorization: 'Bearer $S{access_token}' })
          .expectStatus(202);
      });
    });
    describe('Get Article By Id', () => {
      it('should get article', () => {
        return pactum
          .spec()
          .get('/article/get/{id}')
          .withHeaders({ Authorization: 'Bearer $S{access_token}' })
          .withPathParams('id', '$S{articleId}')
          .expectStatus(200);
      });
    });
    describe('Delete Article By Id', () => {
      it('should delete article', () => {
        return pactum
          .spec()
          .delete('/article/delete/{id}')
          .withPathParams('id', '$S{articleId}')
          .withHeaders({ Authorization: 'Bearer $S{access_token}' })
          .expectStatus(202);
      });
    });
  });
});
