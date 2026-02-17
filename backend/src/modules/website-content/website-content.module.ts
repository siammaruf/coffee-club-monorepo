import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HeroSlide } from './entities/hero-slide.entity';
import { Advantage } from './entities/advantage.entity';
import { Testimonial } from './entities/testimonial.entity';
import { WebsiteContentService } from './website-content.service';
import { WebsiteContentController } from './website-content.controller';
import { SettingsModule } from '../settings/settings.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HeroSlide, Advantage, Testimonial]),
    SettingsModule,
    CloudinaryModule,
  ],
  controllers: [WebsiteContentController],
  providers: [WebsiteContentService],
  exports: [WebsiteContentService],
})
export class WebsiteContentModule {}
