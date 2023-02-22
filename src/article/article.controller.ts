import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Put,
  Get,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto, EditArticleDto } from './dto';
import { GetCurrentUser } from '../common/decorators';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IArticle, IArticles } from './types';

@Controller('article')
@ApiTags('Article')
export class ArticleController {
  constructor(private articleService: ArticleService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create Add Article' })
  @HttpCode(HttpStatus.ACCEPTED)
  createArticle(
    @Body() dto: CreateArticleDto,
    @GetCurrentUser('userId') userId: number,
  ): Promise<IArticle> {
    return this.articleService.create(userId, dto);
  }

  @Get('feed')
  @ApiOperation({ summary: 'Get All Articles' })
  @HttpCode(HttpStatus.OK)
  getArticles(): Promise<IArticles> {
    return this.articleService.feed();
  }

  @Get('authorArticles/:id')
  @ApiOperation({ summary: 'Get All Author Articles' })
  @HttpCode(HttpStatus.OK)
  getAuthorArticles(
    @Param('id', ParseIntPipe) authorId: number,
  ): Promise<IArticles> {
    return this.articleService.findAuthorArticles(authorId);
  }

  @Put('edit/:id')
  @ApiOperation({ summary: 'Edit Article' })
  @HttpCode(HttpStatus.ACCEPTED)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EditArticleDto,
  ): Promise<IArticle> {
    return this.articleService.update(id, dto);
  }

  @Get('get/:id')
  @ApiOperation({ summary: 'Get Article' })
  @HttpCode(HttpStatus.OK)
  getArticle(@Param('id', ParseIntPipe) id: number): Promise<IArticle> {
    return this.articleService.findOne(id);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete Article' })
  @HttpCode(HttpStatus.ACCEPTED)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.articleService.delete(id);
  }
}
