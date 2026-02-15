import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Item } from "./entities/item.entity";
import { ItemVariation } from "./entities/item-variation.entity";
import { ItemService } from "./providers/item.service";
import { ItemController } from "./item.controller";
import { CategoryModule } from "../categories/category.module";
import { Category } from "../categories/entities/category.entity";
import { CloudinaryModule } from "../cloudinary/cloudinary.module";
import { CacheModule } from "../cache/cache.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Item, ItemVariation, Category]),
    CategoryModule,
    CloudinaryModule,
    CacheModule,
  ],
  controllers: [ItemController],
  providers: [ItemService],
  exports: [ItemService],
})
export class ItemModule {}