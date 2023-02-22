import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleDto, EditArticleDto } from './dto';

const articleMap = (count, articles) => {
  const newArticle = articles.map((item) => {
    return item;
  });
  return { newArticle, count };
};
const select = {
  id: true,
  body: true,
  describtion: true,
  title: true,
  authorId: true,
  createdAt: true,
};

@Injectable()
export class ArticleService {
  constructor(private prisma: PrismaService) {}

  async create(authorId: number, dto: CreateArticleDto): Promise<any> {
    const data = {
      ...dto,
      authorId,
    };
    const article = await this.prisma.article.create({ data, select });
    return article;
  }
  async feed(): Promise<any> {
    const articles = await this.prisma.article.findMany({
      select,
      orderBy: { createdAt: 'desc' },
    });
    const count = await this.prisma.article.count();
    const newArticles = articleMap(count, articles);
    return newArticles;
  }

  async findAuthorArticles(authorId: number): Promise<any> {
    const articles = await this.prisma.article.findMany({
      where: { authorId },
      select,
      orderBy: { createdAt: 'desc' },
    });
    const count = await this.prisma.article.count({ where: { authorId } });
    const newArticles = articleMap(count, articles);
    return newArticles;
  }

  async update(articleId: number, data: EditArticleDto): Promise<any> {
    const article = await this.prisma.article.update({
      where: { id: articleId },
      data,
      select,
    });
    return article;
  }

  async findOne(id: number): Promise<any> {
    const article = await this.prisma.article.findUnique({
      where: { id },
      select,
    });
    return article;
  }

  async delete(id: number): Promise<string> {
    await this.prisma.article.delete({ where: { id } });
    return 'Article Deleted';
  }
}
