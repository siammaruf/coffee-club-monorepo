import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { KitchenItems } from '../../kitchen-items/entities/kitchen-item.entity';

@Entity('kitchen_stock')
export class KitchenStock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  kitchen_item_id: string;

  @ManyToOne(() => KitchenItems, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'kitchen_item_id' })
  kitchen_item: KitchenItems;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  purchase_price: number;

  @Column({ type: 'date' })
  purchase_date: string;

  @Column({ nullable: true, type: 'text' })
  note: string | null;

  @DeleteDateColumn()
  deleted_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
