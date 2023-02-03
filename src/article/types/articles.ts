import { Article } from '@prisma/client';

export interface IArticles {
  articles: Article[];
  articlesCount: number;
}
