import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Discount } from '../../discount/entities/discount.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Item } from '../../items/entities/item.entity';
import { Category } from '../../categories/entities/category.entity';
import { DiscountApplicationType } from '../enum/discount-application-type.enum';

@Entity('discount_applications')
export class DiscountApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: DiscountApplicationType,
    default: DiscountApplicationType.ALL_ORDERS,
    nullable: false
  })
  discount_type: DiscountApplicationType;

  @ManyToOne(() => Discount, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'discount_id' })
  discount: Discount;

  @ManyToMany(() => Customer)
  @JoinTable({
    name: 'discount_application_customers',
    joinColumn: { name: 'discount_application_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'customer_id', referencedColumnName: 'id' }
  })
  customers: Customer[];

  @ManyToMany(() => Item)
  @JoinTable({
    name: 'discount_application_products',
    joinColumn: { name: 'discount_application_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'product_id', referencedColumnName: 'id' }
  })
  products: Item[];

  @ManyToMany(() => Category)
  @JoinTable({
    name: 'discount_application_categories',
    joinColumn: { name: 'discount_application_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' }
  })
  categories: Category[];

  @Column({ nullable: true })
  note?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}