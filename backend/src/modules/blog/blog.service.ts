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
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogPost)
    private readonly blogPostRepository: Repository<BlogPost>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(dto: CreateBlogPostDto): Promise<BlogPost> {
    const slug = await this.generateUniqueSlug(dto.title);
    const image = await this.cloudinaryService.ensureCloudinaryUrl(
      dto.image || null,
      'coffee-club/blog',
    );

    const post = this.blogPostRepository.create({
      ...dto,
      slug,
      image,
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
      .addOrderBy('post.id', 'ASC')
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
    if (dto.image !== undefined) {
      post.image = await this.cloudinaryService.ensureCloudinaryUrl(
        dto.image || null,
        'coffee-club/blog',
      );
    }
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
    await this.blogPostRepository.softDelete(id);
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
      .addOrderBy('post.id', 'ASC')
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

    async bulkSoftDelete(ids: string[]): Promise<void> {
        await this.blogPostRepository.softDelete(ids);
    }

    async findTrashed(options: { page: number, limit: number, search?: string }) {
        const { page, limit, search } = options;
        const query = this.blogPostRepository.createQueryBuilder('post')
            .withDeleted()
            .where('post.deleted_at IS NOT NULL');

        if (search) {
            query.andWhere('LOWER(post.title) LIKE :search', { search: `%${search.toLowerCase()}%` });
        }

        query.orderBy('post.deleted_at', 'DESC')
            .addOrderBy('post.id', 'ASC')
            .skip((page - 1) * limit)
            .take(limit);

        const [data, total] = await query.getManyAndCount();
        return { data, total };
    }

    async restore(id: string): Promise<void> {
        await this.blogPostRepository.restore(id);
    }

    async permanentDelete(id: string): Promise<void> {
        const entity = await this.blogPostRepository.findOne({ where: { id }, withDeleted: true });
        if (!entity) {
            throw new NotFoundException(`Record with ID ${id} not found`);
        }
        if (!entity.deleted_at) {
            throw new NotFoundException(`Record with ID ${id} is not in trash`);
        }
        await this.blogPostRepository.delete(id);
    }

    async bulkRestore(ids: string[]): Promise<void> {
        await this.blogPostRepository.restore(ids);
    }

    async bulkPermanentDelete(ids: string[]): Promise<{ deleted: string[]; failed: { id: string; reason: string }[] }> {
        const deleted: string[] = [];
        const failed: { id: string; reason: string }[] = [];

        for (const id of ids) {
            try {
                const entity = await this.blogPostRepository.findOne({
                    where: { id },
                    withDeleted: true,
                });
                if (!entity) {
                    failed.push({ id, reason: 'Record not found' });
                    continue;
                }
                if (!entity.deleted_at) {
                    failed.push({ id, reason: 'Record is not in trash' });
                    continue;
                }
                await this.blogPostRepository.delete(id);
                deleted.push(id);
            } catch (error) {
                failed.push({ id, reason: error?.message || 'Unknown error' });
            }
        }

        return { deleted, failed };
    }
}
