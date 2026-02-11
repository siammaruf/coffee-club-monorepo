import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryController } from './category.controller';
import { CategoryService } from './providers/category.service';
import { Category } from './entities/category.entity';
import { CacheModule } from '../cache/cache.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Category]),
        CacheModule
    ],
    controllers: [CategoryController],
    providers: [CategoryService],
    exports: [CategoryService],
})
export class CategoryModule {}