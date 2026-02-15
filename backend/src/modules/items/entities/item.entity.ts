import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ItemType } from "../enum/item-type.enum";
import { Category } from "../../categories/entities/category.entity";
import { ItemStatus } from "../enum/item-status.enum";

@Entity('items')
export class Item {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    name_bn: string;

    @Column({ unique: true })
    slug: string;

    @Column()
    description: string;

    @Column({
        type: 'enum',
        enum: ItemType,
        default: ItemType.BAR
    })
    type: ItemType;

    @Column({
        type: 'enum',
        enum: ItemStatus,
        default: ItemStatus.AVAILABLE
    })
    status: ItemStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    regular_price: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable:true })
    sale_price: number;

    @Column({ nullable: true })
    image: string;

    @ManyToMany(() => Category)
    @JoinTable({
      name: "item_categories",
      joinColumn: {
        name: "item_id",
        referencedColumnName: "id"
      },
      inverseJoinColumn: {
        name: "category_id",
        referencedColumnName: "id"
      }
    })
    categories: Category[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
