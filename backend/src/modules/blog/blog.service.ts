import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { BlogPost } from './entities/blog-post.entity';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { generateSlug } from '../../common/utils/string-utils';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogPost)
    private readonly blogPostRepository: Repository<BlogPost>,
  ) {}

  async create(dto: CreateBlogPostDto): Promise<BlogPost> {
    const slug = await this.generateUniqueSlug(dto.title);

    const post = this.blogPostRepository.create({
      ...dto,
      slug,
      image: dto.image || null,
      is_published: dto.is_published || false,
      published_at: dto.is_published ? new Date() : null,
    });

    return this.blogPostRepository.save(post);
  }

  async findAll(options: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<{ data: BlogPost[]; total: number }> {
    const { page, limit, search } = options;

    const query = this.blogPostRepository.createQueryBuilder('post');

    if (search) {
      query.andWhere(
        '(LOWER(post.title) LIKE :search OR LOWER(post.excerpt) LIKE :search OR LOWER(post.author) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    query.orderBy('post.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string): Promise<BlogPost> {
    const post = await this.blogPostRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Blog post with ID ${id} not found`);
    }
    return post;
  }

  async update(id: string, dto: UpdateBlogPostDto): Promise<BlogPost> {
    const post = await this.findOne(id);

    if (dto.title && dto.title !== post.title) {
      post.slug = await this.generateUniqueSlug(dto.title, id);
    }

    if (dto.title !== undefined) post.title = dto.title;
    if (dto.excerpt !== undefined) post.excerpt = dto.excerpt;
    if (dto.content !== undefined) post.content = dto.content;
    if (dto.image !== undefined) post.image = dto.image || null;
    if (dto.author !== undefined) post.author = dto.author;

    if (dto.is_published !== undefined) {
      if (dto.is_published && !post.is_published) {
        post.published_at = new Date();
      } else if (!dto.is_published) {
        post.published_at = null;
      }
      post.is_published = dto.is_published;
    }

    return this.blogPostRepository.save(post);
  }

  async remove(id: string): Promise<void> {
    const post = await this.findOne(id);
    await this.blogPostRepository.remove(post);
  }

  // Public methods

  async findPublished(options: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<{ data: BlogPost[]; total: number }> {
    const { page, limit, search } = options;

    const query = this.blogPostRepository.createQueryBuilder('post')
      .where('post.is_published = :published', { published: true });

    if (search) {
      query.andWhere(
        '(LOWER(post.title) LIKE :search OR LOWER(post.excerpt) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    query.orderBy('post.published_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  async findPublishedBySlug(slug: string): Promise<BlogPost> {
    const post = await this.blogPostRepository.findOne({
      where: { slug, is_published: true },
    });
    if (!post) {
      throw new NotFoundException(`Blog post with slug "${slug}" not found`);
    }
    return post;
  }

  // Helpers

  private async generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
    const baseSlug = generateSlug(title);
    let slug = baseSlug;
    let counter = 0;

    while (true) {
      const whereCondition: any = { slug };
      if (excludeId) {
        const existing = await this.blogPostRepository.findOne({
          where: { slug, id: Not(excludeId) },
        });
        if (!existing) break;
      } else {
        const existing = await this.blogPostRepository.findOne({
          where: { slug },
        });
        if (!existing) break;
      }
      counter++;
      slug = `${baseSlug}-${counter}`;
    }

    return slug;
  }
}
